# Food Store - Veggie Food Store

**Trabajo Práctico Integrador - Programación 4**  
Tecnicatura Universitaria en Programación - UTN  
**Autora:** Micaela Alterio

---

## Enlaces de entrega

- **Repositorio público en GitHub:** https://github.com/Micaela-Alterio/Alterio_Micaela_TFI_Progr_IV.git
- **Video demostrativo:** https://youtu.be/-uBDRsziGJ0

---

## Descripción general y arquitectura

**Food Store** (*Veggie Food Store*) es una aplicación web *full-stack* orientada a la venta en línea de comida vegetariana mexicana y a la gestión administrativa del catálogo, inventario, pedidos y usuarios.

### Resumen funcional

- **Catálogo público:** Navegación paginada de productos disponibles con filtrado por búsqueda de texto, categoría y disponibilidad.
- **Carrito persistido:** Gestión de ítems seleccionados en el cliente con control de stock máximo disponible, cálculo de subtotales y total general.
- **Checkout transaccional:** Confirmación de pedidos para usuarios autenticados con validación de disponibilidad, control de stock y descuento atómico del inventario al momento de registrar la orden.
- **Gestión y cancelación de pedidos:** Consulta del historial personal de pedidos en `/mis-pedidos`, con posibilidad de cancelar órdenes en estado `PENDIENTE` y restitución automática del stock correspondiente.
- **Panel de administración por roles:** Rutas protegidas exclusivas para el rol `admin` que permiten visualizar métricas de resumen, administrar categorías, productos y stock, actualizar el estado de pedidos (`PENDIENTE`, `EN_PREPARACION`, `ENTREGADO`, `CANCELADO`) y gestionar cuentas de usuario.

### Arquitectura del Backend

El servidor está desarrollado en **Python** con **FastAPI**, **SQLModel** y **PostgreSQL** (`veggiefoodstore_db`), exponiendo sus endpoints bajo el prefijo `/api/v1`:

- **Patrón Repository y Unit of Work:** Cada módulo de dominio implementa repositorios especializados sobre un repositorio base genérico y un contexto `Unit of Work` que garantiza atomicidad transaccional en las operaciones de base de datos.
- **Organización modular por dominio:** Módulos independientes en `backend/app/modules/` para `auth`, `usuarios`, `categorias`, `productos` y `pedidos`.
- **Autenticación y autorización:** Emisión de tokens **JWT** (`HS256`) almacenados en cookie `HttpOnly` (`access_token`, con soporte alternativo por cabecera `Authorization: Bearer`) y control de acceso basado en roles (`user` y `admin`) mediante dependencias de FastAPI.

### Arquitectura del Frontend

La aplicación cliente está desarrollada con **React 19**, **TypeScript** en modo estricto (`"strict": true`) y **Tailwind CSS v4**, compilada con **Vite**:

- **Arquitectura orientada a *features*:** Código modularizado por dominio funcional en `frontend/src/features/` (`auth`, `categorias`, `productos`, `pedidos`, `usuarios`), con exportaciones encapsuladas mediante archivos barril (`index.ts`) y alias de importación `@/`.
- **Estado global con Zustand:** Stores desacoplados en `frontend/src/store/` con persistencia en `localStorage` para sesión (`authStore`), carrito de compras (`cartStore`) y preferencia de tema claro/oscuro (`themeStore`), además de gestión de notificaciones (`notificationStore`).
- **Estado de servidor, formularios y tablas:** Consumo de API mediante **Axios** con envío automático de credenciales (`withCredentials: true`) e interceptores de sesión, caché e invalidación con **TanStack Query**, validación de formularios con **TanStack Form** y grillas administrativas con **TanStack Table**.

---

## Requisitos previos

Para ejecutar el proyecto en un entorno local se requiere:

- **Python:** 3.10 o superior (probado con Python 3.12).
- **PostgreSQL:** Servidor en ejecución en `localhost:5432` (con `psql` o herramienta equivalente).
- **Node.js:** 18 o superior (recomendado 20 o superior).
- **Gestor de paquetes Node:** `pnpm` (recomendado, el proyecto incluye `pnpm-lock.yaml`) o `npm`.

---

## Configuración de variables de entorno

Antes de iniciar los servicios, crea los archivos `.env` a partir de las plantillas de ejemplo incluidas en cada subproyecto.

### 1. Backend (`backend/.env`)

Copia el archivo de ejemplo:

```bash
cp backend/.env.example backend/.env
```

En Windows PowerShell:

```powershell
Copy-Item backend\.env.example backend\.env
```

Variables configuradas en `backend/.env`:

| Variable | Descripción | Valor de ejemplo / referencia |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión SQLAlchemy/psycopg2 hacia PostgreSQL. Reemplaza el usuario, contraseña y puerto según tu instancia local. | `postgresql+psycopg2://<usuario>:<password>@localhost:5432/veggiefoodstore_db` |
| `SECRET_KEY` | Clave secreta utilizada para firmar y verificar los tokens JWT. Debe reemplazarse por una clave segura en entornos productivos. | `<clave_secreta_segura>` |
| `ALGORITHM` | Algoritmo criptográfico de firma JWT. | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Tiempo de expiración del token de acceso en minutos. | `30` |
| `FRONTEND_ORIGIN` | Origen permitido por `CORSMiddleware` para recibir cookies y peticiones desde el frontend. | `http://localhost:5173` |

### 2. Frontend (`frontend/.env`)

Copia el archivo de ejemplo:

```bash
cp frontend/.env.example frontend/.env
```

En Windows PowerShell:

```powershell
Copy-Item frontend\.env.example frontend\.env
```

Variables configuradas en `frontend/.env`:

| Variable | Descripción | Valor de ejemplo / referencia |
| :--- | :--- | :--- |
| `VITE_API_URL` | URL base de la API REST del backend consumida por Axios. | `http://localhost:8000/api/v1` |

---

## Instalación y ejecución paso a paso

### 1. Base de datos PostgreSQL

Asegúrate de que el servicio de PostgreSQL esté activo y crea la base de datos `veggiefoodstore_db` desde `psql`, pgAdmin o tu cliente SQL preferido:

```sql
CREATE DATABASE veggiefoodstore_db;
```

Verifica que las credenciales definidas en `DATABASE_URL` dentro de `backend/.env` coincidan con tu usuario de PostgreSQL.

### 2. Backend

1. Ingresa al directorio `backend/`:

   ```bash
   cd backend
   ```

2. Crea y activa el entorno virtual `.venv`:

   - **Windows (PowerShell):**

     ```powershell
     python -m venv .venv
     .venv\Scripts\Activate.ps1
     ```

   - **Linux / macOS:**

     ```bash
     python3 -m venv .venv
     source .venv/bin/activate
     ```

3. Instala las dependencias especificadas en `requirements.txt`:

   ```bash
   pip install -r requirements.txt
   ```

4. Ejecuta el script de carga inicial (*seed* idempotente) para crear las tablas en PostgreSQL y poblar usuarios, categorías y productos iniciales:

   ```bash
   python -m app.db.seed
   ```

5. Inicia el servidor de desarrollo con Uvicorn:

   ```bash
   uvicorn app.main:app --reload
   ```

6. Servicios disponibles:

   - **API Base:** http://localhost:8000
   - **Documentación interactiva (Swagger UI):** http://localhost:8000/docs

### 3. Frontend

En una nueva terminal, partiendo desde la raíz del proyecto:

1. Ingresa al directorio `frontend/`:

   ```bash
   cd frontend
   ```

2. Instala las dependencias del proyecto:

   - Con `pnpm`:

     ```bash
     pnpm install
     ```

   - Con `npm`:

     ```bash
     npm install
     ```

3. Verifica la compilación y el chequeo de tipos TypeScript (`tsc -b && vite build`):

   - Con `pnpm`:

     ```bash
     pnpm build
     ```

   - Con `npm`:

     ```bash
     npm run build
     ```

4. Inicia el servidor de desarrollo de Vite:

   - Con `pnpm`:

     ```bash
     pnpm dev
     ```

   - Con `npm`:

     ```bash
     npm run dev
     ```

5. Abre la aplicación en el navegador web:

   - **Aplicación Frontend:** http://localhost:5173

---

## Credenciales iniciales de prueba

Al ejecutar `python -m app.db.seed`, el sistema crea de forma idempotente el usuario administrador y las cuentas de demostración configuradas en `backend/app/db/seed.py`:

| Rol | Usuario | Correo electrónico | Contraseña | Alcance principal |
| :--- | :--- | :--- | :--- | :--- |
| `admin` | `admin` | `admin@veggiefood.com` | `Admin1234!` | Acceso completo al panel administrativo (`/admin/resumen`, `/admin/categorias`, `/admin/productos`, `/admin/pedidos`, `/admin/usuarios`). |
| `user` | `user` | `user@veggiefood.com` | `User1234!` | Cliente demo para compras en catálogo, carrito, checkout y gestión de `/mis-pedidos`. |
| `user` | `cliente` | `cliente@veggiefood.com` | `User1234!` | Cliente demo alternativo con permisos de comprador estándar. |

Adicionalmente, cualquier visitante puede registrar una cuenta nueva de cliente desde la ruta pública `/register`; el registro público asigna automáticamente el rol `user`.

---

## Estructura de directorios

```text
Alterio_Micaela_TPI_Prog4/
├── README.md
├── backend/
│   ├── .env.example
│   ├── .gitignore
│   ├── requirements.txt
│   ├── seed.py
│   └── app/
│       ├── __init__.py
│       ├── main.py
│       ├── core/
│       │   ├── base_repository.py
│       │   ├── config.py
│       │   ├── database.py
│       │   ├── deps.py
│       │   ├── repository.py
│       │   ├── security.py
│       │   └── unit_of_work.py
│       ├── db/
│       │   └── seed.py
│       └── modules/
│           ├── auth/
│           │   ├── router.py
│           │   ├── schemas.py
│           │   └── service.py
│           ├── categorias/
│           │   ├── models.py
│           │   ├── repository.py
│           │   ├── router.py
│           │   ├── schemas.py
│           │   ├── service.py
│           │   └── unit_of_work.py
│           ├── pedidos/
│           │   ├── exceptions.py
│           │   ├── models.py
│           │   ├── repository.py
│           │   ├── router.py
│           │   ├── schemas.py
│           │   ├── service.py
│           │   └── unit_of_work.py
│           ├── productos/
│           │   ├── models.py
│           │   ├── repository.py
│           │   ├── router.py
│           │   ├── schemas.py
│           │   ├── service.py
│           │   └── unit_of_work.py
│           └── usuarios/
│               ├── models.py
│               ├── repository.py
│               ├── router.py
│               ├── schemas.py
│               ├── service.py
│               └── unit_of_work.py
└── frontend/
    ├── .env.example
    ├── .gitignore
    ├── .oxlintrc.json
    ├── index.html
    ├── package.json
    ├── pnpm-lock.yaml
    ├── tsconfig.app.json
    ├── tsconfig.json
    ├── tsconfig.node.json
    ├── vite.config.ts
    ├── public/
    │   └── assets/
    │       ├── fonts/
    │       └── img/
    └── src/
        ├── App.css
        ├── App.tsx
        ├── index.css
        ├── main.tsx
        ├── routes/
        │   ├── AppRouter.tsx
        │   └── ProtectedRoute.tsx
        ├── store/
        │   ├── authStore.ts
        │   ├── cartStore.ts
        │   ├── notificationStore.ts
        │   └── themeStore.ts
        ├── shared/
        │   ├── api/
        │   │   ├── axiosInstance.ts
        │   │   ├── handleApiError.ts
        │   │   └── queryClient.ts
        │   ├── components/
        │   ├── layout/
        │   └── ui/
        └── features/
            ├── auth/
            ├── categorias/
            ├── pedidos/
            ├── productos/
            └── usuarios/
```
