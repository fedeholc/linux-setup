#!/bin/bash

# Actualiza la lista de paquetes
echo "Actualizando la lista de paquetes..."
sudo apt update

# Instala Git
echo "Instalando Git..."
sudo apt install -y git

# Verifica la instalación de Git
if command -v git &> /dev/null
then
    echo "Git se ha instalado correctamente."
else
    echo "Error: Git no se pudo instalar."
    exit 1
fi

# Configura el nombre de usuario y el correo electrónico
read -p "Introduce tu nombre de usuario para Git: " git_username
read -p "Introduce tu correo electrónico para Git: " git_email

echo "Configurando el nombre de usuario y el correo electrónico de Git..."
git config --global user.name "$git_username"
git config --global user.email "$git_email"

# Verifica la configuración de Git
echo "Configuración de Git:"
git config --global --list

# Genera una clave SSH
read -p "¿Deseas generar una nueva clave SSH? (s/n): " generate_ssh
if [[ "$generate_ssh" == "s" || "$generate_ssh" == "S" ]]
then
    echo "Generando una nueva clave SSH..."
    ssh-keygen -t rsa -b 4096 -C "$git_email"
    
    # Inicia el agente SSH y agrega la clave
    eval "$(ssh-agent -s)"
    ssh-add ~/.ssh/id_rsa

    # Muestra la clave pública
    echo "Tu clave pública SSH es:"
    cat ~/.ssh/id_rsa.pub

    echo "Agrega esta clave a tu cuenta de GitHub/GitLab/Bitbucket, etc."
fi

echo "Configuración completada."
