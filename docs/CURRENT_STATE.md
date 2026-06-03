# Current State

This document records the repository state after the public-release preparation pass.

## Current Folders And Files

```text
.
├── index.html
├── README.md
├── .gitignore
├── firmware/
│   └── ultra_box_45.ino
├── browser-app/
│   ├── index.html
│   ├── ultra.js
│   ├── ultrasound.js
│   ├── ultra.css
│   ├── tone_15_04.js
│   ├── nexusUI.js
│   ├── Amen-break.wav
│   ├── favicon2.ico
│   └── manifest.json
├── docs/
│   ├── CURRENT_STATE.md
│   ├── FIRMWARE_SETUP.md
│   ├── PRESET_SYSTEM.md
│   ├── MIDI_MAPPING.md
│   ├── WIRING.md
│   ├── BROWSER_APP_MIDI2SOUND.md
│   ├── GITHUB_PAGES.md
│   └── PUBLIC_RELEASE_CHECKLIST.md
└── assets/
    ├── photos/
    └── diagrams/
```

## ESP32 Firmware Entry Point

The firmware entry point is `firmware/ultra_box_45.ino`.

Important functions:

- `setup()`: initializes FastLED, Serial, ultrasonic sensor pins, USB MIDI, EEPROM, touch arrays, preset storage, and calibration.
- `loop()`: runs `ultraLoop()`, `touchLoop()`, `readMidi()`, and `loopLoop()`.
- `ultraLoop()`: maps ultrasonic distance to notes, CC values, and pitch bend.
- `touchLoop()`: reads conductive/touch inputs and controls channels, CC buttons, presets, loop states, shift, play, and stop.
- `initEEprom()`, `loadBank()`, `saveBank()`: manage persistent presets.
- `sendSysex()` and `fakeSysex()`: implement the current fake SysEx-style preset exchange over MIDI note-off messages on channel 16.

## Browser App Entry Point

The browser app entry point is `browser-app/index.html`.

It loads:

- `browser-app/ultra.css`
- `browser-app/nexusUI.js`
- `browser-app/tone_15_04.js`
- `browser-app/ultrasound.js`
- `browser-app/ultra.js`

## Firmware Libraries Used

Observed includes:

- `WiFi.h`
- `HTTPUpdate.h`
- `FastLED.h`
- `USB.h`
- `USBMIDI.h`
- `EEPROM.h`

The code also uses ESP32 APIs such as `touchRead()` and Arduino APIs such as `pulseIn()`, `pinMode()`, `digitalWrite()`, and `delayMicroseconds()`.

## Browser Libraries Used

The app currently vendors local browser libraries:

- `tone_15_04.js`: Tone.js 15.0.4 build.
- `nexusUI.js`: NexusUI controls.

Browser platform APIs:

- Web MIDI through `navigator.requestMIDIAccess()`.
- Web Audio through Tone.js.
- IndexedDB for local sample storage.
- `localStorage` for browser-side templates/sounds.

## Current MIDI Flow

Firmware to MIDI:

1. Ultrasonic sensor measures hand distance.
2. Distance is mapped to scale notes and CC values.
3. Channel touch buttons choose which of the 4 channel lanes are active.
4. CC touch buttons choose which of the 4 CC routings are active.
5. Firmware sends USB MIDI note on/off, CC, pitch bend, and program change messages.

Browser app:

1. Browser requests Web MIDI access.
2. The app detects devices named like `TinyUSB MIDI` or `ESP32S3_DEV`.
3. Incoming MIDI is handled in `changedevicein()` through `onmidimessage`.
4. Fake preset messages with status byte `143` are routed to `fakeSysex()`.
5. Other incoming MIDI can be passed to the browser sound code through `midiSound()` and routed onward through `routeMidi()`.

Preset sync:

- Firmware sends preset data as note-off style messages on channel 16 from `sendSysex()`.
- Browser receives those messages and updates UI state in `fakeSysex()`.
- Browser sends edits back with arrays such as `[143, parameterId, value]` through `sendMidiUsb()`.

## Preset Storage System

The firmware initializes EEPROM with marker byte `86` at address `0`.

Observed layout:

- Address `1`: last used bank/preset.
- Addresses `8 + bank` and `24 + bank`: BPM LSB/MSB.
- Address block starting at `88`: 4 CC mappings for each of 4 channel lanes per preset.
- Address block starting at `344`: MIDI channel for each lane per preset.
- Address block starting at `408`: scale length for each lane per preset.
- Address block starting at `472`: 8 scale notes for each lane per preset.
- Address block starting at `1024`: CC min values.
- Address block starting at `1280`: CC max values.

There are 16 banks/presets indexed `0` to `15`.

## What Can Be Safely Published

- Firmware source after removing hard-coded WiFi credentials.
- Static browser app source.
- Local copies of Tone.js and NexusUI if their licenses are acceptable for the final repository.
- The default `Amen-break.wav` sample only if its licensing/ownership is confirmed.
- Documentation and placeholder asset folders.

## What Should Be Cleaned Later

- Confirm license status for `Amen-break.wav`, `tone_15_04.js`, and `nexusUI.js`.
- Replace or isolate OTA update configuration so WiFi and update URLs are locally configurable.
- Document the exact ESP32 board and pin mapping with a wiring diagram.
- Remove dead/commented network/socket code from the browser app in a later cleanup pass.
- Split controller UI from sound-engine logic and integrate through a small `midi2sound` adapter.
- Add screenshots, photos, and a performance demo link.
