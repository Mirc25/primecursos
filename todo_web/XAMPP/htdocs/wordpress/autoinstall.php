<?php
/*
 * autoinstall.php
 * Ejecutar una vez desde el navegador: http://localhost/wordpress/autoinstall.php
 * Crea la instalación de WordPress (si no existe) y asegura/crea el usuario admin `pablo`.
 * Después de ejecutar, borra este archivo por seguridad.
 */

error_reporting(E_ALL);
ini_set('display_errors', 1);

if (php_sapi_name() === 'cli') {
    echo "Este script debe ejecutarse desde el navegador web.\n";
    exit;
}

define('WP_AUTO_INSTALL_USER','pablo');
define('WP_AUTO_INSTALL_PASS','Stefano49228080');
define('WP_AUTO_INSTALL_EMAIL','pablo@local');
define('WP_AUTO_INSTALL_SITENAME','Mi WordPress Local');

$wp_load = __DIR__ . '/wp-load.php';
if (!file_exists($wp_load)) {
    echo "No se encontró WordPress en este directorio. Asegúrate de que los archivos estén en `htdocs/wordpress`.";
    exit;
}

require_once $wp_load;

require_once ABSPATH . 'wp-admin/includes/upgrade.php';
require_once ABSPATH . 'wp-includes/pluggable.php';

// Helper to print status
function status($m){ echo '<p>' . htmlspecialchars($m) . '</p>'; }

// Si la instalación no tiene la opción 'siteurl', intentamos instalar
$siteurl = get_option('siteurl');
if (empty($siteurl)) {
    status('No hay instalación detectada. Ejecutando instalación automática...');
    // wp_install($blog_title, $user_name, $user_email, $public = true, $deprecated = '', $user_password = null)
    wp_install(WP_AUTO_INSTALL_SITENAME, WP_AUTO_INSTALL_USER, WP_AUTO_INSTALL_EMAIL, true, '', WP_AUTO_INSTALL_PASS);
    status('Instalación completada.');
}

// Ahora aseguramos que el usuario admin exista y tenga la contraseña solicitada
if (!username_exists(WP_AUTO_INSTALL_USER)) {
    $user_id = wp_create_user(WP_AUTO_INSTALL_USER, WP_AUTO_INSTALL_PASS, WP_AUTO_INSTALL_EMAIL);
    if (is_wp_error($user_id)) {
        status('Error creando usuario: ' . $user_id->get_error_message());
    } else {
        $u = new WP_User($user_id);
        $u->set_role('administrator');
        status('Usuario "' . WP_AUTO_INSTALL_USER . '" creado y asignado como administrador.');
    }
} else {
    $user = get_user_by('login', WP_AUTO_INSTALL_USER);
    if ($user) {
        wp_set_password(WP_AUTO_INSTALL_PASS, $user->ID);
        status('Usuario existente encontrado. Contraseña actualizada.');
    }
}

status('Tarea completada. Por seguridad, elimina este archivo `autoinstall.php` del servidor.');
