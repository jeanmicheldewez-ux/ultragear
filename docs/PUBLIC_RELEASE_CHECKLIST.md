# Public Release Checklist

Use this before publishing the repository.

## Secrets And Private Data

- [x] No committed WiFi credentials in firmware.
- [ ] No API keys, tokens, or private server credentials.
- [ ] No personal/private file paths.
- [ ] No private gig notes or client data.
- [ ] Browser local test data is not committed.

## Repository Hygiene

- [x] No `node_modules`.
- [x] `.gitignore` includes common generated folders and firmware build outputs.
- [ ] No unnecessary binaries.
- [ ] Confirm `Amen-break.wav` can be redistributed or replace it with a clearly licensed sample.
- [ ] Confirm licenses for vendored `tone_15_04.js` and `nexusUI.js`.
- [ ] Add source/license notes for third-party browser libraries.

## Firmware Test

- [ ] Build `firmware/ultra_box_45.ino`.
- [ ] Flash to the ESP32 target board.
- [ ] Confirm USB MIDI device appears.
- [ ] Confirm first-boot EEPROM initialization.
- [ ] Confirm touch calibration works.
- [ ] Confirm 4 channel buttons.
- [ ] Confirm 4 CC buttons.
- [ ] Confirm next/previous preset wraparound.
- [ ] Confirm standalone synth note, CC, pitch bend, and program change behavior.

## Browser MIDI Test

- [ ] Serve the repo locally or through GitHub Pages.
- [ ] Open `browser-app/`.
- [ ] Authorize MIDI in Chrome or Edge.
- [ ] Select the ESP32/TinyUSB MIDI input and output.
- [ ] Confirm preset data appears in the browser UI.
- [ ] Confirm notes and CC messages trigger browser sound.
- [ ] Confirm routing to another MIDI output if used.

## Demo Instructions

- [ ] Add one short video or audio demo.
- [ ] Add at least one photo of the finished controller.
- [ ] Add one wiring or signal-flow diagram.
- [ ] Document exact synth/browser setup used in the demo.

## GitHub Pages

- [x] Root `index.html` links to the browser app.
- [x] Root `index.html` links to the separate `midi2sound` demo.
- [x] Browser app uses relative local asset paths.
- [ ] Enable Pages from the repository root or selected branch in GitHub settings.
- [ ] Test the published Pages URL over HTTPS.
