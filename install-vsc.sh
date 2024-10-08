#!/bin/bash

# Función para mostrar mensajes de error en rojo
error_message() {
    echo -e "\033[31mError: $1\033[0m" >&2
}

# Definir URL de descarga
vscode_url="https://code.visualstudio.com/sha/download?build=stable&os=linux-deb-x64"
 
# Descargar VSCode
echo "Descargando VSCode..."
if ! wget -O vscode.deb "$vscode_url"; then
install-vscodes.sh    exit 1
fi

 
# Instalar VSCode
echo "Instalando VSCode..."
if ! sudo dpkg -i vscode.deb; then
    error_message "Hubo un error al instalar VSCode."
    exit 1
fi

# Instalar dependencias faltantes
if ! sudo apt-get -f install -y; then
    error_message "Hubo un error al instalar las dependencias de VSCode."
    exit 1
fi

  
echo "Instalación completada con éxito."

rm vscode*.deb
