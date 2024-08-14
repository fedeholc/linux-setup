#!/bin/bash

# Definir la función parse_git_branch
git_branch_function='
parse_git_branch() {
    git branch 2>/dev/null | sed -e '\''/^[^*]/d'\'' -e '\''s/* \(.*\)/(\1)/'\''
}
'

# Definir el PROMPT_COMMAND
prompt_command='
PROMPT_COMMAND='\''PS1="\u@\h \[\e[33m\]\w \[\e[91m\]\$(parse_git_branch)\[\e[00m\]$ "'\''
'

# Agregar la función y el PROMPT_COMMAND al archivo ~/.bashrc si no existen ya
if ! grep -q "parse_git_branch()" ~/.bashrc; then
    echo "$git_branch_function" >> ~/.bashrc
fi

if ! grep -q "PROMPT_COMMAND='PS1" ~/.bashrc; then
    echo "$prompt_command" >> ~/.bashrc
fi

# Recargar el archivo ~/.bashrc para aplicar los cambios
source ~/.bashrc

echo "Configuración agregada y recargada en ~/.bashrc"
