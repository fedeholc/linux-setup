# git & github - autenticación ssh

Para subir a un repo de github desde la CLI pide autenticar para lo cual una opción es instalar Git Credential Manager, y luego `git-credential-manager configure`.

Pero mejor usar SSH que no pide autenticar cada vez:

- Generar clave: `ssh-keygen -t rsa -b 4096 -C "federicoholc@gmail.com"`
- Agregar clave al agente:
  `eval "$(ssh-agent -s)"`
  `ssh-add ~/.ssh/id_rsa`
- Agregar clave a la cuenta de github
  Para ver la clave: `<!-- cat ~/.ssh/id_rsa.pub -->`
- Cambiar la URL del repo a SSH (si ya estaba clonado usando HTTPS):
  `git remote set-url origin git@github.com:fedeholc/repo.git`

si no funciona la conexión probar `ssh -T git@github.com` para ver si se conecta.
Si no conecta, crear el archivo `~/.ssh/config` y agregarle:
```bash 
Host github.com
    Hostname ssh.github.com
    Port 443
```