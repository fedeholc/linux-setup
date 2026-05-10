#!/bin/bash
src_dir="$HOME/repos"
dest_dir="$HOME/Dropbox"
output="env_backup_$(date +%Y%m%d_%H%M%S).zip"

read -rsp "Password para el zip: " password
echo
find "$src_dir" -name '.env*' -type f -print | zip -P "$password" "$output" -@

if [ -f "$output" ]; then
  mv "$output" "$dest_dir/"
  echo "Creado: $dest_dir/$output"
else
  echo "No se encontraron archivos .env* en $src_dir"
fi
