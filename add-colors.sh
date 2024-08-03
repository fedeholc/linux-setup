#!/bin/bash
curl https://raw.githubusercontent.com/riobard/bash-powerline/master/bash-powerline.sh > ~/.bash-powerline.sh

source ~/.bash-powerline.sh


wget https://raw.githubusercontent.com/seebi/dircolors-solarized/master/dircolors.256dark

eval "$(dircolors -b dircolors.256dark)"

# Define the alias to be added
ALIAS_LINE="alias ls='ls --color=auto'"

# Check if the alias already exists in .bashrc
if grep -Fxq "$ALIAS_LINE" ~/.bashrc
then
    echo "Alias already exists in ~/.bashrc"
else
    # Add the alias to .bashrc
    echo "$ALIAS_LINE" >> ~/.bashrc
    echo "Alias added to ~/.bashrc"

    # Optionally, source .bashrc to apply changes immediately
    source ~/.bashrc
fi

