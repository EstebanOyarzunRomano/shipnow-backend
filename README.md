# ShipNow Backend — Backend III

API REST desarrollada con **Node.js, Express, MongoDB Atlas y Mongoose**. El proyecto aplica arquitectura por capas e incorpora gestión de usuarios y productos, generación de datos simulados, inserción y limpieza transaccional de datos de prueba, manejo centralizado de errores, logging con Winston, pruebas automatizadas y **documentación interactiva Swagger/OpenAPI 3.0.3**.

## Tecnologías

- **Node.js 20** y **Express**: servidor y API REST.
- **MongoDB Atlas** y **Mongoose**: persistencia, validaciones, relaciones y transacciones.
- **@faker-js/faker** (`fakerES`): generación de datos simulados.
- **dotenv**: configuración mediante variables de entorno.
- **Nodemon**: ejecución en desarrollo.
- **Winston** y **winston-daily-rotate-file**: logging y rotación de archivos.
- **Jest** y **Supertest**: pruebas automatizadas.
- **swagger-jsdoc** y **swagger-ui-express**: especificación OpenAPI y documentación interactiva.

## Arquitectura

```text
Petición HTTP
     ↓
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

- **Router:** registra rutas y métodos HTTP.
- **Controller:** obtiene parámetros y datos de entrada, invoca servicios y construye respuestas.
- **Service:** concentra reglas de negocio y validaciones.
- **Repository:** encapsula operaciones de persistencia mediante Mongoose.
- **Model:** define esquemas, restricciones y relaciones.
- **Middlewares:** gestionan errores asíncronos, rutas inexistentes y respuestas de error uniformes.
- **Documentación:** los archivos YAML describen los endpoints y esquemas sin mezclar la especificación con la lógica de negocio.

Los controladores utilizan `asyncHandler` para propagar excepciones al middleware global. Las operaciones de mocking sin persistencia se generan en memoria; la carga y limpieza de datos utilizan repositorios y transacciones MongoDB.

## Estructura principal

```text
src/
├── config/
│   ├── db.js
│   ├── env.config.js
│   ├── logger.js
│   └── swagger.js
├── constants/
│   ├── error-codes.js
│   └── index.js
├── controllers/
│   ├── mocks.controller.js
│   ├── products.controller.js
│   └── users.controller.js
├── docs/
│   ├── deliveries.yaml
│   ├── logger.yaml
│   ├── mocks.yaml
│   ├── orders.yaml
│   ├── products.yaml
│   ├── schemas.yaml
│   └── users.yaml
├── errors/
│   └── app.error.js
├── middlewares/
│   ├── asyncHandler.js
│   ├── error.middleware.js
│   └── notFound.middleware.js
├── models/
│   ├── delivery.model.js
│   ├── order.model.js
│   ├── product.model.js
│   └── user.model.js
├── repositories/
│   ├── deliveries.repository.js
│   ├── orders.repository.js
│   ├── products.repository.js
│   └── users.repository.js
├── routes/
│   ├── logger.router.js
│   ├── mocks.router.js
│   ├── products.router.js
│   └── users.router.js
├── services/
│   ├── mocks.service.js
│   ├── products.service.js
│   └── users.service.js
├── app.js
└── server.js

tests/
├── logger.test.js
└── logger-file.test.js
```

`server.js` carga la configuración, conecta con MongoDB e inicia el servidor. `app.js` configura Express, Swagger UI, los routers y, al final, los middlewares de rutas inexistentes y errores.

## Instalación y ejecución

**1. Clonar el repositorio**

```bash
git clone https://github.com/EstebanOyarzunRomano/shipnow-backend.git
cd shipnow-backend
```

**2. Instalar dependencias**

```bash
npm install
```

**3. Configurar variables de entorno**

Crear un archivo `.env` a partir de `.env.example`:

```env
PORT=8080
MONGODB_URI=TU_URI_DE_MONGODB
NODE_ENV=development
```

Utilizar una **base de datos de desarrollo o pruebas**. No subir `.env`, credenciales ni cadenas de conexión privadas al repositorio.

**4. Iniciar la API**

```bash
npm run dev
```

Para ejecución normal:

```bash
npm start
```

Con `PORT=8080`, la API queda disponible en `http://localhost:8080`.

## Módulo 1 — Usuarios y productos

### Usuarios

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/users` | Listar usuarios; filtro opcional `role` |
| GET | `/api/users/:id` | Consultar un usuario por ObjectId |
| POST | `/api/users` | Crear un usuario |
| PUT | `/api/users/:id` | Actualizar un usuario |
| DELETE | `/api/users/:id` | Eliminar un usuario |

Ejemplo de creación:

```http
POST /api/users
Content-Type: application/json
```

```json
{
  "firstName": "Ana",
  "lastName": "Pérez",
  "email": "ana@example.com",
  "role": "user"
}
```

Los roles permitidos son `admin`, `user` y `driver`. El rol predeterminado es `user`. El email se normaliza a minúsculas y debe ser único.

### Productos

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/products` | Listar productos; admite filtros como `status` y `onlyAvailable` |
| GET | `/api/products/:id` | Consultar un producto por ObjectId |
| POST | `/api/products` | Crear un producto |
| PUT | `/api/products/:id` | Actualizar un producto |
| DELETE | `/api/products/:id` | Eliminar un producto |

Ejemplo de creación:

```http
POST /api/products
Content-Type: application/json
```

```json
{
  "name": "Notebook Lenovo",
  "description": "Notebook para uso profesional",
  "price": 850000,
  "stock": 5
}
```

**Reglas de negocio:** `price` debe ser un número mayor o igual a cero; `stock` debe ser un entero mayor o igual a cero. El servicio exige ambos campos al crear productos. El estado se calcula automáticamente: `available` si `stock > 0` y `out_of_stock` si `stock = 0`. No debe establecerse manualmente mediante el body. El filtro `onlyAvailable=true` selecciona productos disponibles con stock positivo y prevalece sobre un filtro `status` incompatible.

## Módulo 2 — Mocking y seed transaccional

La generación de datos utiliza Faker con localización española. Los endpoints GET generan datos **en memoria**, mientras que POST seed y DELETE realizan operaciones sobre MongoDB.

| Método | Endpoint | Operación | ¿Persiste? |
|---|---|---|---|
| GET | `/api/mocks/users?qty=3` | Generar usuarios | No |
| GET | `/api/mocks/drivers?qty=3` | Generar repartidores | No |
| GET | `/api/mocks/orders?qty=3` | Generar pedidos | No |
| GET | `/api/mocks/deliveries?qty=3` | Generar entregas | No |
| GET | `/api/mocks/dataset?qty=3` | Generar dataset relacionado | No |
| POST | `/api/mocks/seed?qty=3` | Insertar datos de prueba | Sí |
| DELETE | `/api/mocks?seedId=...` | Eliminar datos de un seed | Sí |

`qty` es opcional, tiene valor predeterminado `10` y admite enteros de **1 a 100**. Los valores inválidos producen `400 INVALID_MOCK_QUANTITY`.

### Generación individual y dataset

```http
GET /api/mocks/users?qty=2
GET /api/mocks/dataset?qty=2
```

Los generadores individuales de pedidos y entregas producen identificadores ficticios con formato MongoDB, pero **no crean** los documentos referenciados. Para obtener entidades vinculadas entre sí, utilizar `/api/mocks/dataset`.

El dataset genera usuarios, repartidores, productos, pedidos y entregas con referencias coherentes:

- `orders[].user` corresponde a un usuario del dataset.
- `orders[].products[].product` corresponde a un producto del dataset.
- `deliveries[].order` corresponde a un pedido del dataset.
- `deliveries[].driver` corresponde a un repartidor del dataset.
- Los totales de los pedidos se calculan a partir del precio y la cantidad de los productos.
- Los estados de entrega son coherentes con los estados de pedido simulados.

La respuesta del dataset contiene `payload.message`, `payload.quantity` y `payload.data`. **Detalle de implementación:** cuando se proporciona `qty` por query string, `payload.quantity` puede devolverse como texto (por ejemplo, `"2"`); si se omite, utiliza el valor numérico predeterminado `10`.

### Inserción transaccional (seed)

```http
POST /api/mocks/seed?qty=2
```

No requiere body. Genera un `seedId` y crea usuarios, repartidores, pedidos y entregas relacionados. Si existen productos disponibles, los reutiliza sin etiquetarlos con el nuevo seed ni modificar su stock; si no existen, genera productos disponibles dentro de la misma transacción.

Ejemplo de respuesta `201 Created` cuando ya existen productos disponibles:

```json
{
  "status": "success",
  "payload": {
    "message": "Datos de prueba insertados correctamente",
    "seedId": "507f1f77bcf86cd799439011",
    "inserted": {
      "products": 0,
      "users": 2,
      "drivers": 2,
      "orders": 2,
      "deliveries": 2
    },
    "totalInserted": 8
  }
}
```

La inserción utiliza `session.withTransaction()`. Si una operación transaccional falla, los cambios de esa transacción se revierten. MongoDB debe admitir transacciones (por ejemplo, MongoDB Atlas con replica set).

### Limpieza controlada por seedId

```http
DELETE /api/mocks?seedId=507f1f77bcf86cd799439011
```

Elimina únicamente los documentos vinculados al `seedId` indicado, dentro de una transacción. Antes de borrar, verifica si existen referencias externas; si las hay, devuelve `409 SEED_HAS_EXTERNAL_REFERENCES` sin eliminar los registros. Si no encuentra documentos, responde `404 SEED_NOT_FOUND`.

Los repartidores se almacenan como usuarios con rol `driver`; por eso se contabilizan junto con los usuarios en `deleted.users`.

**Precaución:** las operaciones de seed y limpieza modifican MongoDB. Utilizarlas exclusivamente en una base de desarrollo o pruebas. No exponerlas públicamente en producción sin autenticación, autorización y restricciones de entorno.

## Módulo 3 — Manejo centralizado de errores

El proyecto utiliza `AppError`, `ValidationError`, `NotFoundError` y `ConflictError`, junto con el diccionario `src/constants/error-codes.js`. El wrapper `asyncHandler` propaga errores de controladores al middleware global.

Formato de respuesta exitosa habitual:

```json
{
  "status": "success",
  "payload": {}
}
```

Formato de error:

```json
{
  "status": "error",
  "code": "PRODUCT_NOT_FOUND",
  "message": "Producto no encontrado"
}
```

| HTTP | Situación | Código de ejemplo |
|---|---|---|
| 400 | Cantidad de mocks inválida | `INVALID_MOCK_QUANTITY` |
| 400 | `seedId` inválido | `INVALID_SEED_ID` |
| 400 | JSON malformado | `INVALID_JSON` |
| 400 | Precio o stock inválido | `INVALID_PRODUCT_PRICE`, `INVALID_PRODUCT_STOCK` |
| 400 | Datos, email o rol inválidos | `INVALID_DATA`, `USER_EMAIL_REQUIRED`, `INVALID_USER_ROLE` |
| 400 | Identificador inválido | `INVALID_IDENTIFIER` |
| 404 | Ruta inexistente | `ROUTE_NOT_FOUND` |
| 404 | Usuario o producto inexistente | `USER_NOT_FOUND`, `PRODUCT_NOT_FOUND` |
| 404 | Seed inexistente | `SEED_NOT_FOUND` |
| 409 | Email duplicado | `USER_EMAIL_ALREADY_EXISTS` |
| 409 | Referencias externas de un seed | `SEED_HAS_EXTERNAL_REFERENCES` |
| 500 | Error inesperado | `INTERNAL_ERROR` |

El middleware también procesa errores de Mongoose/MongoDB, como `CastError`, errores de validación y claves únicas duplicadas. Las respuestas `500` no deben revelar trazas ni información interna del servidor.

## Módulo 4 — Logging y pruebas

El logger centralizado utiliza **Winston** y **winston-daily-rotate-file**. Se integra con el inicio del servidor, conexión a MongoDB, servicios, mocking y manejo de errores.

| Nivel | Prioridad | Uso |
|---|---:|---|
| `fatal` | 0 | Fallas críticas |
| `error` | 1 | Errores inesperados |
| `warning` | 2 | Validaciones y errores operacionales |
| `info` | 3 | Operaciones exitosas relevantes |
| `http` | 4 | Diagnóstico HTTP |
| `debug` | 5 | Depuración detallada |

En desarrollo, la consola permite visualizar todos los niveles; en producción se limita a `fatal`, `error`, `warning` e `info`.

### Endpoint de diagnóstico

```http
GET /api/logger-test
```

Respuesta esperada en desarrollo:

```json
{
  "status": "success",
  "message": "Prueba del logger ejecutada correctamente",
  "levels": ["debug", "http", "info", "warning", "error", "fatal"]
}
```

El endpoint está registrado únicamente cuando `NODE_ENV` es distinto de `production`. En producción responde `404 ROUTE_NOT_FOUND` porque la ruta no está habilitada. Los mensajes de `error` y `fatal` de este endpoint son **simulaciones de diagnóstico**.

### Archivos y rotación

Los registros de error se almacenan en `logs/error-YYYY-MM-DD.log`. El transporte de archivos conserva los niveles `error` y `fatal`, con rotación diaria, tamaño máximo configurado de **10 MB** y retención de **14 días**. El archivo de auditoría de rotación se gestiona automáticamente. La escritura fue comprobada; no se ensayó la rotación efectiva por tiempo o tamaño.

La carpeta `logs/` y los archivos `*.log` deben quedar excluidos de Git.

### Pruebas automatizadas

```bash
npm test
```

| Archivo | Objetivo |
|---|---|
| `tests/logger.test.js` | Verificar la respuesta del endpoint de diagnóstico mediante Supertest |
| `tests/logger-file.test.js` | Verificar la persistencia de un mensaje `logger.error()` en el archivo diario |

**Última ejecución registrada (29/10/2026):** 2 suites aprobadas, 2 tests aprobados y 0 fallidos. Estas pruebas cubren observabilidad, no constituyen una suite completa de CRUD ni prueban la rotación efectiva de archivos.

## Módulo 5 — Documentación Swagger / OpenAPI

La Preentrega 5 incorpora documentación interactiva basada en **OpenAPI 3.0.3**, generada con `swagger-jsdoc` y publicada mediante `swagger-ui-express`.

Con el servidor en ejecución, acceder a:

**http://localhost:8080/api/docs**

Desde Swagger UI es posible consultar las operaciones, revisar parámetros y esquemas, visualizar códigos de respuesta y ejecutar peticiones con **Try it out → Execute**.

### Organización de la documentación

| Archivo | Contenido |
|---|---|
| `src/config/swagger.js` | Metadatos OpenAPI, servidor, etiquetas y carga de archivos YAML |
| `src/docs/users.yaml` | CRUD de usuarios |
| `src/docs/products.yaml` | CRUD de productos y filtro de disponibilidad |
| `src/docs/orders.yaml` | Generación de pedidos simulados |
| `src/docs/deliveries.yaml` | Generación de entregas simuladas |
| `src/docs/mocks.yaml` | Usuarios, repartidores, dataset, seed y limpieza |
| `src/docs/logger.yaml` | Endpoint de diagnóstico de Winston |
| `src/docs/schemas.yaml` | Esquemas reutilizables de entidades y respuestas |

### Categorías documentadas

| Etiqueta | Operaciones |
|---|---|
| **Users** | Cinco operaciones CRUD de usuarios |
| **Products** | Cinco operaciones CRUD de productos |
| **Orders** | `GET /api/mocks/orders` |
| **Deliveries** | `GET /api/mocks/deliveries` |
| **Mocks** | Generación de usuarios, repartidores, pedidos, entregas, dataset, seed y limpieza |
| **Logger** | `GET /api/logger-test` |

Los endpoints de pedidos y entregas aparecen también bajo **Mocks**, porque generan información simulada. **No existen rutas CRUD independientes `/api/orders` o `/api/deliveries`** en esta etapa del proyecto.

### Esquemas reutilizables

Se definieron **once esquemas**:

- `User` y `MockUser`.
- `Product` y `MockProduct`.
- `OrderItem`, `Order` y `MockOrder`.
- `Delivery` y `MockDelivery`.
- `ErrorResponse` y `SuccessResponse`.

Los esquemas `Mock*` distinguen las respuestas generadas en memoria de los documentos persistidos en MongoDB. Los esquemas de error describen el formato uniforme `{ status, code, message }`.

### Parámetros y validaciones documentadas

- `id`: identificador MongoDB de 24 caracteres hexadecimales.
- `role`: `admin`, `user` o `driver`.
- `onlyAvailable`: filtro booleano para productos disponibles.
- `qty`: entero entre 1 y 100, predeterminado 10.
- `seedId`: identificador de una operación de seed para limpieza controlada.
- Bodies de creación y actualización de usuarios y productos.
- Respuestas `200`, `201`, `400`, `404`, `409` y `500` según las operaciones aplicables.

Swagger describe las restricciones de la API, pero **no reemplaza las validaciones del backend**. Los errores reales siguen siendo procesados por los servicios y el middleware global.

### Pruebas manuales realizadas desde Swagger UI

Durante la Preentrega 5 se verificaron:

| Operación | Resultado observado |
|---|---|
| `GET /api/users` y CRUD de usuarios | Consultas, creación, actualización, eliminación y recurso inexistente |
| `GET /api/mocks/users` | Generación de usuarios simulados |
| `GET /api/mocks/drivers` | Generación de repartidores simulados |
| `GET /api/mocks/orders` | Pedidos simulados con estados y prioridades válidos |
| `GET /api/mocks/deliveries` | Entregas simuladas con referencias y fechas |
| `GET /api/mocks/dataset` | Dataset de entidades relacionadas |
| `POST /api/mocks/seed` | Inserción transaccional y obtención de `seedId` |
| `DELETE /api/mocks` | Limpieza del seed y comprobación de `SEED_NOT_FOUND` al repetirla |
| `GET /api/logger-test` | Respuesta exitosa con los seis niveles de Winston |
| `GET /api/products` | Listado de productos |
| `GET /api/products?onlyAvailable=true` | Exclusión de productos sin stock |
| `POST /api/products` | Creación de producto temporal |
| `GET /api/products/:id` | Recuperación del producto temporal |
| `PUT /api/products/:id` | Cambio de stock de 5 a 0 y estado automático `out_of_stock` |
| `DELETE /api/products/:id` | Eliminación del producto temporal |
| `GET /api/products/:id` tras eliminarlo | Error `PRODUCT_NOT_FOUND` |

Las operaciones de escritura de prueba se realizaron con registros temporales y se completó su eliminación. La presencia de una respuesta JSON correcta no sustituye la verificación del código HTTP mostrado en Swagger.

### Limitaciones y consideraciones

- Swagger UI está disponible en `/api/docs` mientras la aplicación esté iniciada.
- El endpoint `/api/logger-test` no se registra en producción, aunque su descripción figure en la especificación.
- Los endpoints de seed y limpieza **no están protegidos por autenticación en esta etapa**; no deben exponerse en un entorno público sin controles adicionales.
- La documentación describe los endpoints implementados; no implica la existencia de operaciones CRUD independientes para pedidos o entregas.

## Verificaciones adicionales recomendadas

Antes de una entrega o despliegue:

1. Ejecutar `npm test` y comprobar que las suites finalicen correctamente.
2. Abrir `/api/docs` y comprobar que las seis categorías y los once esquemas aparezcan sin errores de referencia.
3. Verificar los códigos HTTP de las respuestas de prueba desde Swagger.
4. Comprobar que `NODE_ENV=production` deshabilite `/api/logger-test`.
5. Utilizar una base aislada para probar seed, conflictos de referencias externas y limpieza.
6. Confirmar que `.env`, `node_modules/` y `logs/` no estén incluidos en Git.

## Seguridad y control de versiones

El archivo `.gitignore` debe excluir, como mínimo:

```gitignore
node_modules/
.env
logs/
*.log
```

Conservar `.env.example` sin credenciales. No publicar datos privados, secretos, cadenas de conexión ni registros operativos sensibles.

## Autor
Esteban Damian Oyarzun Romano
