# ShareProof captured-state demo assembly

The 140-second demo is an edited sequence of actual browser screenshots. It is silent, with large English editorial captions. The persistent heading states “Working browser demo · captured interaction states.” It does not imitate a continuous screen recording or claim processing speed.

The application pixels come from actual browser captures in `qa/demo/`. The assembly fits each whole capture inside a neutral frame. Titles, captions, the sequence indicator and footer are separate editorial elements; the underlying application capture is preserved.

## Required real captures

| File prefix | Captured state | Seconds |
| --- | --- | ---: |
| 01 | Workbench hero and upper synthetic receipt | 8 |
| 02 | Readable synthetic contact details | 8 |
| 03 | Actual OCR progress | 9 |
| 04 | Two actual suggestions, both pending | 8 |
| 05 | Email kept visible temporarily, phone pending, export blocked | 12 |
| 06 | Both sample contacts covered | 8 |
| 07 | Manually added sample-name cover | 10 |
| 08 | Three covers and confirmed whole-image review | 8 |
| 09 | Successful round trip and 27,480-pixel result | 15 |
| 10 | SHA-256, retained chunks and downloads | 12 |
| 11 | Actual downloaded PNG opened | 10 |
| 12 | Undo or edit invalidates the previous result | 10 |
| 13 | Actual explanation of checks and limitations | 12 |
| 14 | Actual planning files or repository | 10 |

Captures use names such as `01.jpg` or `01-workbench.jpg`, with exactly one matching image per prefix. The script accepts PNG or JPEG images and records the detected format. For PNG sources, change the corresponding manifest pattern to `01*.png`. The manifest defines the order and duration of the captured interaction states.

## Commands

Run from the project directory with Python and Pillow installed:

```sh
python scripts/assemble-demo.py --plan
python scripts/assemble-demo.py --check
python scripts/assemble-demo.py --render --ffmpeg /path/to/ffmpeg
```

`--plan` and `--check` write no files. `--render` stops before composing or encoding if any capture is missing, ambiguous or invalid. It needs Pillow, Segoe UI and Georgia fonts, and ffmpeg. The executable can be passed with `--ffmpeg`.

The output is `video/rendered/shareproof-demo-140s.mp4`: 1920 × 1080, H.264, 30 fps, no audio, suitable for a public YouTube or Vimeo demonstration under three minutes. The folder also contains separate English SRT captions, chapter timestamps, editorial frames and an assembly report with hashes of the exact source captures and final video. The report records encoding, not public upload or submission.

## Output verification

The captions use the completed single-sample checks: two OCR suggestions; three selected regions; 27,480 inspected pixels; 1160 × 910 PNG; 90,562 bytes; SHA-256 `4d6f5d8f7e3a22dd629f7fba43b525da46ce226d73f2ee5aea658762ae447e79`; all 12 core tests pass. If a new capture uses a changed export, update those facts only from the new output and independent checks. Do not reuse the previous file's hash for a changed file.

The encoded video is 140 seconds long and silent. Its persistent captured-state heading identifies the edited format. Application captures show the fictional fixture and project material; exported-file details remain readable. The assembly report records the exact inputs and output hashes.

The public demonstration is available at https://youtu.be/xkf0LrtodzU. Its selected-area checks are documented in [Verification](../devpost/checklist.md).
