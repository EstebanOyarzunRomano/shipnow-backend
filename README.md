# ShipNow Backend

API REST desarrollada con Node.js, Express, MongoDB y Mongoose como parte del proyecto ShipNow de Backend III.

En esta primera etapa, el proyecto fue estructurado utilizando una arquitectura por capas para separar las responsabilidades de acceso HTTP, lógica de negocio y persistencia de datos.

## Tecnologías utilizadas

- Node.js
- Express
- MongoDB Atlas
- Mongoose
- dotenv
- Nodemon

## Arquitectura

El proyecto utiliza una arquitectura organizada en capas:

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

Define los endpoints de la API y conecta cada ruta con el método correspondiente del Controller.

Los routers no contienen lógica de negocio ni acceso directo a la base de datos.

### Controller

Es la puerta de entrada HTTP de la aplicación.

Se encarga de:

- Recibir `req`.
- Obtener parámetros, query params y body.
- Invocar al Service correspondiente.
- Generar la respuesta HTTP mediante `res`.
- Establecer los códigos de estado HTTP.

### Service

Contiene la lógica de negocio de la aplicación.

Entre las reglas implementadas se encuentran:

- Determinar automáticamente el estado de un producto según su stock.
- Impedir valores negativos de precio o stock.
- Validar los roles permitidos de los usuarios.
- Asignar el rol USER por defecto.
- Evitar la creación de usuarios con emails duplicados.

### Repository

Encapsula el acceso a MongoDB mediante Mongoose.

Es la única capa encargada de realizar operaciones de persistencia, como:

- Buscar documentos.
- Crear documentos.
- Actualizar documentos.
- Eliminar documentos.
- Aplicar filtros y proyecciones de datos.

La separación entre Service y Repository permite mantener la lógica de negocio independiente de la tecnología utilizada para persistir los datos.

De esta manera, el Service decide qué debe hacer la aplicación, mientras que el Repository determina cómo consultar o modificar la información almacenada.

## Estructura del proyecto

```text
src/
├── config/
│   └── env.config.js
├── constants/
│   └── index.js
├── controllers/
│   ├── products.controller.js
│   └── users.controller.js
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
└── app.js
```

## Configuración de entorno

La aplicación utiliza variables de entorno mediante `dotenv`.

Las variables necesarias son:

```env
PORT=
MONGODB_URI=
NODE_ENV=
```

El archivo `.env` no se incluye en el repositorio por motivos de seguridad.

Se incluye un archivo `.env.example` con las variables necesarias para ejecutar el proyecto.

La aplicación valida las variables críticas al iniciar. Si falta alguna de ellas, el servidor no inicia y muestra un error descriptivo.

## Instalación

Clonar el repositorio:

```bash
git clone URL_DEL_REPOSITORIO
```

Ingresar al proyecto:

```bash
cd shipnow-backend
```

Instalar las dependencias:

```bash
npm install
```

Crear un archivo `.env` tomando como referencia `.env.example`:

```env
PORT=8080
MONGODB_URI=TU_URI_DE_MONGODB
NODE_ENV=development
```

## Ejecución

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

Para ejecutarlo normalmente:

```bash
npm start
```

Una vez iniciado correctamente, el servidor estará disponible, por defecto, en:

```text
http://localhost:8080
```

## Endpoints de Products

### Obtener todos los productos

```http
GET /api/products
```

### Obtener un producto por ID

```http
GET /api/products/:id
```

### Crear un producto

```http
POST /api/products
```

Ejemplo de body:

```json
{
  "name": "Notebook Lenovo",
  "description": "Notebook para uso profesional",
  "price": 850000,
  "stock": 10
}
```

### Actualizar un producto

```http
PUT /api/products/:id
```

### Eliminar un producto

```http
DELETE /api/products/:id
```

## Endpoints de Users

### Obtener todos los usuarios

```http
GET /api/users
```

### Obtener un usuario por ID

```http
GET /api/users/:id
```

### Crear un usuario

```http
POST /api/users
```

Ejemplo de body:

```json
{
  "firstName": "Esteban",
  "lastName": "Oyarzun",
  "email": "esteban@shipnow.com"
}
```

### Actualizar un usuario

```http
PUT /api/users/:id
```

### Eliminar un usuario

```http
DELETE /api/users/:id
```

## Constantes del dominio

Los valores fijos del dominio se encuentran centralizados en `src/constants/index.js`.

Se definieron constantes para:

- Roles de usuario: `ADMIN` y `USER`.
- Estados de producto: `AVAILABLE` y `OUT_OF_STOCK`.

Estas constantes utilizan `Object.freeze()` para evitar modificaciones durante la ejecución y eliminar el uso de strings mágicos en la aplicación.

## Autor

Esteban Oyarzun