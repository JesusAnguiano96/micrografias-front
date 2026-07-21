# Micrograph Analysis System - Frontend

Frontend React para el sistema de análisis de micrografías TEM/SEM orientado al conteo de nanopartículas esféricas.

Esta interfaz permite al usuario registrarse, iniciar sesión, cargar micrografías, seleccionar el modelo de análisis, ejecutar segmentación, visualizar resultados, consultar historial y descargar reportes.

---

## Estado actual del frontend

El frontend se comunica con el backend Flask mediante una API REST.

Funcionalidades disponibles:

```text
- registro de usuarios
- inicio de sesión
- carga de micrografías TEM/SEM
- selección de modelo: SAM classic o SAM 2
- ejecución de análisis
- visualización de resultados
- apertura de imagen original
- apertura de imagen segmentada
- apertura de figura resumen
- generación de reportes
- descarga de reportes
- consulta de historial
```

---

## Modelos disponibles desde la interfaz

Actualmente la interfaz permite seleccionar:

```text
SAM classic -> ejecuta el modelo SAM clásico real en el backend
SAM 2       -> ejecuta un flujo simulado temporal en el backend
```

La integración real de SAM 2 queda pendiente para una etapa posterior.

---

## Tecnologías principales

```text
React
React Router
JavaScript
CSS
Fetch API
Sass
```

---

## Estructura principal

```text
frontMAS/
├── public/
├── src/
│   ├── components/
│   │   ├── History/
│   │   │   └── History.jsx
│   │   ├── Layout/
│   │   │   ├── Footer.jsx
│   │   │   └── NavbarSAM.jsx
│   │   ├── Login/
│   │   ├── Report/
│   │   │   └── Report.jsx
│   │   ├── SignUp/
│   │   └── IndexSAM.jsx
│   ├── context/
│   │   └── context.js
│   ├── router/
│   │   └── Router.jsx
│   ├── services/
│   │   └── api.js
│   ├── styles/
│   │   └── analysisPages.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

---

## Instalación

Desde la carpeta `frontMAS`:

```powershell
npm install
```

---

## Ejecutar el frontend

```powershell
npm start
```

La aplicación se ejecuta normalmente en:

```text
http://localhost:3000
```

---

## Conexión con el backend

El frontend consume la API mediante:

```text
src/services/api.js
```

Por defecto, la URL base es:

```text
http://127.0.0.1:5000
```

Esto permite trabajar localmente con el backend Flask.

---

## Variable de entorno opcional

Para cambiar la URL del backend, crear un archivo `.env` en la raíz de `frontMAS`:

```text
REACT_APP_API_BASE_URL=http://127.0.0.1:5000
```

Ejemplo para despliegue:

```text
REACT_APP_API_BASE_URL=https://backend.example.com
```

Después de modificar `.env`, se debe reiniciar el servidor de React.

---

## Flujo principal de usuario

```text
Inicio
↓
Sign up / Login
↓
Report
↓
Upload micrograph
↓
Select segmentation model
↓
Run analysis
↓
Open segmented image
↓
Open summary figure
↓
Generate report
↓
Download report
```

---

## Pantalla Report

La pantalla `Report` permite crear un nuevo análisis.

Archivo principal:

```text
src/components/Report/Report.jsx
```

Funciones principales:

```text
- seleccionar micrografía
- seleccionar tipo TEM o SEM
- seleccionar modelo SAM classic o SAM 2
- capturar escala
- capturar descripción
- subir micrografía al backend
- ejecutar análisis
- mostrar conteo de partículas
- mostrar total de máscaras
- mostrar máscaras válidas
- mostrar máscaras rechazadas
- abrir imagen segmentada
- abrir figura resumen
- generar reporte
- descargar reporte
```

---

## Pantalla History

La pantalla `History` permite consultar análisis previos.

Archivo principal:

```text
src/components/History/History.jsx
```

Funciones principales:

```text
- cargar historial del usuario
- mostrar información del análisis
- mostrar información de la micrografía
- mostrar resultados del análisis
- abrir micrografía original
- abrir imagen segmentada
- abrir figura resumen
- generar reporte para análisis previos
- descargar reporte
```

---

## Servicio de API

Archivo:

```text
src/services/api.js
```

Define endpoints para:

```text
health
auth
micrographs
analysis
reports
```

Endpoints consumidos:

```text
GET  /api/health
POST /api/auth/register
POST /api/auth/login
POST /api/micrographs/upload
GET  /api/micrographs
POST /api/analysis/run
GET  /api/analysis/history
GET  /api/analysis/<analysis_id>
POST /api/reports/generate
GET  /api/reports/<report_id>/download
```

---

## Estilos principales

El estilo de las pantallas de análisis está en:

```text
src/styles/analysisPages.css
```

Este archivo contiene estilos para:

```text
- layout general
- tarjetas
- formularios
- botones
- enlaces
- mensajes de error
- estados vacíos
- vista responsive
```

---

## Componentes principales

```text
IndexSAM.jsx       -> página principal del sistema
NavbarSAM.jsx      -> barra de navegación
Report.jsx         -> creación de nuevo análisis
History.jsx        -> historial de análisis
Login.jsx          -> inicio de sesión
SignUp.jsx         -> registro de usuario
Footer.jsx         -> pie de página
```

---

## Rutas principales

Configuradas en:

```text
src/router/Router.jsx
```

Rutas disponibles:

```text
/         -> página principal
/report   -> nuevo análisis
/history  -> historial de análisis
```

Las rutas `/report` y `/history` dependen de que exista un usuario autenticado en el contexto de React.

---

## Contexto global

El estado global se maneja en:

```text
src/context/context.js
```

Se utiliza para compartir:

```text
- usuario actual
- funciones de autenticación
- estados de modales
```

---

## Prueba local completa

Para probar el sistema completo localmente, primero correr el backend:

```powershell
cd "C:\Users\jesus\Documents\Maestria\Tesis\Código de Diego\apiMAS"
conda activate tesis-mas-api
python run.py
```

Luego correr el frontend:

```powershell
cd "C:\Users\jesus\Documents\Maestria\Tesis\Código de Diego\frontMAS"
npm start
```

Después:

```text
1. Abrir http://localhost:3000
2. Registrarse o iniciar sesión
3. Entrar a Report
4. Subir una micrografía
5. Seleccionar SAM classic
6. Ejecutar Run analysis
7. Abrir Open segmented image
8. Abrir Open summary figure
9. Generar reporte
10. Descargar reporte
11. Entrar a History
12. Verificar que el análisis aparezca en el historial
```

---

## Salidas esperadas

Después de ejecutar un análisis con SAM classic, la interfaz debe mostrar:

```text
Analysis completed successfully
Model: SAM
Particle count: valor real
Total masks: valor real
Valid masks: valor real
Rejected masks: valor real
Open segmented image
Open summary figure
Generate report
```

---

## Notas importantes

El frontend no ejecuta los modelos de segmentación directamente.

El análisis se realiza en el backend Flask.

El frontend únicamente:

```text
- envía la micrografía
- envía parámetros de análisis
- muestra la respuesta
- abre archivos generados
- solicita reportes
```

---

## Estado del prototipo

Funcionalidades implementadas:

```text
- interfaz principal
- autenticación básica
- carga de micrografías
- selección de modelo
- conexión con backend Flask
- ejecución de análisis SAM classic
- flujo SAM2 simulado
- vista de resultados
- historial
- generación de reportes
- descarga de reportes
- estilos visuales mejorados para Report e History
```

Pendiente para etapas posteriores:

```text
- autenticación persistente con tokens o sesiones
- integración real de SAM 2
- configuración avanzada de parámetros desde interfaz
- previsualización integrada de imágenes
- reportes PDF
- despliegue completo como SaaS
- diseño responsive más refinado
```

---

## Documentación relacionada

El backend contiene documentación adicional:

```text
apiMAS/README.md
apiMAS/SAM_SETUP.md
apiMAS/API_REFERENCE.md
```
