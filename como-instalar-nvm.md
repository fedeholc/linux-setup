ver https://github.com/nvm-sh/nvm?tab=readme-ov-file
Bajar y ejecutar script:

wget -qO- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash

source ~/.bashrc

checkiar que quedó instalado

command -v nvm

You can list available versions using ls-remote:

nvm ls-remote

To install a specific version of node:

nvm install 14.7.0 # or 16.3.0, 12.22.1, etc
nvm use version
instalar ultima lts con

nvm install --lts
nvm use --lts

(luego hay que hacer `sudo apt install npm` para instalar npm)
