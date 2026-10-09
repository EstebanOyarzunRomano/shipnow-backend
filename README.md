# ShipNow Backend

API REST desarrollada con **Node.js, Express, MongoDB y Mongoose** como parte del proyecto ShipNow de Backend III.

En esta primera etapa, el proyecto se estructuró utilizando una arquitectura por capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- Nodemon

## Arquitectura

El proyecto utiliza la siguiente arquitectura por capas:

```text
Router
  ↓
Controller
  ↓
Service
  ↓
Repository
  ↓
Model
  ↓
MongoDB
```

### Router

Define los endpoints de la API y conecta cada ruta con el método correspondiente del Controller. No contiene lógica de negocio ni acceso directo a la base de datos.

### Controller

Es la puerta de entrada HTTP de la aplicación. Recibe las peticiones, obtiene parámetros, query params y body, invoca al Service y construye las respuestas exitosas. Los errores se delegan al middleware global mediante `next(error)`.

### Service

Contiene las reglas de negocio de la aplicación, entre ellas:

- Determinar automáticamente el estado de un producto según su stock.
- Impedir precios negativos y stock negativo o no entero.
- Filtrar productos disponibles y con stock positivo cuando se solicita `onlyAvailable=true`.
- Validar los roles permitidos y asignar el rol `user` por defecto.
- Normalizar el email de los usuarios y evitar duplicados.
- Lanzar errores de negocio tipados cuando corresponda.

### Repository

Encapsula el acceso a MongoDB mediante Mongoose. Es la capa encargada de buscar, crear, actualizar y eliminar documentos, además de aplicar filtros y proyecciones de consulta.

La separación entre Service y Repository permite mantener la lógica de negocio independiente de la tecnología utilizada para persistir los datos: **el Service decide qué debe hacer la aplicación y el Repository determina cómo consultar o modificar la información almacenada**.

### Manejo centralizado de errores

Los Controllers propagan los errores al middleware `src/middlewares/error.middleware.js`, que determina el código HTTP según el tipo de error. La aplicación contempla errores personalizados de validación, recursos inexistentes y conflictos, además de errores de Mongoose y errores inesperados.

| Código | Significado | Ejemplo |
|---|---|---|
| `400 Bad Request` | Datos o identificador inválidos | Precio negativo o ID mal formado |
| `404 Not Found` | Recurso inexistente | Producto no encontrado |
| `409 Conflict` | Conflicto con un registro existente | Email duplicado |
| `500 Internal Server Error` | Error inesperado | Fallo interno no controlado |

## Estructura del proyecto

```text
src/
├── config/
│   ├── env.config.js
    └── env.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── products.controller.js
│   └── users.controller.js
├── errors/
│   └── app.error.js
├── middlewares/
│   └── error.middleware.js
├── models/
│   ├── product.model.js
│   └── user.model.js
├── repositories/
│   ├── products.repository.js
│   └── users.repository.js
├── routes/
│   ├── products.router.js
│   └── users.router.js
├── services/
│   ├── products.service.js
│   └── users.service.js
├── app.js
└── server.js
```

El inicio de la aplicación se encuentra centralizado en server.js, que establece la conexión con MongoDB mediante config/db.js y posteriormente inicia el servidor HTTP. El archivo app.js se encarga exclusivamente de configurar Express, sus rutas y middlewares. Esta separación facilita el mantenimiento y las pruebas de la aplicación.

## Configuración de entorno

La aplicación utiliza variables de entorno mediante `dotenv`.

| Variable | Descripción |
|---|---|
| `PORT` | Puerto HTTP del servidor |
| `MONGODB_URI` | Cadena de conexión a MongoDB |
| `NODE_ENV` | Entorno de ejecución, por ejemplo `development` |

El archivo `.env` no se incluye en el repositorio por motivos de seguridad. Se incluye `.env.example` como referencia.

La aplicación valida las variables críticas al iniciar. Si falta alguna o `PORT` es inválido, el servidor no inicia y muestra un error descriptivo.

## Instalación

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/EstebanOyarzunRomano/shipnow-backend.git
   ```

2. Ingresar al proyecto:

   ```bash
   cd shipnow-backend
   ```

3. Instalar las dependencias:

   ```bash
   npm install
   ```

4. Crear un archivo `.env` tomando como referencia `.env.example`:

   ```env
   PORT=8080
   MONGODB_URI=TU_URI_DE_MONGODB
   NODE_ENV=development
   ```

   Reemplazar `TU_URI_DE_MONGODB` por una cadena de conexión válida. No subir credenciales al repositorio.

## Ejecución

En modo desarrollo:

```bash
npm run dev
```

En modo normal:

```bash
npm start
```

Con `PORT=8080`, la API estará disponible en `http://localhost:8080`.

## Endpoints de Products

| Método | Endpoint | Descripción | Filtros / parámetros |
|---|---|---|---|
| `GET` | `/api/products` | Listar productos | `status`, `onlyAvailable` (opcionales) |
| `GET` | `/api/products/:id` | Obtener un producto por ID | `id`: identificador del producto |
| `POST` | `/api/products` | Crear un producto | Body JSON |
| `PUT` | `/api/products/:id` | Actualizar un producto | `id` y Body JSON |
| `DELETE` | `/api/products/:id` | Eliminar un producto | `id`: identificador del producto |

### Filtros de productos

- `status=available`: devuelve productos cuyo estado es `available`.
- `status=out_of_stock`: devuelve productos cuyo estado es `out_of_stock`.
- `onlyAvailable=true`: devuelve únicamente productos con estado `available` **y stock mayor a cero**.
- Si se envían `onlyAvailable=true` y `status` simultáneamente, `onlyAvailable=true` tiene prioridad sobre el filtro `status`.
- Si no se envían filtros, se devuelven todos los productos.

Ejemplos:

```http
GET /api/products
GET /api/products?status=out_of_stock
GET /api/products?onlyAvailable=true
```

### Ejemplo: crear producto

```http
POST /api/products
Content-Type: application/json
```

```json
{
  "name": "Notebook Lenovo",
  "description": "Notebook para uso profesional",
  "price": 850000,
  "stock": 10
}
```

El estado del producto se calcula automáticamente a partir de `stock`: `available` si es mayor que cero y `out_of_stock` si es cero.

## Endpoints de Users

| Método | Endpoint | Descripción | Filtros / parámetros |
|---|---|---|---|
| `GET` | `/api/users` | Listar usuarios | `role` (opcional) |
| `GET` | `/api/users/:id` | Obtener un usuario por ID | `id`: identificador del usuario |
| `POST` | `/api/users` | Crear un usuario | Body JSON |
| `PUT` | `/api/users/:id` | Actualizar un usuario | `id` y Body JSON |
| `DELETE` | `/api/users/:id` | Eliminar un usuario | `id`: identificador del usuario |

### Filtro de usuarios

- `role=user`: devuelve usuarios con rol `user`.
- `role=admin`: devuelve usuarios con rol `admin`.
- Si no se envía `role`, se devuelven todos los usuarios.

Ejemplos:

```http
GET /api/users
GET /api/users?role=admin
```

### Ejemplo: crear usuario

```http
POST /api/users
Content-Type: application/json
```

```json
{
  "firstName": "Esteban",
  "lastName": "Oyarzun",
  "email": "esteban@shipnow.com"
}
```

Si no se indica `role`, se asigna `user` por defecto. Los emails se normalizan a minúsculas y no pueden repetirse.

## Formato de respuestas

Las operaciones exitosas devuelven un objeto con `status` y `data`:

```json
{
  "status": "success",
  "data": {}
}
```

El contenido de `data` depende del endpoint: puede ser un objeto o una lista.

Los errores devuelven un objeto con `status` y `message`:

```json
{
  "status": "error",
  "message": "Producto no encontrado"
}
```

## Constantes del dominio

Los valores fijos del dominio se encuentran centralizados en `src/constants/index.js`:

- Roles de usuario: `USER_ROLES.ADMIN` (`admin`) y `USER_ROLES.USER` (`user`).
- Estados de producto: `PRODUCT_STATUS.AVAILABLE` (`available`) y `PRODUCT_STATUS.OUT_OF_STOCK` (`out_of_stock`).

Estas constantes utilizan `Object.freeze()` para evitar modificaciones durante la ejecución y reducir el uso de *strings mágicos*.

## Autor

Esteban Oyarzun
