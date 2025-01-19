sudo apt install dropbox -y
sudo apt install gimp -y
sudo apt install git -y
sudo apt install gpa -y
sudo apt install kazam -y
sudo apt install kupfer -y
sudo apt install pdfarranger -y
sudo apt install samba -y
sudo apt install smplayer -y
sudo apt install unrar -y
sudo apt install vlc -y

sudo apt install wmctrl -y
sudo apt install xdotool -y

apps:

- Chrome beta
- Firefox
- brave
- neovim
- masterpdfeditor4
- oh-my-zsh

script

- dbbrowser for sqlite
- nvm node
- Chrome
- VsCode
- gh

ok

- darktable https://github.com/darktable-org/darktable/releases
- freefilesync https://freefilesync.org/download.php
- xnview https://download.xnview.com/XnViewMP-linux-x64.deb
- local send https://localsend.org/download

con sudo

pendientes:

- syncthing / resilio

- brave
- chromebeta
- kitty
- lazyvim
- tmux

fonts?

// a backupear copiar

- claves ssh en home/.ssh
- home/.vscode (extensiones) y home/.config/Code/User
- home/.config/google-chrome
- home/.config/darktable
- home/.gnupg
- home/.loca/share/fonts
  para copiar todas las subcarpetas y archivos menos nodemodules:
  rsync -av --exclude='node_modules' /origen /destino

excluir también next
rsync -av --exclude='node_modules' --exclude='.next' /ruta/de/origen/ /ruta/de/destino/
