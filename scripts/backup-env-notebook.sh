#!/bin/bash

export PATH="/usr/local/bin:/usr/bin:/bin:$PATH"

src_dir="$HOME/repos"
dest_dir="$HOME/backup-idrive"
output="env_backup_$(date +%Y%m%d_%H%M%S).zip"
pass_file="$HOME/.backup_pass"

if [ ! -f "$pass_file" ]; then
  echo "Error: No existe $pass_file" >&2
  exit 1
fi

password=$(cat "$pass_file")

mkdir -p "$dest_dir"

find "$src_dir" -name '.env*' -type f -print | zip -P "$password" "$output" -@

if [ -f "$output" ]; then
  mv "$output" "$dest_dir/"
  echo "Creado: $dest_dir/$output"
else
  echo "No se encontraron archivos .env* en $src_dir"
fi
