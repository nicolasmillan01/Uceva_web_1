# EventApp — Sistema de Gestión de Eventos y Reservas

Proyecto Integrador de Programación en Ambiente Web I — UCEVA.

EventApp es una aplicación web para la gestión de eventos y reservas. Permite administrar usuarios, publicar eventos, realizar solicitudes de reserva, gestionar entradas y consultar reportes mediante diferentes roles de acceso.

---

Elaborado por:
Nicolas Millan Rodriguez - 230222012
Andres Felipe Rios Vasquez - 230232029

---

## 1. Tecnologías utilizadas

### Frontend
- Angular 18.
- TypeScript.
- Bootstrap 5.
- SCSS.
- Angular Router.
- RxJS.

### Backend
- Node.js.
- Express.js.
- TypeScript.
- SQLite.
- JSON Web Token (JWT).
- Node SQLite (`node:sqlite`).

---

## 2. Requisitos previos

Antes de instalar el proyecto, se debe contar con:

- Node.js 22 o superior.
- npm.
- Git.
- Visual Studio Code (recomendado).
- Navegador web actualizado.

Para comprobar que Node.js y npm están instalados:

```bash
node -v
npm -v
```

---

## 3. Descargar el proyecto

Abrir una terminal y ejecutar:

```bash
git clone https://github.com/nicolasmillan01/Uceva_web_1.git
```

Ingresar a la carpeta del proyecto:

```bash
cd Uceva_web_1/Proyecto-Final
```

Esta es la carpeta principal de EventApp.

---

## 4. Estructura del proyecto

```text
Proyecto-Final/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── interfaces/
│   │   ├── middlewares/
│   │   ├── migrations/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   │
│   ├── scripts/
│   │   ├── init-db.js
│   │   └── seed-db.js
│   │
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
│
├── src/
│   └── app/
│       ├── components/
│       ├── guards/
│       ├── interfaces/
│       ├── pages/
│       └── services/
│
├── angular.json
├── package.json
└── README.md
```

### Descripción de las carpetas principales

| Carpeta | Función |
|---|---|
| `components` | Componentes reutilizables, como la barra de navegación y tarjetas de eventos. |
| `pages` | Pantallas de clientes, agentes y administradores. |
| `services` | Comunicación entre Angular y el backend. |
| `interfaces` | Estructuras y tipos de datos de TypeScript. |
| `guards` | Protección de rutas según autenticación y roles. |
| `controllers` | Procesamiento de solicitudes HTTP. |
| `models` | Consultas y operaciones sobre SQLite. |
| `routes` | Definición de las rutas de la API. |
| `middlewares` | Autenticación y autorización. |
| `migrations` | Creación y actualización de tablas de la base de datos. |

---

# 5. Instalación y configuración

Se deben abrir dos terminales: una para el backend y otra para el frontend.

## 5.1. Instalar dependencias del frontend

**Ubicación:** carpeta `Proyecto-Final`.

```bash
npm install
```

Este comando instala las dependencias necesarias para ejecutar Angular.

## 5.2. Instalar dependencias del backend

En la misma terminal o en otra:

```bash
cd backend
npm install
```

Este comando instala Express, SQLite, JWT, TypeScript y las demás dependencias del servidor.

## 5.3. Configurar las variables de entorno

**Ubicación:** `Proyecto-Final/backend/`.

Crear un archivo llamado `.env`.

Contenido de ejemplo:

```env
PORT=3000

JWT_SECRET=REEMPLAZAR_POR_UN_SECRETO_ALEATORIO_LARGO

SEED_CLIENT_EMAIL=cliente.prueba@example.com
SEED_CLIENT_PASSWORD=ClaveCliente123!

SEED_AGENT_EMAIL=agente.prueba@example.com
SEED_AGENT_PASSWORD=ClaveAgente123!

SEED_ADMIN_EMAIL=admin.prueba@example.com
SEED_ADMIN_PASSWORD=ClaveAdmin123!
```

**Importante:**

- Las variables `SEED_` permiten crear los usuarios iniciales de prueba.
- Los tres correos deben ser diferentes.
- Las contraseñas deben tener entre 8 y 128 caracteres.
- `JWT_SECRET` debe ser un secreto aleatorio y privado.
- No se debe subir el archivo `.env` a GitHub.
- Si los usuarios ya existen, el script de inicialización no modifica sus contraseñas ni sus roles.

Los valores anteriores son ejemplos de configuración, no credenciales de producción.

---

# 6. Inicializar la base de datos

**Ubicación:** `Proyecto-Final/backend/`.

La aplicación utiliza SQLite para almacenar usuarios, eventos, reservas y datos de localización.

Para inicializar la base de datos:

```bash
npm run db:init
```

Este comando:

1. Crea la carpeta `data` si no existe.
2. Crea o abre la base de datos SQLite.
3. Ejecuta las migraciones existentes.
4. Comprueba que estén disponibles las tablas necesarias.

Entre las tablas principales se encuentran:

- `users`
- `countries`
- `departments`
- `cities`
- `events`
- `reservations`

## 6.1. Crear los usuarios iniciales

Ejecutar:

```bash
npm run db:seed
```

Este comando prepara la localización inicial de Colombia, Valle del Cauca y Tuluá, y crea los tres perfiles configurados en el archivo `.env`:

- Cliente.
- Agente.
- Administrador.

Si se desea ejecutar ambos procesos consecutivamente:

```bash
npm run db:setup
```

**Nota:** la base de datos se almacena localmente en:

```text
backend/data/eventapp.sqlite
```

No se debe eliminar este archivo si se quieren conservar los usuarios, eventos y reservas existentes.

---

# 7. Ejecutar el backend

**Ubicación:** `Proyecto-Final/backend/`.

En la primera terminal:

```bash
npm run dev
```

Este comando compila TypeScript y ejecuta el servidor en modo de desarrollo.

Si todo funciona correctamente, aparecerá:

```text
API disponible en http://localhost:3000
```

Para comprobar que el servidor está funcionando, abrir:

```text
http://localhost:3000/api/health
```

La respuesta esperada es:

```json
{
  "status": "ok"
}
```

El backend utiliza el puerto 3000.

---

# 8. Ejecutar el frontend

**Ubicación:** `Proyecto-Final/`.

Abrir una segunda terminal y ejecutar:

```bash
npx ng serve
```

Angular iniciará el servidor de desarrollo.

Abrir el navegador en:

```text
http://localhost:4200
```

El frontend se comunica con el backend mediante solicitudes HTTP.

**Importante:** las dos terminales deben permanecer abiertas mientras se utiliza la aplicación.

---

# 9. Funcionalidades del sistema

## 9.1. Cliente

El cliente puede:

- Registrarse e iniciar sesión.
- Consultar los eventos disponibles.
- Consultar información de cada evento.
- Realizar reservas de entradas.
- Consultar sus reservaciones.

## 9.2. Agente

El agente puede:

- Iniciar sesión.
- Crear eventos.
- Consultar sus propios eventos.
- Editar eventos.
- Gestionar las solicitudes de reserva de sus eventos.
- Aprobar o rechazar solicitudes pendientes.
- Consultar reportes de sus eventos y reservas.

## 9.3. Administrador

El administrador puede:

- Gestionar usuarios.
- Consultar clientes, agentes y administradores.
- Crear, editar y eliminar usuarios.
- Consultar todas las reservas.
- Aprobar o rechazar reservas.
- Consultar reportes generales del sistema.

Los reportes administrativos incluyen estadísticas de usuarios, eventos, reservas, entradas e ingresos confirmados, además del listado de eventos más reservados.

---

# 10. Rutas principales

| Rol | Ruta | Funcionalidad |
|---|---|---|
| Cliente | `/client/events` | Consultar eventos. |
| Cliente | `/client/reservations` | Consultar reservaciones. |
| Agente | `/agent/events` | Gestionar eventos propios. |
| Agente | `/agent/create-event` | Crear eventos. |
| Agente | `/agent/reservations` | Gestionar reservas. |
| Agente | `/agent/reports` | Consultar reportes. |
| Administrador | `/admin` | Panel administrativo. |
| Administrador | `/admin/users` | Gestión de usuarios. |
| Administrador | `/admin/reservations` | Gestión general de reservas. |
| Administrador | `/admin/reports` | Reportes generales. |

Las rutas protegidas requieren autenticación y autorización según el rol del usuario.

---

# 11. Comandos principales de ejecución

Resumen de los comandos necesarios:

| Acción | Ubicación | Comando |
|---|---|---|
| Instalar frontend | `Proyecto-Final` | `npm install` |
| Instalar backend | `Proyecto-Final/backend` | `npm install` |
| Inicializar SQLite | `backend` | `npm run db:init` |
| Crear usuarios iniciales | `backend` | `npm run db:seed` |
| Configurar todo inicialmente | `backend` | `npm run db:setup` |
| Ejecutar backend | `backend` | `npm run dev` |
| Ejecutar frontend | `Proyecto-Final` | `npx ng serve` |
| Compilar backend | `backend` | `npm run build` |
| Comprobar TypeScript | `backend` | `npm run typecheck` |
| Compilar frontend | `Proyecto-Final` | `npx ng build` |

---

# 12. Usuarios de prueba

Los siguientes son los tres perfiles de prueba registrados en la base de datos utilizada durante el desarrollo del proyecto.

**CLIENTES**

| Nombre | Correo |
| Cliente de prueba | prueba@example.com |

**AGENTE**

| Nombre / identificación | Correo |
| Agente de prueba | agente@example.com |

**ADMINISTRADOR**

| Nombre | Correo |
| Administrador de prueba | admin@example.com |

Las contraseñas correspondientes se deben entregar por un canal privado al equipo docente y a los integrantes autorizados. No deben almacenarse en este repositorio.

**Nota sobre instalaciones nuevas:** los seis usuarios corresponden a la base de datos utilizada durante las pruebas. Una instalación limpia crea únicamente los tres perfiles configurados en las variables `SEED_` del archivo `.env`. Los otros usuarios deben registrarse o aprovisionarse adicionalmente.

---

# 13. Consideraciones importantes

- No compartir el archivo `.env`.
- No publicar contraseñas ni secretos JWT.
- No eliminar la base de datos SQLite si se desea conservar la información.
- Mantener ejecutándose el backend y el frontend durante las pruebas.
- Utilizar las cuentas correspondientes para comprobar los permisos de cada rol.
- No modificar directamente la base de datos mientras el servidor está ejecutándose.

---

## 14. Repositorio

**GitHub:**  
https://github.com/nicolasmillan01/Uceva_web_1

**Proyecto:** Sistema de Gestión de Eventos y Reservas — EventApp.

**Institución:** Unidad Central del Valle del Cauca (UCEVA).

**Asignatura:** Programación en Ambiente Web I.
