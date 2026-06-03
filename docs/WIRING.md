# Wiring

This file records the wiring confirmed for the current portfolio prototype plus pin mappings detected from the working firmware.

The goal for now is portfolio documentation, not a complete step-by-step public build guide.

## Hardware Summary

- Controller board: ESP32-S3 Espressif WROOM module.
- Distance sensor: HC-SR04 ultrasonic sensor.
- Sensor power: powered from the ESP32 board `5V` pin.
- Sensor trigger: direct ESP32 GPIO connection.
- Sensor echo: direct ESP32 GPIO connection in the current prototype.
- Buttons: conductive PLA printed buttons connected directly to ESP32 touch inputs.
- LEDs: WS2812/NeoPixel, ring of 8 LEDs plus 1 central LED, powered from `5V`.
- Enclosure: 3D printed.

## Current Firmware Pin Map

| Function | Firmware Pin |
| --- | --- |
| Ultrasonic trigger | GPIO 15 |
| Ultrasonic echo | GPIO 17 |
| NeoPixel/FastLED data | GPIO 21 |
| LED clock define | GPIO 13, currently defined but NeoPixel mode uses data pin |
| Touch 0 | GPIO 9 |
| Touch 1 | GPIO 10 |
| Touch 2 | GPIO 11 |
| Touch 3 | GPIO 12 |
| Touch 4 | GPIO 4 |
| Touch 5 | GPIO 5 |
| Touch 6 | GPIO 6 |
| Touch 7 | GPIO 7 |
| Touch 8 | GPIO 13 |
| Touch 9 | GPIO 14 |
| Touch 10 | GPIO 8 |
| Touch 11 | GPIO 3 |
| Touch 12 | GPIO 1 |
| Touch 13 | GPIO 2 |

## Touch Button Roles

Observed in `touchLoop()`:

- Touch 0 to 3: channel buttons.
- Touch 4 to 7: CC buttons.
- Touch 8: shift.
- Touch 9: second shift/future control, currently read as `shift2Touch`.
- Touch 10: plus/next preset.
- Touch 11: minus/previous preset.
- Touch 12: play.
- Touch 13: stop.

## Ultrasonic Sensor

The ultrasonic sensor is read with:

```cpp
digitalWrite(trigPin, LOW);
delayMicroseconds(4);
digitalWrite(trigPin, HIGH);
delayMicroseconds(10);
digitalWrite(trigPin, LOW);
duration = pulseIn(echoPin, HIGH, 6000);
```

Current prototype wiring:

- HC-SR04 `VCC` to board `5V`.
- HC-SR04 `GND` to board `GND`.
- HC-SR04 `TRIG` to GPIO `15`.
- HC-SR04 `ECHO` to GPIO `17`.
- No echo level shifter is currently used.

Note: many HC-SR04 modules output a 5V echo when powered from 5V, while ESP32 GPIOs are normally 3.3V logic. The current instrument works this way, but a reproducible public build guide should verify the exact sensor module or add a level shifter/resistor divider recommendation.

## Placeholder Diagrams

Add diagrams to:

- `assets/diagrams/wiring-overview.png`
- `assets/diagrams/midi-flow.png`
- `assets/diagrams/button-layout.png`

Add photos to:

- `assets/photos/ultragear.jpg`
- `assets/photos/internal-wiring.jpg`
- `assets/photos/live-performance.jpg`
- `assets/photos/arduino_ide_settings.png`

Current media:

- `assets/video/Video-live-demo.mp4`
- `assets/photos/arduino_ide_settings.png`
- `assets/photos/ultragear.jpg`

The live demo video was captured at Souplex. In that performance, Ultragear sends MIDI to an Axoloti DSP board.

## Notes Before Final Public Build Guide

- Decide whether to recommend echo level shifting for a public build guide.
- Add photos of the conductive PLA button connection method.
- Confirm physical LED order in a diagram.
- Confirm USB MIDI host/synth connection examples.
