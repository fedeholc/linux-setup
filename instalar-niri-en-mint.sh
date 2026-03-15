#!/bin/bash

# 1. Actualizar repositorios
sudo apt update

# 2. Instalar herramientas de compilación y Rust (si no está)
sudo apt install -y curl build-essential clang libclang-dev pkg-config git meson ninja-build

if ! command -v cargo &> /dev/null; then
    echo "Instalando Rust..."
    curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
    source $HOME/.cargo/env
fi

# 3. Instalar TODAS las librerías de desarrollo necesarias
echo "Instalando dependencias de librerías..."
sudo apt install -y \
    libudev-dev \
    libseat-dev \
    libxkbcommon-dev \
    libinput-dev \
    libpixman-1-dev \
    libgbm-dev \
    libgles2-mesa-dev \
    libpango1.0-dev \
    libcairo2-dev \
    libpipewire-0.3-dev \
    libglib2.0-dev \
    libdisplay-info-dev \
    libsystemd-dev

# 4. Instalar dependencias de ejecución (Alacritty y Fuzzel)
# Nota: Si tu Mint es antiguo y no tiene Fuzzel, esto fallará, 
# pero niri se instalará igual.
sudo apt install -y alacritty fuzzel || echo "Alacritty/Fuzzel no encontrados, instálalos manualmente."

# 5. Clonar y Compilar Niri
echo "Clonando y compilando Niri..."
git clone https://github.com/YaLTeR/niri.git
cd niri
cargo build --release

# 6. Instalar el binario y el archivo de sesión para el Login
sudo cp target/release/niri /usr/local/bin/
sudo cp resources/niri.desktop /usr/share/wayland-sessions/
sudo cp resources/niri-portals.conf /usr/share/xdg-desktop-portal/

echo "------------------------------------------------"
echo "¡Listo! Cierra sesión y elige 'Niri' en el login."
echo "Atajo para salir: Super + Shift + E"
echo "------------------------------------------------"