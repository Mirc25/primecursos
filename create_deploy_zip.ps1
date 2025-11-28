# create_deploy_zip.ps1
# Crea un backup ZIP de la copia que sirve Apache y genera un ZIP listo para deploy
# Usage: Ejecutar en PowerShell desde cualquier carpeta
















Start-Sleep -Seconds 1
n# Opcional: abrir el Escritorio para que veas los ZIPs
nStart-Process -FilePath $desktop
nWrite-Output "Listo. Sube el archivo '$deploy' al servidor remoto (FTP/SCP/cPanel) y sigue las instrucciones en DEPLOY_INSTRUCTIONS.md" if(Test-Path $deploy){ Write-Output "ZIP de deploy creado correctamente: $deploy" } else { Write-Error "Fallo al crear ZIP de deploy"; exit 1 }Compress-Archive -Path $src -DestinationPath $deploy -Force
n# Crear ZIP de deploy (idéntico al backup en este caso)if(Test-Path $backup){ Write-Output "Backup creado correctamente: $backup" } else { Write-Error "Fallo al crear backup"; exit 1 }
n# Crear backup (contenido exacto de la carpeta)
nCompress-Archive -Path $src -DestinationPath $backup -ForceWrite-Output "Deploy ZIP: $deploy"Write-Output "Backup destino: $backup"
nWrite-Output "Origen (copy): $src"$deploy = Join-Path $desktop "prime-cursos-deploy-$timestamp.zip"$backup = Join-Path $desktop "prime-cursos-backup-$timestamp.zip"$desktop = [Environment]::GetFolderPath('Desktop')$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"p$src = "C:\Users\stefa\Desktop\CARPETA WORDPRES\XAMPP\htdocs\prime-cursos\*"