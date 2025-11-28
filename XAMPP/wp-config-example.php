<?php
// Copia este archivo como "wp-config.php" en la raíz de
// `XAMPP/htdocs/wordpress/` y rellena las constantes según corresponda.

define('DB_NAME', 'wordpress');
define('DB_USER', 'wpuser');
define('DB_PASSWORD', 'WP_PASSWORD_HERE');
define('DB_HOST', 'localhost');
define('DB_CHARSET', 'utf8mb4');
define('DB_COLLATE', '');

// Salts de seguridad — reemplaza estas líneas por valores únicos
// Puedes generar nuevos valores en: https://api.wordpress.org/secret-key/1.1/salt/
define('AUTH_KEY',         'put your unique phrase here');
define('SECURE_AUTH_KEY',  'put your unique phrase here');
define('LOGGED_IN_KEY',    'put your unique phrase here');
define('NONCE_KEY',        'put your unique phrase here');
define('AUTH_SALT',        'put your unique phrase here');
define('SECURE_AUTH_SALT', 'put your unique phrase here');
define('LOGGED_IN_SALT',   'put your unique phrase here');
define('NONCE_SALT',       'put your unique phrase here');

$table_prefix = 'wp_';

define('WP_DEBUG', false);

/* That's all, stop editing! Happy publishing. */

if ( !defined('ABSPATH') )
    define('ABSPATH', dirname(__FILE__) . '/htdocs/wordpress/');

require_once(ABSPATH . 'wp-settings.php');
