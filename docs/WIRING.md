# Wiring

This file records the wiring that can be inferred from the current firmware. Confirm against the physical instrument before publishing a final build guide.

## Current Firmware Pin Map

| Function | Firmware Pin |
| --- | --- |
| Ultrasonic trigger | GPIO 47 |
| Ultrasonic echo | GPIO 45 |
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

Add the final sensor model, power voltage, ground, trigger, and echo wiring once confirmed.

## Placeholder Diagrams

Add diagrams to:

- `assets/diagrams/wiring-overview.png`
- `assets/diagrams/midi-flow.png`
- `assets/diagrams/button-layout.png`

Add photos to:

- `assets/photos/front.jpg`
- `assets/photos/internal-wiring.jpg`
- `assets/photos/live-performance.jpg`

## Notes Before Final Public Build Guide

- Confirm ESP32 board variant.
- Confirm whether any echo level shifting is required for the ultrasonic sensor.
- Confirm conductive PLA button connection method and any pull-up/pull-down behavior.
- Confirm LED count and physical LED order.
- Confirm USB MIDI host/synth connection examples.
