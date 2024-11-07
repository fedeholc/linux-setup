[https://discuss.pixls.us/t/amd-opencl-ubuntu-22-04-not-working-with-darktable/32298/18](https://discuss.pixls.us/t/amd-opencl-ubuntu-22-04-not-working-with-darktable/32298/18)

funcionó bajando el archivo amdgpu-install_22.20.50204-1_all.deb

y luego:

amdgpu-install --usecase=graphics --opencl=legacy --accept-eula --no-32

---

En linux mint 22 (ubuntu 24.04) lo anterior no funcionó.

Con esto:
/usr/bin/amdgpu-install --usecase=opencl --opencl=legacy  
andá opencl, tira un error cada vez que se instala algo (similar al error de querer recompilar dkms pero son unos pocos segundos, lo otro era de minutos).

## OJO: eso tampoco funcionó pues al reiniciar no hay video.

aca dicen que no esta soportado 24.04 aun
https://rocm.docs.amd.com/en/latest/compatibility/compatibility-matrix.html

---

acá todavía no aparece ubuntu 24 https://support.zivid.com/en/latest/getting-started/software-installation/gpu/install-opencl-drivers-ubuntu.html
