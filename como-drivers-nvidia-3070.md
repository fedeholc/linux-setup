El error `driver (null)` indica que, aunque el sistema ve físicamente la placa (el ID `10de:2484` corresponde efectivamente a la **RTX 3070**), el kernel de Linux no tiene cargado el módulo de Nvidia para manejarla, o hay un conflicto con el driver genérico.

Para solucionar esto en Linux Mint, seguí estos pasos en orden:

### 1. Limpiar instalaciones previas

A veces quedan restos de drivers mal configurados. Vamos a limpiar lo que haya:

```bash
sudo apt autoremove --purge nvidia*
```

### 2. Instalar el driver específico y las librerías de computación

Para la serie 3000, lo ideal es usar una versión estable y moderna (la 535 o 550). Vamos a instalar el driver junto con el soporte para OpenCL:

```bash
sudo apt update
sudo apt install nvidia-driver-535 nvidia-dkms-535 nvidia-utils-535 libnvidia-compute-535
```

> **Importante:** Si el instalador te pregunta por **"Secure Boot"**, te va a pedir crear una contraseña. **Anotala**. Al reiniciar, aparecerá una pantalla azul (MOK Management). Debes elegir "Enroll MOK" e ingresar esa clave para que el sistema permita cargar el driver de Nvidia.

### 3. Forzar la carga del módulo

Si después de reiniciar el comando `clinfo` sigue fallando, es probable que el driver libre (nouveau) esté bloqueando al de Nvidia. Creá un archivo de "blacklist":

```bash
sudo bash -c 'echo "blacklist nouveau" > /etc/modprobe.d/blacklist-nouveau.conf'
sudo bash -c 'echo "options nouveau modeset=0" >> /etc/modprobe.d/blacklist-nouveau.conf'
sudo update-initramfs -u
```

### 4. Verificar el estado del kernel

Reiniciá la PC y verificá si el driver está activo con este comando:

```bash
nvidia-smi
```

- **Si ves una tabla con el uso de memoria de la GPU:** El driver está perfecto.
- **Si dice "Could not communicate with the NVIDIA driver":** El driver no se cargó (posiblemente por el Secure Boot mencionado en el paso 2).

### 5. El toque final para Darktable

Una vez que `nvidia-smi` funcione, probá de nuevo el comando de diagnóstico:

```bash
clinfo | grep -i "device name"
```

Debería devolverte: `Device Name: NVIDIA GeForce RTX 3070`.

Finalmente, ejecutá `darktable-cltest` en la terminal. Este comando inicializa los núcleos de la placa para que cuando abras la interfaz de Darktable, el soporte OpenCL ya aparezca como **"Disponible"** y **"Activado"**.
