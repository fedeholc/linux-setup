Vale, te explico el **camino limpio y seguro** para exponer **Immich en tu PC de escritorio** usando **Cloudflare Tunnel** y tu **dominio**, sin abrir puertos ni tocar el router. 🔒🚀
(Es justo el caso ideal para Tunnels).

---

## 🧩 Requisitos previos

Asegúrate de tener esto antes de empezar:

- ✅ Dominio **gestionado por Cloudflare** (DNS ya apunta a Cloudflare)
- ✅ Immich funcionando **en local** (normalmente con Docker)
- ✅ Cuenta de Cloudflare
- ✅ Tu PC encendido cuando quieras acceder a Immich 😅

Asumiré:

- Immich corre en `http://localhost:2283`
- Sistema: **Windows** o **Linux** (te indico ambos)

---

## 1️⃣ Instalar `cloudflared` en tu PC

### 🔹 Windows

1. Descarga:
   👉 [https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/)
2. Instala el `.msi`
3. Abre **PowerShell** como administrador

### 🔹 Linux

```bash
sudo apt install cloudflared
```

(o descarga el binario si no usas Debian/Ubuntu)

Comprueba:

```bash
cloudflared --version
```

---

## 2️⃣ Autenticar tu PC con Cloudflare

Ejecuta:

```bash
cloudflared tunnel login
```

- Se abrirá el navegador
- Inicia sesión en Cloudflare
- Selecciona tu dominio

Esto crea un certificado en tu equipo (clave para el tunnel).

---

## 3️⃣ Crear el Tunnel

```bash
cloudflared tunnel create immich
```

Guárdate:

- **Tunnel UUID**
- Se crea un archivo `.json` de credenciales

Ejemplo:

```
Tunnel ID: a1b2c3d4-xxxx-xxxx
```

---

## 4️⃣ Crear el archivo de configuración

Crea el archivo:

### 📄 Windows

```powershell
notepad C:\Users\TU_USUARIO\.cloudflared\config.yml
```

### 📄 Linux

```bash
nano ~/.cloudflared/config.yml
```

Contenido 👇 (ajusta lo necesario):

```yaml
tunnel: a1b2c3d4-xxxx-xxxx
credentials-file: C:\Users\TU_USUARIO\.cloudflared\a1b2c3d4-xxxx-xxxx.json

ingress:
  - hostname: immich.tudominio.com
    service: http://localhost:2283
  - service: http_status:404
```

⚠️ En Linux cambia la ruta del `credentials-file`.

---

## 5️⃣ Crear el DNS automáticamente

Ejecuta:

```bash
cloudflared tunnel route dns immich immich.tudominio.com
```

Esto:

- Crea un **CNAME**
- Activa el proxy de Cloudflare (nube naranja ☁️)
- No necesitas tocar DNS manualmente

---

## 6️⃣ Levantar el Tunnel

Prueba primero a mano:

```bash
cloudflared tunnel run immich
```

Ve a:

```
https://immich.tudominio.com
```

Si carga Immich → 🎉 ya está funcionando.

---

## 7️⃣ (Opcional pero recomendado) Ejecutarlo como servicio

### 🔹 Windows

```powershell
cloudflared service install
```

### 🔹 Linux

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

Así el tunnel:

- Arranca solo
- Sobrevive reinicios
- No depende de una terminal abierta

---

## 🔐 Extra recomendado: proteger con login

Puedes añadir **Cloudflare Access** para:

- Login con Google
- Email autorizado
- 2FA

Ideal si Immich no debe ser público.
Si quieres, te explico este paso aparte.

---

## 🧠 Resumen rápido

✔ No abres puertos
✔ No necesitas IP pública
✔ HTTPS automático
✔ Funciona perfecto para Immich

---

Si quieres, dime:

- 🖥 **Windows o Linux**
- 🐳 **Docker compose de Immich**
- 🔐 Si quieres **protegerlo con login**

y te lo ajusto **exacto a tu setup**, sin suposiciones 👌
