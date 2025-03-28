#!/bin/bash

# Buscar la línea que contiene "HID_NAME=Keyboard K380" y extraer la ruta del archivo
DEVICE_PATH=$(grep -FH "HID_NAME=Keyboard K380" /sys/class/hidraw/hidraw*/device/uevent | cut -d':' -f1)

if [[ -z "$DEVICE_PATH" ]]; then
    echo "No se encontró el dispositivo Keyboard K380."
    exit 1
fi

# Extraer el nombre del dispositivo (ej. hidraw10) desde la ruta
DEVICE=$(echo "$DEVICE_PATH" | awk -F'/' '{print $(NF-2)}')

if [[ -z "$DEVICE" ]]; then
    echo "No se pudo determinar el dispositivo."
    exit 1
fi

# Ejecutar el comando para enviar los datos al dispositivo
echo -ne "\x10\xff\x0b\x1e\x00\x00\x00" | sudo tee /dev/$DEVICE > /dev/null

echo "Comando enviado a /dev/$DEVICE"
