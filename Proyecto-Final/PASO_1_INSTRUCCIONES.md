# Paso 1 — Backend de eventos e integración Angular

**Estado:** se implementó el CRUD REST de eventos y la consulta real desde la pantalla de eventos del cliente. **Todavía no están implementados** autenticación, roles, reservas, localización, reportes ni formularios conectados. Los endpoints de creación, edición y eliminación de eventos **no tienen autenticación** y solo son adecuados para desarrollo local.

## Requisitos
- Node.js 22.13+ (por la base de datos SQLite incluida en Node.js).
- npm y terminal / PowerShell.

## Preparar el proyecto
1. Descomprimir el ZIP.
2. Abrir la carpeta principal en VS Code.
3. Abrir una terminal en `backend` y ejecutar `npm install`.
4. En esa terminal ejecutar `npm run dev`.
5. Entrar a http://localhost:3000/api/health. Debe mostrar `{"status":"ok"}`.
6. Abrir una **segunda** terminal en la carpeta principal del proyecto Angular (donde está el `package.json` original).
7. Ejecutar `npm install` y luego `npm start`.
8. Abrir http://localhost:4200/client/events. Sin eventos todavía verá un mensaje indicando que no hay registros.

## Crear un evento de prueba
En PowerShell de Windows usar:
```powershell
$body = @{
  nombre='Concierto de prueba'; descripcion='Evento de prueba'; teatro='Teatro Municipal'; ciudad='Tuluá';
  fecha_inicio='2026-12-20T18:00:00-05:00'; fecha_fin='2026-12-20T22:00:00-05:00';
  capacidad=200; precio=50000; observaciones=''; estado='Programado'
} | ConvertTo-Json
Invoke-RestMethod -Uri 'http://localhost:3000/api/events' -Method Post -ContentType 'application/json' -Body $body
```
Volver a cargar http://localhost:4200/client/events: el evento debe aparecer. Este registro se guarda realmente en `backend/data/eventapp.sqlite` (no subir ese archivo a GitHub).

## Probar los cinco endpoints
- `GET http://localhost:3000/api/events` — todos.
- `GET http://localhost:3000/api/events/1` — por ID.
- `POST http://localhost:3000/api/events` — crear (JSON completo del ejemplo).
- `PUT http://localhost:3000/api/events/1` — actualizar (JSON completo).
- `DELETE http://localhost:3000/api/events/1` — eliminar.

## Arquitectura
- `backend/src/routes/event.routes.js`: rutas HTTP.
- `backend/src/controllers/event.controller.js`: petición y respuesta.
- `backend/src/services/event.service.js`: validación y reglas.
- `backend/src/models/event.model.js`: SQL CRUD.
- `backend/src/config/database.js`: conexión y tabla SQLite.
- `src/app/services/events.service.ts`: llamadas Angular HTTP.
- `src/app/pages/client-events/client-events.page.ts`: datos desde API en lugar de mock.

**Importante:** la guía docente no incluye el modelo de datos exacto. La tabla `events` de este primer paso se construyó a partir de la interfaz Angular del ZIP. Antes de implementar todas las entidades es necesario contrastarla con el modelo entidad-relación oficial del proyecto. SQLite es una elección provisional para comenzar; si el equipo tiene una base de datos obligatoria deberá adaptarse esa capa.
