# Sistema de Administración de Club Náutico

Sistema web full stack para la gestión de un club náutico, desarrollado como trabajo práctico de la materia Desarrollo de Software (DSW). Permite diferenciar entre socios y administradores, gestionar embarcaciones e infraestructura, registrar cuotas y probar reservas.

## Tecnologías

- **Backend:** Node.js, TypeScript, Express, MikroORM y MySQL.
- **Autenticación:** JWT y contraseñas protegidas con bcrypt.
- **Frontend:** React, Vite y CoreUI.

## Requisitos previos

Instalar antes de comenzar:

- Node.js 18 o superior.
- MySQL Server en ejecución.
- pnpm para el backend (`npm install -g pnpm`).
- npm para el frontend.

## Instalación y configuración

### 1. Obtener el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd TP-DSW
```

### 2. Crear la base de datos

Crear una base vacía en MySQL. Por ejemplo, desde MySQL Workbench o desde el cliente de MySQL:

```sql
CREATE DATABASE club_nautico;
```

No es necesario crear tablas manualmente: MikroORM las crea o actualiza cuando se ejecuta el backend o el seeder.

### 3. Configurar el backend

Desde `backend`, instalar las dependencias y crear el archivo `.env` a partir del ejemplo:

```bash
cd backend
pnpm install
```

En Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Completar `backend/.env` con los datos de la instalación local de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=club_nautico
DB_USER=root
DB_PASSWORD=tu_password
MP_ACCESS_TOKEN=TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxx
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
```

`MP_ACCESS_TOKEN` solo es necesario para probar pagos con Mercado Pago. Para probar login, socios, embarcaciones, cuotas y reservas alcanza con configurar la conexión a MySQL.

## Cargar datos de prueba

El proyecto incluye un seeder funcional e idempotente. Carga administradores, socios, afiliaciones, tipos de embarcación, embarcaciones, boxes, amarres, cuotas, detalles de cuota y reservas.

Desde la carpeta `backend`:

```bash
pnpm seed
```

El comando:

1. Lee la configuración de `backend/.env`.
2. Crea o actualiza el esquema de la base.
3. Inserta los datos de demostración.
4. Cierra la conexión al finalizar.

Es seguro ejecutarlo más de una vez: busca los registros de prueba por email, matrículas, nombres de tipo, números de box, números de pilón y combinaciones estables de relaciones, por lo que no duplica la carga. El seeder no se ejecuta automáticamente al iniciar la API.

## Credenciales de demostración

Las contraseñas de los usuarios de prueba son los últimos seis dígitos de su DNI:

| Rol | Email | Contraseña |
| --- | --- | --- |
| Administrador | `admin.demo@clubnautico.test` | `123456` |
| Socio | `lucas.demo@clubnautico.test` | `123456` |
| Socio | `sofia.demo@clubnautico.test` | `234567` |
| Socio | `mateo.demo@clubnautico.test` | `345678` |

## Ejecutar el sistema

### Backend

En una terminal:

```bash
cd backend
pnpm start:dev
```

La API queda disponible en <http://localhost:3000>. El backend también actualiza el esquema al iniciar durante el desarrollo.

### Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
npm install
npm run dev
```

Abrir la URL que muestra Vite, normalmente <http://localhost:5173>.

## Comprobación rápida

1. Ejecutar `pnpm seed` dentro de `backend`.
2. Iniciar backend y frontend.
3. Iniciar sesión con una de las credenciales de demostración.
4. Revisar socios, embarcaciones, boxes, amarres, cuotas y reservas.
5. Volver a ejecutar `pnpm seed` y comprobar que no aparecen registros duplicados.

## Solución de problemas

### Error de conexión a MySQL

Comprobar que MySQL esté iniciado y que `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME` coincidan con la instalación local. La base `club_nautico` debe existir antes de ejecutar el seeder.

### El puerto 3000 o 5173 está ocupado

Cerrar el proceso que usa el puerto o iniciar el servicio en otro puerto y actualizar `BACKEND_URL`, `FRONTEND_URL` y la configuración de CORS si corresponde.

### El login no funciona

Volver a ejecutar `pnpm seed` y usar exactamente los emails y contraseñas de la tabla. Las contraseñas no son el DNI completo: son sus últimos seis dígitos.

### Mercado Pago no funciona

El flujo de Mercado Pago requiere un token de prueba válido y, para webhooks o retornos externos, URLs públicas. El resto del sistema se puede probar sin configurar Mercado Pago. 
