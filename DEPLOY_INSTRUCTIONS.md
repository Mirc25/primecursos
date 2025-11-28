Despliegue - Instrucciones rápidas

Objetivo: reemplazar completamente la carpeta remota `prime-cursos` por la copia local probada.

Pasos previos (LOCAL)
- Asegúrate de tener Apache arrancado y verificar localmente:
  - http://localhost/prime-cursos/
  - http://localhost/prime-cursos/show_courses.php  (debería devolver 200)

1) Generar ZIP (en tu máquina local)
- Ejecuta en PowerShell (desde cualquier carpeta):
  ```powershell
  cd "C:\Users\stefa\Desktop\CARPETA WORDPRES"
  .\create_deploy_zip.ps1
  ```
- El script deja dos archivos en tu Escritorio:
  - `prime-cursos-backup-YYYYMMDD_HHMMSS.zip` (copia de seguridad local)
  - `prime-cursos-deploy-YYYYMMDD_HHMMSS.zip` (ZIP listo para subir)

2) Subir el ZIP al servidor
- Con cPanel/File Manager:
  - Renombrar la carpeta `prime-cursos` en `public_html` a `prime-cursos-backup-YYYYMMDD_HHMMSS` (o descargarla primero si quieres backup remoto).
  - Subir `prime-cursos-deploy-...zip` al `public_html` y usar Extract.
- Con SFTP/FTP (FileZilla):
  - Renombra o descarga la carpeta remota `prime-cursos` como backup.
  - Sube el ZIP al servidor (por ejemplo a `/tmp` o `public_html`).
  - Si tu hosting no permite extraer ZIP desde File Manager, puedes pedir al soporte o usar SSH (siguiente sección).

3) Desplegar por SSH (si tienes acceso)
- Subir el ZIP desde tu máquina local:
  ```bash
  scp "C:/Users/stefa/Desktop/prime-cursos-deploy-YYYYMMDD_HHMMSS.zip" usuario@host:/tmp/
  ```
- En el servidor (ajusta `public_html` y usuario web):
  ```bash
  ssh usuario@host
  cd /home/usuario/public_html
  mv prime-cursos prime-cursos-backup-$(date +%Y%m%d_%H%M%S)
  unzip /tmp/prime-cursos-deploy-YYYYMMDD_HHMMSS.zip -d ./prime-cursos
  # Ajusta el owner según el servidor web (ej. www-data, apache)
  chown -R www-data:www-data ./prime-cursos
  find ./prime-cursos -type d -exec chmod 755 {} \;
  find ./prime-cursos -type f -exec chmod 644 {} \;
  exit
  ```

4) Comprobaciones post-despliegue
- En tu navegador (limpia cache o usa modo incognito):
  - https://www.primecursos.org/prime-cursos/
  - https://www.primecursos.org/prime-cursos/show_courses.php (debe devolver 200)
  - https://www.primecursos.org/prime-cursos/courses.json
- Si ves 404 en `show_courses.php`:
  - Revisar que exista exactamente `show_courses.php` en la carpeta remota (case-sensitive)
  - Revisar `.htaccess` en `public_html` y en `prime-cursos` por reglas Rewrite que puedan bloquear acceso.
  - Verificar permisos (archivos 644, carpetas 755) y owner del webserver.

5) Si todo OK: borrar el backup remoto (opcional) o guardarlo por seguridad.

Notas y advertencias
- La operación reemplaza la carpeta remota `prime-cursos`. Asegúrate de tener backups de cualquier dato dinámico (bases de datos, uploads fuera de la carpeta) antes de borrar.
- Si tienes integraciones (webhooks, postbacks) que dependen de `hotmart_create_session.php` u otros scripts, verifica credenciales y configuraciones en `config.sample.php` / `inc_helpers.php`.

Si quieres, puedo:
- Generar un archivo `ftp_upload_instructions.txt` con comandos detallados para FileZilla o WinSCP.
- Revisar el `.htaccess` local y sugerir cambios para evitar 404 si pegas aquí su contenido.
