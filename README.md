# PWA App Shell

Aplicación web progresiva construida con React y Vite que implementa el patrón App Shell para funcionar sin conexión.

## Instalación

```bash
cd pwa-app-shell
npm install
npm run dev
```

La aplicación estará disponible en http://localhost:5173

## Arquitectura

### App Shell
El App Shell es la estructura mínima de la aplicación que se carga instantáneamente:

- Header: Título y estado de conexión
- Content: Catálogo de productos
- Footer: Información de versión

### Estructura del Proyecto
```
src/
├── components/
│   ├── Header.jsx        # Encabezado con indicador online/offline
│   └── Footer.jsx        # Pie de página
├── views/
│   └── ProductsView.jsx  # Vista de productos
└── App.jsx               # Componente principal
```

## Configuración PWA

El archivo `vite.config.js` configura el plugin PWA:

- Service Worker: Cachea automáticamente todos los recursos
- Manifest: Define nombre, iconos y colores de la app
- Workbox: Maneja las estrategias de caché

## Cómo probar sin conexión

1. Abre la aplicación en Chrome
2. Presiona F12 para abrir DevTools
3. Ve a la pestaña Network
4. Selecciona "Offline" en el dropdown
5. Recarga la página

La aplicación seguirá funcionando porque el Service Worker cachea los recursos en la primera visita.

## Tecnologías

- React 18
- Vite 6
- vite-plugin-pwa
- Workbox

## Pruebas de carga con k6

El repositorio incluye un script de k6 en `tests/test.js`. Puedes ejecutar las pruebas contra tu proyecto desplegado en Render: `https://pruebas-de-carga-k6.onrender.com`.

### Requisitos
- Tener instalado k6 (CLI) localmente, o usar Docker.
- Opcional para la nube: un `K6_CLOUD_TOKEN` de Grafana Cloud k6.

### Ejecutar localmente (PowerShell en Windows)

```pwsh
# Apuntar las pruebas al despliegue en Render
$env:BASE_URL = "https://pruebas-de-carga-k6.onrender.com"

# Ejecutar k6 localmente
k6 run .\tests\test.js

# Alternativamente, con npm script
npm run k6:run
```

> Nota: Los scripts de npm no establecen `BASE_URL` automáticamente. Asegúrate de definir la variable de entorno antes de ejecutar el script o el comando.

### Ejecutar en k6 Cloud

```pwsh
$env:K6_CLOUD_TOKEN = "<tu_token_k6_cloud>"
$env:BASE_URL = "https://pruebas-de-carga-k6.onrender.com"
k6 cloud .\tests\test.js

# Alternativamente, con npm script (requiere las variables arriba configuradas)
npm run k6:cloud
```

### Ejecutar con Docker

```pwsh
docker run --rm -i `
	-e BASE_URL="https://pruebas-de-carga-k6.onrender.com" `
	-e K6_CLOUD_TOKEN=$env:K6_CLOUD_TOKEN `
	-v ${PWD}:/work -w /work grafana/k6:latest `
	run tests/test.js
```

### Solución de problemas
- Error "The moduleSpecifier \"tests/script.js\" couldn't be found": asegúrate de usar `tests/test.js` (es el nombre correcto del archivo en este repo).
- Si usas Docker, verifica que el volumen esté montado y que la ruta interna coincida (`/work/tests/test.js`).
- Si las peticiones fallan en k6 Cloud, confirma que `BASE_URL` apunte a un dominio accesible públicamente (por ejemplo, tu despliegue en Render) y no a `localhost`.
