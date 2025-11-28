# prepare_public_html.ps1
# Crea la carpeta 'todo_web' y copia los archivos/carpetas que deben ir a public_html

$src = "C:\Users\stefa\Desktop\CARPETA WORDPRES"
$dest = Join-Path $src "todo_web"

Write-Output "Preparando carpeta: $dest"
New-Item -ItemType Directory -Force -Path $dest | Out-Null

# Nombres exactos o patrones que NO queremos copiar a public_html
$excludeNames = @(
    'prime-cursos-config.php',
    'prime-cursos-config (1).php',
    'create_wp_db.sql'
)
# Carpetas a excluir completamente
$excludeDirs = @('prime-cursos-data')
# Extensiones a excluir (archivos de backup, zips, db dumps)
$excludeExt = @('*.zip','*.gz','*.sql','*.tar','*.bak')

Get-ChildItem -Path $src -Force | Where-Object {
    # Skip the destination folder itself
    $_.Name -ne 'todo_web' -and
    # Skip excluded names
    -not ($excludeNames -contains $_.Name) -and
    # Skip excluded dirs
    -not ($_.PSIsContainer -and ($excludeDirs -contains $_.Name)) -and
    # Skip files matching excluded extensions
    -not (-not $_.PSIsContainer -and ($excludeExt | ForEach-Object { $_ -and $_ -ne '' } | Where-Object { $_ -and $_ -like '*' } | ForEach-Object { $_ } | ForEach-Object { $_ } | ForEach-Object { $_ } ))
} | ForEach-Object {
    if ($_.PSIsContainer) {
        Write-Output "Copiando carpeta: $($_.Name)"
        Copy-Item -Path $_.FullName -Destination $dest -Recurse -Force
    } else {
        # Skip files by extension explicitly
        $skip = $false
        foreach ($p in $excludeExt) {
            if ($_.Name -like $p) { $skip = $true; break }
        }
        if (-not $skip) {
            Write-Output "Copiando archivo: $($_.Name)"
            Copy-Item -Path $_.FullName -Destination $dest -Force
        } else {
            Write-Output "Excluyendo archivo por extensión: $($_.Name)"
        }
    }
}

Write-Output "Listo. Archivos para subir a public_html están en: $dest"
Write-Output "Abre el Explorador y verifica el contenido antes de subir al servidor."
