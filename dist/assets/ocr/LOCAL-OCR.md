# Same-origin OCR setup

Load /assets/ocr/tesseract.esm.min.js as an ES module, or /assets/ocr/tesseract.min.js for the Tesseract global.

Use createWorker('eng', 1, { workerPath: new URL('/assets/ocr/worker.min.js', location.origin).href, corePath: new URL('/assets/ocr/core', location.origin).href, langPath: new URL('/assets/ocr/lang', location.origin).href, workerBlobURL: false, gzip: true, cacheMethod: 'none', logger }). Request word bounding boxes with worker.recognize(image, {}, { text: true, blocks: true }).

The English LSTM model and all four core variants are provided locally. Browser requests may fetch these files from the local web server; OCR does not require transmitting image content to a remote API. Test network behavior before making a privacy claim. A static server is required; file:// URLs are not supported.
