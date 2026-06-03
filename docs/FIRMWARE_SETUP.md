# Firmware Setup

The public firmware entry point is `firmware/ultragear_usb_midi/ultragear_usb_midi.ino`.

The public sketch is based on the known-good `UG_4X_45_mic_in.ino` firmware. Legacy sketches are preserved separately because they still contain WiFi/OTA update experiments.

## Requirements

- Arduino IDE or compatible Arduino CLI workflow.
- ESP32 Arduino board package with USB MIDI support for the ESP32-S3 WROOM board used by the instrument.
- FastLED library.
- ESP32 core libraries providing `USB.h`, `USBMIDI.h`, and `EEPROM.h`.

## Arduino IDE Board Settings

Use the same Arduino IDE board settings that successfully compile `UG_4X_45_mic_in.ino`. The public sketch is intentionally derived from that known-good source.

The current board is an ESP32-S3 Espressif WROOM module. The exact Arduino IDE settings are captured in:

```text
assets/photos/arduino_ide_settings.png
```

- Board package: `esp32 by Espressif Systems`
- Board: `ESP32S3 Dev Module`
- Port shown in screenshot: `COM3`
- USB CDC On Boot: `Disabled`
- CPU Frequency: `240MHz (WiFi)`
- Core Debug Level: `None`
- USB DFU On Boot: `Disabled`
- Erase All Flash Before Sketch Upload: `Disabled`
- Events Run On: `Core 1`
- Flash Mode: `QIO 80MHz`
- Flash Size: `8MB (64Mb)`
- JTAG Adapter: `Disabled`
- Arduino Runs On: `Core 1`
- USB Firmware MSC On Boot: `Disabled`
- Partition Scheme: `8M with spiffs (3MB APP/1.5MB SPIFFS)`
- PSRAM: `Disabled`
- Upload Mode: `USB-OTG CDC (TinyUSB)`
- Upload Speed: `256000`
- USB Mode: `USB-OTG (TinyUSB)`
- Zigbee Mode: `Disabled`

If Arduino IDE reports linker errors inside the ESP32 core, first confirm the board package and board settings match the working `UG_4X_45_mic_in.ino` setup.

## Upload Steps

1. Open `firmware/ultragear_usb_midi/ultragear_usb_midi.ino`.
2. Select the correct ESP32 board and USB port.
3. Install the required libraries.
4. Build the sketch.
5. Upload over USB.
6. Open the serial monitor at `115200` baud if debugging startup or preset loading.

## First Boot

On first boot, the public firmware checks EEPROM address `0` for marker value `87`.

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

## Public USB MIDI Build

The public firmware focuses on USB MIDI for clarity and reliability. WiFi, network MIDI, and OTA update behavior are disabled/removed from `firmware/ultragear_usb_midi/ultragear_usb_midi.ino`.

Older WiFi/OTA experiments are preserved in `firmware/legacy/UG_4X_45_mic_in/UG_4X_45_mic_in.ino`. See `docs/FIRMWARE_WIFI_NOTES.md`.

## Known Pins From Current Firmware

- Ultrasonic trigger: GPIO `15`
- Ultrasonic echo: GPIO `17`
- LED data: GPIO `21`
- Touch input array: `myPin[14] = {9,10,11,12,4,5,6,7,13,14,8,3,1,2}`

Validate these against the actual board and enclosure wiring before publishing a final wiring diagram.

## Troubleshooting Compile Errors

If Arduino IDE reports a linker error such as:

```text
undefined reference to `getCpuFrequencyMhz'
```

or many `USBMIDI` / `MIDI` symbol errors, check the selected board first. This usually means the IDE is not compiling with the same ESP32 board/core settings as the known-good sketch.

Recommended recovery:

1. Close Arduino IDE.
2. Reopen `firmware/ultragear_usb_midi/ultragear_usb_midi.ino`.
3. Select `ESP32S3 Dev Module`.
4. Match the USB/TinyUSB settings shown above.
5. Compile again.
