# ~/.bashrc: executed by bash(1) for non-login shells.
# see /usr/share/doc/bash/examples/startup-files (in the package bash-doc)
# for examples

parse_git_branch() {
  git branch 2>/dev/null | sed -e '/^[^*]/d' -e 's/* \(.*\)/(\1)/'
}

#export PS1="\u@\h \[\e[33m\]\w \[\e[91m\]$(parse_git_branch)\[\e[00m\]$ "

PROMPT_COMMAND='PS1="\u@\h \[\e[33m\]\w \[\e[91m\]$(parse_git_branch)\[\e[00m\]$ "'

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"                   # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion" # This loads nvm bash_completion
alias ls='ls --color=auto'

export FLYCTL_INSTALL="/home/fede/.fly"
export PATH="$FLYCTL_INSTALL/bin:$PATH"

export PATH="$PATH:/opt/nvim-linux-x86_64/bin"

# opencode
export PATH=/home/fede/.opencode/bin:$PATH

# oc: run opencode non-interactively with a prompt and print result to terminal
oc() {
  opencode run "$@"
}

# ocp: run opencode in plan mode (read-only, produces a plan)
ocp() {
  opencode run --agent plan "$@"
}
export PATH=/home/fede/repos/linux-setup/shortcuts:$PATH
export PATH=/home/fede/repos/linux-setup/scripts:$PATH

export PATH=$HOME/.local/bin:$PATH
alias idrive='/opt/IDriveForLinux/bin/idrive'

# Added by Antigravity CLI installer
export PATH="/home/fede/.local/bin:$PATH"

# pnpm
export PNPM_HOME="/home/fede/.local/share/pnpm"
case ":$PATH:" in
*":$PNPM_HOME/bin:"*) ;;
*) export PATH="$PNPM_HOME/bin:$PATH" ;;
esac
# pnpm end

eval "$(starship init bash)"
