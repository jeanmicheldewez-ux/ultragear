# Firmware Setup

The firmware entry point is `firmware/ultra_box_45.ino`.

## Requirements

- Arduino IDE or compatible Arduino CLI workflow.
- ESP32 Arduino board package with USB support for the target ESP32 board.
- FastLED library.
- ESP32 core libraries providing `USB.h`, `USBMIDI.h`, `EEPROM.h`, `WiFi.h`, and `HTTPUpdate.h`.

## Upload Steps

1. Open `firmware/ultra_box_45.ino`.
2. Select the correct ESP32 board and USB port.
3. Install the required libraries.
4. Build the sketch.
5. Upload over USB.
6. Open the serial monitor at `115200` baud if debugging startup, preset loading, or OTA status.

## First Boot

On first boot, the firmware checks EEPROM address `0` for marker value `86`.

- If the marker is missing, `initEEprom()` writes default preset data for 16 banks.
- The firmware then loads bank `0`.
- Touch inputs are calibrated during startup by `calibrage()`.

Keep hands away from the conductive buttons during calibration.

## USB MIDI

The firmware starts USB MIDI with:

```cpp
MIDI.begin();
USB.begin();
```

The browser app looks for devices named `TinyUSB MIDI` or `ESP32S3_DEV`.

## OTA Update Note

The sketch contains an `update()` function using `WiFi.h` and `HTTPUpdate.h`. Public source intentionally leaves:

```cpp
const char* SSID = "";
const char* PASS = "";
```

Set these locally only if you use OTA. Do not commit real WiFi credentials.

## Known Pins From Current Firmware

- Ultrasonic trigger: GPIO `47`
- Ultrasonic echo: GPIO `45`
- LED data: GPIO `21`
- Touch input array: `myPin[14] = {9,10,11,12,4,5,6,7,13,14,8,3,1,2}`

Validate these against the actual board and enclosure wiring before publishing a final wiring diagram.
