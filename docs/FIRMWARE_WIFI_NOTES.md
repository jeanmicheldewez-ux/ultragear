# Firmware WiFi Notes

This project now keeps two firmware variants:

- Public USB MIDI sketch: `firmware/ultragear_usb_midi/ultragear_usb_midi.ino`
- Preserved legacy sketch: `firmware/legacy/UG_4X_45_mic_in/UG_4X_45_mic_in.ino`

The public firmware focuses on USB MIDI for clarity and reliability. Older WiFi/OTA experiments are not part of the public demo firmware.

## WiFi Code Found In The Legacy Sketch

The preserved legacy sketch contains:

- `#include <WiFi.h>`
- `#include <HTTPUpdate.h>`
- Public-release placeholders:
  - `const char* SSID = "";`
  - `const char* PASS = "";`
- A shift/stop long-press path in `touchLoop()` that can call `update()` after repeated activation.
- An `update()` function that:
  - Calls `WiFi.begin(SSID, PASS)`.
  - Waits for `WL_CONNECTED`.
  - Creates a `WiFiClient`.
  - Contacts host `ultragear.midistream.com` on port `80`.
  - Requests path `/update-UG1/UG4_V1_01.ino.bin`.
  - Calls `httpUpdate.update(...)`.
  - Prints HTTP update status over Serial.

## What Was Not Found

No active WiFi MIDI, network MIDI, web server, WebSocket server, UDP MIDI, or network debug server logic was found in the firmware sketch. The WiFi code appears limited to a legacy OTA/update mechanism.

## Current Role Of WiFi Code

In the preserved legacy sketch, WiFi is used for legacy OTA/update behavior only. MIDI performance logic uses USB MIDI through:

```cpp
#include "USB.h"
#include "USBMIDI.h"
USBMIDI MIDI;
```

The browser app may contain old commented network/socket experiments, but the ESP32 firmware MIDI output path is USB MIDI.

## Public USB MIDI Version

The public sketch at `firmware/ultragear_usb_midi/ultragear_usb_midi.ino` is derived from `UG_4X_45_mic_in.ino` and removes or disables the legacy network/update parts:

- Removed `WiFi.h`.
- Removed `HTTPUpdate.h`.
- Removed SSID/PASS variables from the public sketch.
- Removed the HTTP OTA update implementation.
- Disabled the old long-press update action with an inline note.

It keeps:

- Ultrasonic sensor logic.
- Conductive/touch button logic.
- EEPROM/flash preset logic.
- 16 presets.
- 4 CC routing values per preset/channel lane.
- Up to 8 scale notes per preset/channel lane.
- BPM per preset.
- USB MIDI note, CC, pitch bend, program change, and preset sync behavior.

## Is WiFi Safe To Remove?

For the public USB MIDI firmware, yes. The identified WiFi code is not required for standalone MIDI synth use, Web MIDI browser use, presets, buttons, ultrasonic control, or USB MIDI output.

The preserved legacy sketch is kept so the old OTA experiment is not lost. Credentials are redacted for public release.

## Restoring OTA Later

If OTA updates are restored later, use a separate configuration approach rather than committing credentials:

- Keep WiFi credentials in a local ignored header, Arduino secrets file, or build-time configuration.
- Document the update server, firmware binary path, and versioning strategy.
- Add timeout/failure behavior so the instrument never blocks indefinitely during a live setup.
- Keep OTA behind an explicit compile-time flag, for example `ULTRAGEAR_ENABLE_OTA`.
- Keep USB MIDI as the default public build.
