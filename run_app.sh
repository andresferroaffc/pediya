#!/bin/bash

# Ruta de la carpeta del back-end 
carpeta_back="/home/debian12/Escritorio/pediya"

# Agregar este comando cuando se haga una actualizacion del sistemas (agregarlo al comando de abajo con un &&)
#npm install

# Iniciar el back en una nueva terminal 
terminal1="npm run start"

# Ruta de la carpeta del front-end 
carpeta_front="/home/debian12/Escritorio/TUPEDIDOYA"

# Iniciar el front en una nueva terminal
terminal2="live-server"

echo "Se ejecuto el backend"

# Ejecutar comandos del back-end
xfce4-terminal --working-directory="Scarpeta_back" --hold-command "$terminal1" &

# Esperar 2 segundos mientras se inicia el back para ejecutar el servidor
# del front-end
sleep 2

echo "Se ejecuto el frontend"

# Ejecutar comandos del front-end 
xfce4-terminal-working-directory="Scarpeta_front"-hold-command "Sterminal2" &

# Esperar 10 segundos para abrir el navegador
# del front-end
#sleep 10

# URL
#url_app="http://127.0.0.1:8080/src/html/"

# Abrir app en el navegador
#su -c "xdg-open 'Surl_app" usuario_regular