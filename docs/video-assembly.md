# ShareProof captured-state demo assembly

The 140-second demo is an edited sequence of actual browser screenshots. It is silent, with large English editorial captions. The persistent heading states “Working browser demo · captured interaction states.” It does not imitate a continuous screen recording or claim processing speed.

The application pixels come only from owner-supplied CUA captures in `qa/demo/`. The assembly scales each entire capture to fit inside a neutral frame. It does not crop, redraw, repair, blur, add a pointer to, or otherwise retouch the application. The title, captions, sequence indicator and footer are separate editorial elements. Do not use a generated mockup as an input.

## Required real captures

| File prefix | Captured state | Seconds |
| --- | --- | ---: |
| 01 | Workbench hero and upper synthetic receipt | 8 |
| 02 | Readable synthetic contact details | 8 |
| 03 | Actual OCR progress | 9 |
| 04 | Two actual suggestions, both pending | 8 |
| 05 | Email kept visible temporarily, phone pending, export blocked | 12 |
| 06 | Both sample contacts covered | 8 |
| 07 | Manually added participant-name cover | 10 |
| 08 | Three covers and confirmed whole-image review | 8 |
| 09 | Successful round trip and 27,480-pixel result | 15 |
| 10 | SHA-256, retained chunks and downloads | 12 |
| 11 | Actual downloaded PNG opened | 10 |
| 12 | Undo or edit invalidates the previous result | 10 |
| 13 | Actual explanation of checks and limitations | 12 |
| 14 | Actual planning files or repository | 10 |

The supplied CUA captures contain JPEG bytes and use names such as `01.jpg` or `01-workbench.jpg`, with exactly one matching JPEG per prefix. The script accepts actual PNG or JPEG images and records each detected format. For PNG sources, change the corresponding manifest pattern to `01*.png`. Renaming the supplied JPEG captures to `.jpg` preserves their bytes; it does not convert or alter the screenshot. The order is based on the real interaction states provided by the owner. Revise the manifest if the actual captures differ; never make a screenshot to fit an unsupported claim.

## Commands

Run from the project directory with Python and Pillow installed:

```sh
python scripts/assemble-demo.py --plan
python scripts/assemble-demo.py --check
python scripts/assemble-demo.py --render --ffmpeg /path/to/ffmpeg
```

`--plan` and `--check` write no files. `--render` stops before composing or encoding if any capture is missing, ambiguous or invalid. It needs Pillow, Segoe UI and Georgia fonts, and the supplied local ffmpeg installation. A different executable can be passed with `--ffmpeg`.

The output is `video/rendered/shareproof-demo-140s.mp4`: 1920 × 1080, H.264, 30 fps, no audio, suitable for a public YouTube or Vimeo demonstration under three minutes. The folder also contains separate English SRT captions, chapter timestamps, editorial frames and an assembly report with hashes of the exact source captures and final video. The report records encoding, not public upload or submission.

## Evidence and final review

The captions use the completed single-sample checks: two OCR suggestions; three selected regions; 27,480 inspected pixels; 1160 × 910 PNG; 90,562 bytes; SHA-256 `4d6f5d8f7e3a22dd629f7fba43b525da46ce226d73f2ee5aea658762ae447e79`; all 12 core tests pass. If a new capture uses a changed export, update those facts only from the new output and independent checks. Do not reuse the previous file's hash for a changed file.

The planning materials are drafts produced with the six-stage official pack. Do not frame them as personally reviewed learner reflections unless the participant has actually reviewed and supplied those statements. Do not claim real customers, prevented privacy incidents, measured OCR recall, mobile-device trials or guaranteed anonymization.

Before publication, play the complete encoded video and inspect the source images and editorial frames. Ensure the screenshots expose only the fictional fixture and project material, with no real account profile, unrelated tabs, contact data, local personal paths or private repository content. Check that exported-file details are readable, the persistent captured-state disclosure is visible, and the exact final duration is 140 seconds. Then upload and verify the actual public link through the authorized publication workflow. This script does not upload anything.
