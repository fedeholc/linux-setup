#!/bin/bash

# Verifica si wget está instalado
if ! command -v wget &> /dev/null; then
    echo "wget no está instalado. Instalando wget..."
    sudo apt-get update
    sudo apt-get install -y wget
else
    echo "wget ya está instalado."
fi

# Descargar el paquete de Google Chrome
echo "Descargando la última versión de Google Chrome..."
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Instalar Google Chrome
echo "Instalando Google Chrome..."
sudo apt-get install -y ./google-chrome-stable_current_amd64.deb

# Limpiar archivos temporales
echo "Limpiando archivos temporales..."
rm google-chrome-stable_current_amd64.deb

echo "La instalación de Google Chrome ha finalizado."
