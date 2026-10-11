// Bundle installed OCR dependencies locally. No private images or credentials are read.
import { copyFile, mkdir, readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createHash } from 'node:crypto';

const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const modules = path.join(projectRoot, 'node_modules');
const assetRoot = path.join(projectRoot, 'dist', 'assets');
const ocrRoot = path.join(assetRoot, 'ocr');
const licenseRoot = path.join(assetRoot, 'licenses');
const files = [];
for (const dir of [ocrRoot, path.join(ocrRoot, 'core'), path.join(ocrRoot, 'lang'), licenseRoot]) await mkdir(dir, { recursive: true });

async function copyAsset(source, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
  const content = await readFile(destination);
  files.push({ path: path.relative(assetRoot, destination).replaceAll('\\', '/'), bytes: content.length, sha256: createHash('sha256').update(content).digest('hex') });
}
const packageMeta = name => readFile(path.join(modules, ...name.split('/'), 'package.json'), 'utf8').then(JSON.parse);
const tesseract = await packageMeta('tesseract.js');
const core = await packageMeta('tesseract.js-core');
const english = await packageMeta('@tesseract.js-data/eng');
if (tesseract.version !== '6.0.1' || english.version !== '1.0.0') throw new Error('The installed OCR dependencies differ from the pinned package versions.');

for (const name of ['tesseract.esm.min.js', 'tesseract.min.js', 'worker.min.js', 'tesseract.min.js.LICENSE.txt', 'worker.min.js.LICENSE.txt']) {
  await copyAsset(path.join(modules, 'tesseract.js', 'dist', name), path.join(ocrRoot, name));
}
const coreFiles = (await readdir(path.join(modules, 'tesseract.js-core'))).filter(name => /^tesseract-core(?:-simd)?(?:-lstm)?\.wasm(?:\.js)?$/.test(name));
if (coreFiles.length !== 8) throw new Error('Expected the four core variants with their WASM resources.');
for (const name of coreFiles) await copyAsset(path.join(modules, 'tesseract.js-core', name), path.join(ocrRoot, 'core', name));
await copyAsset(path.join(modules, '@tesseract.js-data', 'eng', '4.0.0_best_int', 'eng.traineddata.gz'), path.join(ocrRoot, 'lang', 'eng.traineddata.gz'));

// Preserve original installed license/notice files and package declarations for
// every dependency, including notices for dependencies bundled inside the worker.
const lock = JSON.parse(await readFile(path.join(projectRoot, 'package-lock.json'), 'utf8'));
const packages = [];
for (const location of Object.keys(lock.packages).filter(key => key.startsWith('node_modules/'))) {
  const directory = path.join(projectRoot, ...location.split('/'));
  const metadata = JSON.parse(await readFile(path.join(directory, 'package.json'), 'utf8'));
  const safeName = location.slice('node_modules/'.length).replaceAll('/', '__');
  const notices = [];
  for (const name of await readdir(directory)) {
    if (!/^(?:LICENSE|LICENCE|COPYING|NOTICE)(?:[._-].*)?$/i.test(name)) continue;
    if (!(await stat(path.join(directory, name))).isFile()) continue;
    const target = path.join(licenseRoot, safeName, name);
    await copyAsset(path.join(directory, name), target);
    notices.push(path.relative(assetRoot, target).replaceAll('\\', '/'));
  }
  packages.push({ name: metadata.name, version: metadata.version, declaredLicense: metadata.license ?? null, repository: metadata.repository ?? null, preservedNotices: notices });
}

// The npm English package declares MIT but omits its license text. The model
// repository publishes an Apache-2.0 LICENSE; preserve that upstream text too
// rather than replacing either declaration with an invented attribution.
const modelLicensePath = path.join(licenseRoot, 'naptha-tessdata-upstream.LICENSE');
let modelLicense;
try { modelLicense = await readFile(modelLicensePath, 'utf8'); }
catch {
  const response = await fetch('https://raw.githubusercontent.com/naptha/tessdata/gh-pages/LICENSE', { signal: AbortSignal.timeout(30_000) });
  if (!response.ok) throw new Error(`Could not preserve the upstream model license (${response.status}).`);
  modelLicense = await response.text();
  if (!modelLicense.includes('Apache License') || modelLicense.length < 8_000) throw new Error('Unexpected upstream license response.');
  await writeFile(modelLicensePath, modelLicense);
}
files.push({ path: path.relative(assetRoot, modelLicensePath).replaceAll('\\', '/'), bytes: Buffer.byteLength(modelLicense), sha256: createHash('sha256').update(modelLicense).digest('hex') });

// These dependencies are embedded in the published worker, but are upstream
// build dependencies and therefore absent from this project's production lock.
// Versions come from Tesseract.js v6.0.1's upstream lockfile; the published
// worker's extracted notices independently identify both libraries.
const embeddedVersionSource = 'https://raw.githubusercontent.com/naptha/tesseract.js/v6.0.1/package-lock.json';
const embeddedPackages = [
  { name: 'buffer', version: '6.0.3', declaredLicense: 'MIT',
    licenseSource: 'https://raw.githubusercontent.com/feross/buffer/v6.0.3/LICENSE',
    licenseSHA256: '06bafa45fdad2579ba0e43b0c9b2c6290287c99c4203c300254a462b38a307f6' },
  { name: 'ieee754', version: '1.2.1', declaredLicense: 'BSD-3-Clause',
    licenseSource: 'https://raw.githubusercontent.com/feross/ieee754/v1.2.1/LICENSE',
    licenseSHA256: '18d45466ba3253deae04667e267a91ea8de8548f18c1125264d1c9db28194cc1' },
];
for (const entry of embeddedPackages) {
  const noticePath = path.join(licenseRoot, entry.name, 'LICENSE');
  let notice;
  try { notice = await readFile(noticePath); }
  catch {
    const response = await fetch(entry.licenseSource, { signal: AbortSignal.timeout(30_000) });
    if (!response.ok) throw new Error(`Could not preserve the ${entry.name} license (${response.status}).`);
    notice = Buffer.from(await response.arrayBuffer());
    await mkdir(path.dirname(noticePath), { recursive: true });
    if (createHash('sha256').update(notice).digest('hex') !== entry.licenseSHA256) throw new Error(`Unexpected ${entry.name} license bytes.`);
    await writeFile(noticePath, notice);
  }
  const digest = createHash('sha256').update(notice).digest('hex');
  if (digest !== entry.licenseSHA256) throw new Error(`The pinned ${entry.name} license was changed.`);
  entry.versionSource = embeddedVersionSource;
  entry.includedIn = 'ocr/worker.min.js';
  entry.versionBasis = 'Upstream v6.0.1 build lockfile; library identity also appears in worker.min.js.LICENSE.txt.';
  entry.preservedNotices = [path.relative(assetRoot, noticePath).replaceAll('\\', '/')];
  files.push({ path: entry.preservedNotices[0], bytes: notice.length, sha256: digest });
}

const manifest = {
  generatedBy: 'scripts/prepare-assets.mjs',
  runtime: 'Same-origin browser OCR. No model, worker, or core CDN is required.',
  versions: { tesseract: tesseract.version, core: core.version, english: english.version },
  englishModel: { set: '4.0.0_best_int', source: 'https://github.com/naptha/tessdata', npmDeclaredLicense: english.license,
    upstreamLicenseURL: 'https://raw.githubusercontent.com/naptha/tessdata/gh-pages/LICENSE', upstreamLicense: 'Apache-2.0',
    note: 'Original package declaration and upstream trained-data license are both retained.' },
  files, packages, embeddedPackages,
};
await writeFile(path.join(assetRoot, 'ocr-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
await writeFile(path.join(assetRoot, 'THIRD-PARTY-NOTICES.md'), `# Bundled OCR dependencies\n\nTesseract.js ${tesseract.version} and Tesseract.js-core ${core.version} are distributed under their original Apache-2.0 licenses. Browser distribution notices and all installed dependency license/notice files are retained in this directory. See ocr-manifest.json for exact versions, file hashes, declarations, and locations.\n\nThe published worker also embeds buffer 6.0.3 (MIT) and ieee754 1.2.1 (BSD-3-Clause), which are not installed production dependencies of this project. Full original license texts are retained in licenses/buffer/LICENSE and licenses/ieee754/LICENSE, alongside the worker's extracted notices. These versions are identified by Tesseract.js v6.0.1's upstream build lockfile; pinned license sources, hashes and the version basis are recorded under embeddedPackages in the manifest.\n\nEnglish trained data comes from @tesseract.js-data/eng ${english.version}, 4.0.0_best_int. Its npm package declares MIT without an included license text, while the upstream naptha/tessdata repository publishes Apache-2.0. The manifest preserves the package declaration and licenses/naptha-tessdata-upstream.LICENSE preserves the actual upstream license.\n\nNo third-party code or model file has been modified. The project-specific source is separately licensed by the project.\n`);
await writeFile(path.join(ocrRoot, 'LOCAL-OCR.md'), `# Same-origin OCR setup\n\nLoad /assets/ocr/tesseract.esm.min.js as an ES module, or /assets/ocr/tesseract.min.js for the Tesseract global.\n\nUse createWorker('eng', 1, { workerPath: new URL('/assets/ocr/worker.min.js', location.origin).href, corePath: new URL('/assets/ocr/core', location.origin).href, langPath: new URL('/assets/ocr/lang', location.origin).href, workerBlobURL: false, gzip: true, cacheMethod: 'none', logger }). Request word bounding boxes with worker.recognize(image, {}, { text: true, blocks: true }).\n\nThe English LSTM model and all four core variants are provided locally. Browser requests may fetch these files from the local web server; OCR does not require transmitting image content to a remote API. Test network behavior before making a privacy claim. A static server is required; file:// URLs are not supported.\n`);
console.log(JSON.stringify({ prepared: true, assets: files.length, bundledBytes: files.reduce((sum, file) => sum + file.bytes, 0), versions: manifest.versions, manifest: 'dist/assets/ocr-manifest.json' }));
