# Instrucciones rápidas para instalar WordPress localmente (en español)

1) Estado actual
- Los archivos de WordPress ya están presentes en `XAMPP/htdocs/wordpress/`.

2) Crear la base de datos y el usuario
- Edita `create_wp_db.sql` en `XAMPP/` y reemplaza `WP_PASSWORD_HERE` por una contraseña segura.
- Importa el script con phpMyAdmin (http://localhost/phpmyadmin/) o desde línea de comandos:

```powershell
# Desde PowerShell (ejecuta desde tu cuenta de usuario):
& 'C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\mysql_start.bat'
& 'C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache_start.bat'

# Importar (si `mysql` está en PATH o usar la ruta completa a mysql.exe):
mysql -u root < "C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\create_wp_db.sql"
```

Nota: por defecto XAMPP suele tener el usuario `root` sin contraseña. Si cambias credenciales, ajusta el comando.

3) Configurar `wp-config.php`
- La instalación web puede crear `wp-config.php` automáticamente si visitas `http://localhost/wordpress`.
- Si prefieres crear el archivo manualmente: copia `XAMPP/wp-config-example.php` a `XAMPP/htdocs/wordpress/wp-config.php`, reemplaza las constantes `DB_NAME`, `DB_USER`, `DB_PASSWORD` y pega salts únicos desde:

  https://api.wordpress.org/secret-key/1.1/salt/

4) Iniciar instalación en el navegador
- Abre `http://localhost/wordpress` y sigue el asistente (elige idioma, crea el usuario admin, etc.).

5) Notas sobre privacidad / servidor privado
- Este servidor es local en tu máquina (XAMPP). Solo accesible desde tu equipo a menos que abras puertos o cambies configuración de red.
- Si quieres que solo usuarios en la red local accedan, no publiques puertos en tu router y mantén Apache escuchando en `localhost`.

7) Instalación automática y creación de usuario admin
- He añadido un script útil `htdocs/wordpress/autoinstall.php` que crea la instalación (si no existe) y asegura que exista un usuario administrador `pablo` con la contraseña que hayas solicitado.

- Pasos para usarlo:

  1. Inicia Apache y MySQL:

```powershell
& 'C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\mysql_start.bat'
& 'C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\apache_start.bat'
```

  2. Abre en tu navegador: `http://localhost/wordpress/autoinstall.php`

  3. Verás mensajes de estado: el script instalará WordPress si es necesario y creará/actualizará el usuario `pablo` con contraseña `Stefano49228080`.

  4. Por seguridad, borra `autoinstall.php` después de verificar que puedes entrar con `pablo`.

8) ¿Problemas?
- Si el sitio no se instala automáticamente, revisa que `wp-config.php` exista en `htdocs/wordpress` y que `DB_HOST`, `DB_USER` y `DB_PASSWORD` sean correctos. Para XAMPP normalmente `DB_USER`=`root` y `DB_PASSWORD` es vacío.

6) ¿Quieres que lo configure yo?
- Puedo generar `wp-config.php` ya rellenado y ejecutar el script SQL si me confirmas:
  - la contraseña que quieres usar para `wpuser`, y
  - si quieres que el usuario de base de datos sea distinto.
