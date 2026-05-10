#!/bin/bash
src="$HOME/.bashrc"
dest_dir="$HOME/repos/linux-setup/configs"

mkdir -p "$dest_dir"
cp "$src" "$dest_dir/"
echo "Copiado $src a $dest_dir/"
