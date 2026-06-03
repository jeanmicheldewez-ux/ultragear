# Browser App And midi2sound Integration

The static browser app lives in `browser-app/` and starts at `browser-app/index.html`.

## How The Browser App Receives MIDI

The current app uses Web MIDI directly in `browser-app/ultra.js`.

Observed flow:

- `listMIDIDevices()` calls `navigator.requestMIDIAccess()`.
- The app looks for ESP32-style device names such as `TinyUSB MIDI` and `ESP32S3_DEV`.
- `changedevicein()` gets the selected MIDI input and assigns `midiinput.onmidimessage`.
- Preset/config messages with status byte `143` are sent to `fakeSysex()`.
- Performance MIDI is sent to `midiSound(d1, d2, d3)` and optionally forwarded with `routeMidi(d1, d2, d3)`.

## Current Sound Engine State

The app currently contains controller UI and browser sound logic in the same static app:

- `ultra.js`: controller UI, Web MIDI, preset communication, routing.
- `ultrasound.js`: Tone.js/NexusUI sound creation, effects, sample storage, and browser sound handling.

This is publishable as a historical/live-tested instrument app, but the reusable sound-engine direction is now the separate `midi2sound` project:

https://jeanmicheldewez-ux.github.io/midi2sound/

## Integration Boundary

Keep the Ultragear-specific code responsible for:

- MIDI device selection.
- Preset sync with the ESP32 firmware.
- Controller UI state.
- Mapping Ultragear firmware messages to browser actions.

Keep `midi2sound` responsible for:

- Browser audio engine.
- Instrument creation.
- Effects.
- Sample playback.
- Sound preset management.

Do not copy the full `midi2sound` repository into this repository.

## Suggested Adapter Shape

When replacing the local sound code, add a thin adapter that receives plain MIDI bytes from Ultragear and forwards them to `midi2sound`.

Example shape:

```js
function handleUltragearMidi(status, data1, data2) {
  if (status === 143) {
    fakeSysex(status, data1, data2);
    return;
  }

  window.midi2sound?.handleMidiMessage?.([status, data1, data2]);
}
```

Then call that adapter from the existing `onmidimessage` handler instead of calling browser sound internals directly.

## Safe Next Step

The safe public-release state is to document the boundary and leave the working app intact. A later code pass can replace `midiSound()` calls with a `midi2sound` adapter after verifying the shared engine API.
