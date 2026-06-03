# Preset System

Ultragear stores 16 presets in ESP32 EEPROM/flash through the Arduino `EEPROM` API. The public USB MIDI firmware keeps the same preset system as the preserved legacy sketch.

## Preset Count

- Presets are indexed `0` to `15`.
- The UI presents them as 16 tracks/templates.
- The firmware wraps next/previous preset changes across the 16-preset range.

## Stored Data

Each preset stores:

- BPM.
- MIDI channel routing for 4 channel lanes.
- 4 CC routings per channel lane.
- CC min/max ranges.
- Scale length per lane.
- Up to 8 MIDI note values per scale.

## EEPROM Layout

Observed from `initEEprom()`, `loadBank()`, and `saveBank()`:

- `0`: storage marker. The public `ultragear_usb_midi.ino` sketch uses value `87`.
- `1`: last selected bank.
- `8 + bank`: BPM low 7 bits.
- `24 + bank`: BPM high bits.
- `88 + bank * 16 + channel * 4 + cc`: CC number.
- `344 + bank * 4 + channel`: MIDI channel.
- `408 + bank * 4 + channel`: scale length.
- `472 + bank * 32 + channel * 8 + note`: scale note.
- `1024 + bank * 16 + channel * 4 + cc`: CC minimum.
- `1280 + bank * 16 + channel * 4 + cc`: CC maximum.

## Next/Previous Preset Behavior

In `touchLoop()`, holding shift and pressing the plus/minus preset controls changes `bank`.

- Above preset `15`, it wraps to `0`.
- Below preset `0`, it wraps to `15`.
- `loadBank(bank)` loads the stored data.
- `flagSendBank` triggers a MIDI program change and resets loop/play recording state.

## Browser Sync

The current preset sync is a fake SysEx system over normal MIDI messages:

- Firmware sends note-off style messages on channel 16 from `sendSysex()`.
- Browser decodes messages with status byte `143` in `fakeSysex()`.
- Browser sends edits back as arrays like `[143, parameterId, value]`.
- Firmware receives those messages in `fakeSysex()` and updates in-memory preset values.
- Browser can request save by sending parameter `24`.

This sync path is USB MIDI-focused in the public firmware. Older WiFi/OTA experiments are not required for preset storage or preset sync.

## Future Extension Possibilities

- Replace fake SysEx with explicit SysEx once the browser and firmware handling are cleaned up.
- Add preset export/import as JSON in the browser app.
- Store human-readable preset names in browser local storage or in a documented firmware extension block.
- Add looper state or looper mapping fields if those controls become stable.
- Add firmware version and preset schema version bytes to EEPROM.
