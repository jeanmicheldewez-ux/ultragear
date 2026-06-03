# Ultragear ESP32 MIDI Controller

3D-printed ultrasonic MIDI controller for live gesture-based music performance.

Ultragear is an ESP32-based musical instrument that turns hand distance gestures into MIDI notes, CC messages, and pitch bends. It is built around an ultrasonic distance sensor, conductive PLA touch buttons, USB MIDI, and a 3D-printed enclosure. The controller can drive an external MIDI synthesizer directly, or it can control the included browser app and the shared `midi2sound` browser sound engine.

This project has been live-tested in about 10 gigs.

## Hardware Overview

- ESP32-based controller, tested with TinyUSB-style USB MIDI device naming.
- Ultrasonic distance sensor for hand-distance gesture control.
- 3D-printed enclosure.
- Conductive PLA printed touch buttons.
- 4 channel buttons for using and selecting 4 MIDI channels.
- 4 CC buttons for sending mapped MIDI CC values.
- Next and previous preset buttons.
- Additional buttons reserved for features such as looper control.
- NeoPixel/FastLED LED feedback.

Photos will be added in `assets/photos/`.

<img width="982" height="656" alt="sh-ultragear" src="https://github.com/user-attachments/assets/2b267336-bc32-4a5e-811a-f408a8854439" />

## Firmware Features

- USB MIDI output from the ESP32.
- Standalone MIDI synth control.
- Browser app and Web MIDI control.
- 16 presets stored in EEPROM/flash.
- Each preset stores 4 CC routings per channel group.
- Each preset stores up to 8 notes per scale.
- Each preset stores BPM.
- Channel buttons for note activation and channel selection.
- CC buttons for assigning the ultrasonic gesture to CC messages.
- Next/previous preset behavior with wraparound across 16 presets.
- Pitch bend gesture mode.
- Basic loop record/playback logic present in firmware.

## Browser App

The browser app lives in `browser-app/`. It uses Web MIDI to receive MIDI from the ESP32 and can generate sound in the browser with Tone.js and NexusUI-based controls.

The reusable sound engine direction for this project is `midi2sound`, which is maintained separately:

https://jeanmicheldewez-ux.github.io/midi2sound/

This repository keeps the Ultragear controller app separate from the reusable `midi2sound` internals. Do not copy the full `midi2sound` repo into this project.

## Project Structure

```text
firmware/        ESP32 firmware
browser-app/     Static Web MIDI browser app
docs/            Project documentation
assets/photos/   Photo placeholders
assets/diagrams/ Wiring and signal-flow placeholders
```

## Flash Firmware

1. Open `firmware/ultra_box_45.ino` in Arduino IDE or an ESP32-compatible Arduino workflow.
2. Install/select an ESP32 board package with USB MIDI support for the target board.
3. Install required Arduino libraries: FastLED, ESP32 USB/USBMIDI support, EEPROM, WiFi, and HTTPUpdate.
4. Connect the ESP32 by USB.
5. Select the correct board and port.
6. Build and upload.

OTA update code exists in the firmware, but WiFi credentials are intentionally blank in this public release. Configure them locally only if you use OTA.

## Run Browser App

For a local test, open:

```text
browser-app/index.html
```

For Web MIDI in Chrome/Edge, serving the app from `localhost` or HTTPS is recommended:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/browser-app/`, authorize MIDI, select the ESP32 MIDI device, and click the sound authorization screen if using browser audio.

## Usage Modes

Standalone MIDI synth:

1. Flash the ESP32 firmware.
2. Connect the ESP32 USB MIDI output to a MIDI host or synth setup.
3. Use channel buttons to play/hold channels.
4. Move a hand over the ultrasonic sensor to select notes or control CC values.
5. Use CC buttons to choose which CC routing is active.
6. Use next/previous preset controls to change presets.

Browser/midi2sound:

1. Open the browser app.
2. Authorize MIDI.
3. Select the ESP32 MIDI input/output.
4. Authorize browser sound.
5. Use the controller to play browser instruments or route MIDI into a `midi2sound` adapter.

## Documentation

- [Current state](docs/CURRENT_STATE.md)
- [Firmware setup](docs/FIRMWARE_SETUP.md)
- [Preset system](docs/PRESET_SYSTEM.md)
- [MIDI mapping](docs/MIDI_MAPPING.md)
- [Wiring](docs/WIRING.md)
- [Browser app and midi2sound integration](docs/BROWSER_APP_MIDI2SOUND.md)
- [GitHub Pages](docs/GITHUB_PAGES.md)
- [Public release checklist](docs/PUBLIC_RELEASE_CHECKLIST.md)

## What This Demonstrates

- ESP32 USB MIDI instrument firmware.
- Gesture-to-MIDI mapping with an ultrasonic sensor.
- Persistent preset storage in EEPROM/flash.
- Multi-channel MIDI performance design.
- Conductive PLA button interaction in a 3D-printed enclosure.
- Browser Web MIDI integration.
- Separation path between controller-specific UI and a reusable sound engine.

## Photo And Wiring Placeholders

- Add live instrument photos to `assets/photos/`.
- Add enclosure photos to `assets/photos/`.
- Add wiring diagrams to `assets/diagrams/`.
- Add MIDI flow diagrams to `assets/diagrams/`.

## Roadmap

- Add final wiring diagram and enclosure photos.
- Document exact ESP32 board variant and pinout validation.
- Replace controller-specific browser sound code with a small `midi2sound` adapter where safe.
- Add a clean preset import/export format for the browser app.
- Improve firmware configuration for OTA credentials without editing public source.
- Document looper controls once the hardware mapping is finalized.
- Add short performance demo instructions and media links.
