# MIDI Mapping

Ultragear maps hand distance and touch buttons to MIDI notes, CC messages, pitch bend, program change, and preset-edit messages.

## 4 MIDI Channels And Channel Buttons

The firmware has 4 channel lanes:

```cpp
int chan[] = {0,0,0,0};
int flagChan[] = {0,0,0,0};
int locked[] = {0,0,0,0};
int memChan[4] = {1,2,3,4};
```

The first 4 touch inputs are channel buttons. Pressing a channel button activates that lane. Holding shift while pressing a channel toggles lock behavior.

Each lane can have its own stored MIDI channel through `memChan`.

## 4 CC Buttons And CC Messages

Touch inputs 4 to 7 are CC buttons:

```cpp
cc[i] = touchValues[4 + i];
```

When a CC button is active and a channel lane is selected, hand distance is mapped to the stored CC number for that channel/CC slot:

```cpp
MIDI.controlChange(memCC[ch][cc_idx], nowCC, memChan[ch]);
```

Each preset stores CC numbers and CC min/max ranges.

## Ultrasonic Sensor Mapping

Current firmware pins:

- Trigger: GPIO `47`
- Echo: GPIO `45`

The sensor distance is read with `pulseIn()` and converted to centimeters. The active range is capped around `45 cm`. Distance is mapped to:

- MIDI note index inside the lane scale.
- MIDI CC value `0` to `127`, then remapped through CC min/max.
- Pitch bend when shift mode is active.

## Note And Scale Behavior

Each channel lane has:

- A scale length stored in `memLen[ch]`.
- Up to 8 MIDI notes stored in `scale[ch][0..7]`.

When a hand is detected, distance chooses an index in the lane scale. If the lane is active, the firmware sends note on/off messages for the mapped MIDI note.

## Pitch Bend

When shift is active, the firmware records the starting CC-distance value and maps movement around it to pitch bend:

```cpp
pitchBend = map(nowBend, -127, 127, 16383, 0);
MIDI.pitchBend((uint16_t)pitchBend, ch + 1);
```

## Preset And Program Change

When a preset is changed, firmware sends:

```cpp
MIDI.programChange(bank, 1);
```

Preset data is also sent to the browser using the fake SysEx note-off mapping described in `PRESET_SYSTEM.md`.

## Standalone Synth Usage

Use the ESP32 as a USB MIDI controller with a MIDI host or synth:

1. Connect the ESP32 over USB.
2. Select the ESP32/TinyUSB MIDI device in the host.
3. Use channel buttons to choose active lanes.
4. Move a hand over the ultrasonic sensor to play notes.
5. Hold CC buttons to send mapped CC messages.
6. Change presets with shift plus next/previous.

## Browser Web MIDI Usage

The browser app requests MIDI access with `navigator.requestMIDIAccess()`.

Observed flow:

- `listMIDIDevices()` enumerates MIDI inputs and outputs.
- Devices named `TinyUSB MIDI` or `ESP32S3_DEV` are selected automatically when present.
- `changedevicein()` attaches `onmidimessage`.
- Status byte `143` goes to `fakeSysex()` for preset sync.
- Other MIDI goes to `midiSound()` and optional route output.

Use Chrome or Edge on HTTPS or localhost for the most reliable Web MIDI behavior.
