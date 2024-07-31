#!/bin/bash

# Verifica si wget está instalado
if ! command -v wget &> /dev/null; then
    echo "wget no está instalado. Instalando wget..."
    sudo apt-get update
    sudo apt-get install -y wget
else
    echo "wget ya está instalado."
fi
