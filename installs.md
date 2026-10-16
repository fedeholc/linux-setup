apps:

- Chrome beta
- Firefox
- brave
- neovim
- masterpdfeditor4
- oh-my-zsh
- vuescan https://www.hamrick.com/alternate-versions.html  
ok

- starship prompt Starship https://share.google/pZwJEjkzaJNG9ifkP
- darktable https://github.com/darktable-org/darktable/releases
- freefilesync https://freefilesync.org/download.php
- xnview https://download.xnview.com/XnViewMP-linux-x64.deb
- local send https://localsend.org/download

pendientes:

- syncthing / resilio
- brave
- chromebeta
- kitty
- lazyvim
- tmux
- ghostty
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
