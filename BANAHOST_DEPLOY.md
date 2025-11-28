Guía mínima para desplegar Prime Cursos en Banahost

1) Preparación local
- Rellena `prime-cursos-config.php.template` con tus valores reales y guarda como `prime-cursos-config.php`.
- NO subas `prime-cursos-config.php` dentro de `public_html`.

2) Subir archivos al servidor Banahost
- Usa SFTP/FTP o el panel de Banahost (File Manager) para subir tu código a `public_html`.
- Sube `prime-cursos-config.php` a tu `home` (por ejemplo `/home/tuusuario/prime-cursos-config.php`) — fuera de `public_html`.

3) Variables de entorno y opciones (recomendado)
- Si el panel cPanel/hosting permite establecer variables de entorno, define:
  - `PRIME_DATA_DIR` => ruta a datos (ej: `/home/tuusuario/prime-cursos-data`)
  - `PAYPAL_ENV`, `PAYPAL_CLIENT`, `PAYPAL_SECRET` (llaves nuevas y rotadas)
- Si no puedes definir variables de entorno, crea `prime-cursos-config.php` en tu `home` con los valores rellenados.

4) Configurar PHP para leer variables (opciones)
- Usar `.htaccess` para SetEnv (si el hosting lo permite):
  SetEnv PAYPAL_CLIENT "tu_client"
  SetEnv PAYPAL_SECRET "tu_secret"
- O editar `user.ini` / `php.ini` según lo permita Banahost.

5) Base de datos
- Crea la base de datos y usuario via cPanel → MySQL Databases.
- Importa `create_wp_db.sql` si aplica usando phpMyAdmin.
- Actualiza `wp-config.php` (si es WordPress) con las credenciales DB.

6) Permisos y seguridad
- Asegura que `prime-cursos-config.php` tenga permisos restrictivos (ej. 640).
- No dejes archivos de backup (.bak) o con credenciales en `public_html`.

7) PayPal
- Asume que las claves actuales están comprometidas: rota (revoca y vuelve a generar) `client` y `secret` en PayPal Dashboard.
- Configura las credenciales nuevas en las variables de entorno o en el archivo fuera del webroot.

8) Verificación
- Accede a la URL pública y revisa logs (error_log o cPanel) si algo falla.
- Prueba el flujo de pago en `sandbox` antes de cambiar `PAYPAL_ENV` a `live`.

Si quieres, puedo:
- Subir los archivos por FTP/SFTP si me das las credenciales (no recomendable compartirlas aquí), o
- Generar los comandos SFTP/WinSCP para que ejecutes localmente, o
- Ayudarte a rellenar `prime-cursos-config.php` con valores concretos para Banahost.
