Carpeta 'todo_web' — archivos listos para subir a /home/TU_USUARIO/public_html/

Qué hace esta carpeta:
- Contiene los archivos y carpetas que deben ir al directorio público del hosting (`public_html`).

Qué se excluyó (NO subir estas a public_html):
- prime-cursos-config.php  -> DEBE ir en /home/TU_USUARIO/ (fuera de public_html)
- prime-cursos-data/       -> DEBE ir en /home/TU_USUARIO/prime-cursos-data/ (fuera de public_html)
- create_wp_db.sql         -> Subir a /home/TU_USUARIO/ y luego importarlo a la base de datos (phpMyAdmin o mysql)
- Archivos comprimidos (*.zip, *.gz), dumps (*.sql), copias de seguridad (*.bak)

Pasos a seguir:
1) Revisa el contenido de esta carpeta `todo_web` y confirma que "index.php" y la estructura de WordPress (si aplica) estén presentes.
2) Sube todo el contenido de `todo_web` al servidor en `/home/TU_USUARIO/public_html/` (mantén la estructura de carpetas).
3) Sube `prime-cursos-config.php` a `/home/TU_USUARIO/` (FUERA de public_html).
4) Sube la carpeta `prime-cursos-data` a `/home/TU_USUARIO/prime-cursos-data/` (FUERA de public_html) o sube el ZIP y descomprímelo en servidor.
5) Importa `create_wp_db.sql` a la base de datos usando phpMyAdmin o el comando `mysql`.
6) Ajusta permisos: `prime-cursos-config.php` => 640; `prime-cursos-data` => 750; `public_html` => 755.

Notas:
- Antes de subir, rota las claves de PayPal si todavía están en texto plano en algún archivo.
- Si necesitas, ejecuta el script `prepare_public_html.ps1` en la carpeta principal para (re)generar `todo_web`.
