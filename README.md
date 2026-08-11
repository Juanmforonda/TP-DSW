# Sistema de Administración de Club Náutico
 
Sistema web full stack para la gestión integral de un club náutico, desarrollado como trabajo práctico de la materia Desarrollo de Software (DSW). Permite diferenciar entre dos tipos de usuarios —socios y administradores— cada uno con funcionalidades específicas según su rol.
 
## Objetivo del Proyecto
 
Digitalizar la gestión administrativa y operativa de un club náutico, permitiendo a los socios autogestionar reservas y consultar su situación de cuotas, mientras que los administradores cuentan con herramientas para gestionar socios, embarcaciones, infraestructura y generar reportes de ocupación y morosidad.
 
## Roles de Usuario
 
**Socio**
- Consulta su situación administrativa (cuotas al día / adeudadas)
- Reserva servicios del club (botes, travel lift)
- Consulta disponibilidad de boxes y amarras
**Administrador**
- Gestión completa de socios, embarcaciones, cuotas, boxes y amarres
- Registro de pagos de cuotas
- Gestión de reservas
- Reportes de ocupación y morosidad
## Tecnologías Utilizadas
 
**Backend**
- Node.js
- TypeScript
- MikroORM
- MySQL
- JWT (autenticación) + bcrypt (hash de contraseñas)
**Frontend**
- React 
 
## Cómo Ejecutar el Proyecto
 
### Requisitos previos
- Node.js (v18 o superior)
- pnpm (para el backend)
- npm (para el frontend)
- MySQL Server
### Clonar el repositorio
 
```bash
git clone <link-al-repo>
cd TP-DSW
```
 
### Backend
Configurar variables de entorno en `.env`:
 
```env
DB_HOST=localhost
DB_PORT=tu_puerto
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=club_nautico
```
 
```bash
cd backend
pnpm install
pnpm start:dev
```
 

 
 
### Frontend
 
En otra terminal, desde la raíz del proyecto:
 
```bash
cd frontend
npm install
npm run dev
```

