# ShipNow Backend

API REST desarrollada con **Node.js, Express, MongoDB Atlas y Mongoose** para el proyecto ShipNow de Backend III.

El proyecto utiliza una **arquitectura por capas** y cuenta con gestión de usuarios y productos (Módulo 1), además de **mocking y carga controlada de datos de prueba** (Módulo 2) para usuarios, repartidores, productos, pedidos y entregas.

## Tecnologías

- Node.js y Express
- MongoDB Atlas y Mongoose
- @faker-js/faker con localización `fakerES` (datos simulados)
- dotenv (variables de entorno)
- Nodemon (desarrollo)

## Arquitectura

```text
Router → Controller → Service → Repository → Model → MongoDB
```

- **Router:** define rutas HTTP y las conecta con sus controladores, sin lógica de negocio.
- **Controller:** interpreta parámetros, ejecuta servicios y responde por HTTP; delega errores con `next(error)`.
- **Service:** aplica reglas de negocio, validaciones y generación de datos simulados.
- **Repository:** encapsula consultas e inserciones en MongoDB mediante Mongoose.
- **Model:** define esquemas, relaciones y restricciones de los documentos.
- **Middlewares:** gestionan rutas inexistentes y errores de forma centralizada, con respuestas JSON.
- **Diccionario de errores:** centraliza códigos y mensajes reutilizados en las capas de la aplicación.

Los endpoints GET de mocking generan datos **en memoria** y no los insertan en la base. Los endpoints de seed y limpieza usan repositorios y transacciones para persistir o eliminar datos relacionados.

## Estructura del proyecto

```text
src/
├── config/
│   ├── db.js
│   └── env.config.js
├── constants/
│   ├── error-codes.js
│   └── index.js
├── controllers/
│   ├── mocks.controller.js
│   ├── products.controller.js
│   └── users.controller.js
├── errors/
│   └── app.error.js
├── middlewares/
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
│   ├── mocks.router.js
│   ├── products.router.js
│   └── users.router.js
├── services/
│   ├── mocks.service.js
│   ├── products.service.js
│   └── users.service.js
├── app.js
└── server.js
```

`server.js` conecta con MongoDB e inicia el servidor. `app.js` configura Express, los routers, el middleware de rutas inexistentes y el manejador global de errores, en ese orden.

## Instalación y configuración

1. Clonar el repositorio:

   ```bash
   git clone https://github.com/EstebanOyarzunRomano/shipnow-backend.git
   cd shipnow-backend
   ```
2. Instalar las dependencias:
   ```bash
   npm install
   ```
3. Crear `.env` a partir de `.env.example`:
   ```env
   PORT=8080
   MONGODB_URI=TU_URI_DE_MONGODB
   NODE_ENV=development
   ```
   Reemplazar `TU_URI_DE_MONGODB` por una cadena de conexión válida a una **base de desarrollo/pruebas**. No subir `.env` ni credenciales a GitHub.
4. Iniciar el servidor:
   ```bash
   npm run dev
   ```
   O ejecutar en modo normal:
   ```bash
   npm start
   ```
Con `PORT=8080`, la API estará disponible en `http://localhost:8080`.
## Módulo 1 — Usuarios y productos

### Endpoints de productos

\| Método | Endpoint | Descripción |
\|---|---|---|
\| GET | `/api/products` | Listar productos; filtros opcionales `status` y `onlyAvailable` |
\| GET | `/api/products/:id` | Obtener producto por ID |
\| POST | `/api/products` | Crear producto con body JSON |
\| PUT | `/api/products/:id` | Actualizar producto |
\| DELETE | `/api/products/:id` | Eliminar producto |
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

  "stock": 10

}

```
El estado del producto se determina automáticamente a partir de su stock: `available` si es mayor que cero y `out_of_stock` si es cero. `onlyAvailable=true` devuelve productos disponibles con stock positivo y tiene prioridad sobre el filtro `status`.
### Endpoints de usuarios

\| Método | Endpoint | Descripción |
\|---|---|---|
\| GET | `/api/users` | Listar usuarios; filtro opcional `role` |
\| GET | `/api/users/:id` | Obtener usuario por ID |
\| POST | `/api/users` | Crear usuario con body JSON |
\| PUT | `/api/users/:id` | Actualizar usuario |
\| DELETE | `/api/users/:id` | Eliminar usuario |
Ejemplo de creación:
```http

POST /api/users

Content-Type: application/json

```
```json

{

  "firstName": "Ana",

  "lastName": "Pérez",

  "email": "ana@example.com"

}

```
Si no se indica `role`, se asigna `user`. Los emails se normalizan a minúsculas y deben ser únicos. Los roles válidos son `admin`, `user` y `driver`.
## Módulo 2 — Mocking y carga de datos de prueba

El router `/api/mocks` genera información ficticia mediante `@faker-js/faker`, utilizando `fakerES` para nombres y direcciones en español. Las descripciones de productos se construyen con plantillas en español. La generación de datos, las reglas de negocio y la persistencia están separadas mediante la arquitectura por capas.
### Endpoints de mocking

| Método | Endpoint | Resultado | ¿Modifica MongoDB? |
|---|---|---|---|
| GET | `/api/mocks/users?qty=3` | Usuarios con rol `user` | No |
| GET | `/api/mocks/drivers?qty=3` | Repartidores con rol `driver` | No |
| GET | `/api/mocks/orders?qty=3` | Pedidos simulados | No |
| GET | `/api/mocks/deliveries?qty=3` | Entregas simuladas | No |
| GET | `/api/mocks/dataset?qty=3` | Dataset relacionado de las cinco entidades | No |
| POST | `/api/mocks/seed?qty=3` | Inserta datos de prueba relacionados y devuelve `seedId` | Sí |
| DELETE | `/api/mocks?seedId=...` | Elimina exclusivamente los registros de ese seed, si no hay referencias externas | Sí |
`qty` es opcional, su valor predeterminado es `10` y acepta únicamente enteros entre **1 y 100**. Los valores inválidos responden HTTP `400` con código `INVALID_MOCK_QUANTITY`. En los endpoints que reciben `qty`, la cantidad se aplica a cada entidad generada. El seed crea `qty` usuarios, `qty` repartidores, `qty` pedidos y `qty` entregas; **solo crea productos si no encuentra productos disponibles**.
### Generación en memoria

```http

GET http://localhost:8080/api/mocks/users?qty=2

```
Respuesta ilustrativa `200 OK` (los datos cambian en cada ejecución):
```json

{

  "status": "success",

  "payload": [

    {

      "firstName": "Ana",

      "lastName": "Pérez",

      "email": "ana.perez@example.com",

      "role": "user"

    },

    {

      "firstName": "Luis",

      "lastName": "Gómez",

      "email": "luis.gomez@example.com",

      "role": "user"

    }

  ]

}

```
Para generar un conjunto completo y relacionado:
```http

GET http://localhost:8080/api/mocks/dataset?qty=3

```
Estructura ilustrativa de la respuesta:
```json

{

  "status": "success",

  "payload": {

    "message": "Datos simulados generados correctamente",

    "quantity": 3,

    "data": {

      "users": [],

      "drivers": [],

      "products": [],

      "orders": [],

      "deliveries": []

    }

  }

}

```
**Nota:** los arreglos vacíos representan solamente la estructura del ejemplo; una respuesta real con `qty=3` incluye tres registros por entidad.
En el dataset relacionado:
- `orders[].user` referencia un `_id` presente en `users`.
- `orders[].products[].product` referencia un `_id` presente en `products`.
- `deliveries[].order` referencia un `_id` presente en `orders`.
- `deliveries[].driver` referencia un `_id` presente en `drivers`, cuyos usuarios tienen rol `driver`.
- Los pedidos usan productos disponibles (`stock > 0`, `status: "available"`) y calculan `total` a partir de precio y cantidad.
- El estado de cada producto se deriva de su stock mediante `PRODUCT_STATUS`.
- Los estados de las entregas se generan de forma coherente con los pedidos: `pending` → `pending`, `confirmed` → `assigned`, `in_transit` → `in_progress`, `delivered` → `completed` y `cancelled` → `failed` en los casos simulados con repartidor.
Los endpoints individuales `/orders` y `/deliveries` producen referencias ficticias con formato MongoDB, pero no crean los documentos referenciados ni comparten necesariamente identificadores entre peticiones. Para comprobar relaciones completas sin persistencia, utilizar `/dataset`.
### Carga de datos de prueba (seed)

**Advertencia:** este endpoint inserta documentos en MongoDB. Ejecutarlo únicamente contra una **base de desarrollo o pruebas**.
```http

POST http://localhost:8080/api/mocks/seed?qty=2

```
No requiere body. Respuesta ilustrativa `201 Created` **cuando ya existen productos disponibles**:
```json

{

  "status": "success",

  "payload": {

    "message": "Datos de prueba insertados correctamente",

    "seedId": "6ad28272051fdd9fa12517b6",

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
El `seedId` es diferente en cada ejecución y se guarda en los documentos generados para permitir su limpieza posterior. El servicio asigna emails únicos por ejecución.
**Seed autosuficiente:** si existen productos con `status: "available"` y `stock > 0`, los reutiliza sin etiquetarlos ni modificar su stock. Si no encuentra ninguno, genera e inserta `qty` productos disponibles dentro de la misma transacción. En ese caso, para `qty=2`, `inserted.products` vale `2` y `totalInserted` vale `10`.
El proceso:
1. Valida `qty` y genera un `seedId`.
2. Busca productos disponibles; si no existen, genera productos y los inserta.
3. Inserta usuarios y repartidores, conservando sus `_id` reales.
4. Crea pedidos vinculados a usuarios y productos disponibles, calculando sus totales.
5. Crea entregas vinculadas a los pedidos y repartidores insertados, con estados coherentes.
6. Ejecuta las inserciones mediante `session.withTransaction()` y devuelve el resumen.
Las transacciones requieren una instancia de MongoDB compatible, como MongoDB Atlas con replica set. Si falla una operación transaccional, se revierten los cambios de esa transacción.
### Limpieza controlada por `seedId`

```http

DELETE http://localhost:8080/api/mocks?seedId=6ad28272051fdd9fa12517b6

```
No requiere body. Respuesta ilustrativa `200 OK` cuando el seed tiene dos usuarios (uno común y un repartidor), un pedido y una entrega:
```json

{

  "status": "success",

  "payload": {

    "message": "Datos simulados eliminados correctamente",

    "seedId": "6ad28272051fdd9fa12517b6",

    "deleted": {

      "products": 0,

      "users": 2,

      "orders": 1,

      "deliveries": 1

    },

    "totalDeleted": 4

  }

}

```
La limpieza:
1. Valida que `seedId` sea un identificador válido.
2. Recupera los usuarios, productos, pedidos y entregas etiquetados con ese `seedId`.
3. Devuelve `404 SEED_NOT_FOUND` si no encuentra registros.
4. Comprueba si pedidos o entregas **externos a ese seed** referencian documentos que se pretende eliminar. Si existen, responde `409 SEED_HAS_EXTERNAL_REFERENCES` y **no elimina el seed**.
5. Si no hay conflictos, elimina primero las entregas, después los pedidos, usuarios y productos del seed, todo dentro de `session.withTransaction()`.
La limpieza no elimina productos existentes reutilizados por el seed, ni documentos sin ese `seedId`. Los registros creados antes de implementar el campo `seedId` tampoco son alcanzados por esta operación.
**Seguridad:** `POST /api/mocks/seed` y `DELETE /api/mocks` son operaciones de desarrollo/pruebas. No deben exponerse en producción sin autenticación, autorización y restricciones de entorno.
### Verificación en MongoDB Atlas

En **Browse Collections**:
- `users`: verificar usuarios con roles `user` y `driver`, y su `seedId`.
- `products`: verificar `stock`, `status` y, si fueron creados por el seed, su `seedId`.
- `orders`: verificar referencias `user` y `products.product`, estados, prioridades, total, dirección y `seedId`.
- `deliveries`: verificar `order`, `driver`, estado, fechas y `seedId`.
Para verificar referencias externas, los campos referenciales deben almacenarse como **BSON ObjectId**, no como objetos JSON ordinarios con una propiedad `$oid`.
### Modelos involucrados

- **User:** nombre, apellido, email único, rol y `seedId` opcional. Los repartidores son usuarios con rol `driver`.
- **Product:** nombre, descripción, precio, stock, estado y `seedId` opcional.
- **Order:** referencia al usuario, productos con cantidades, estado, prioridad, total, dirección y `seedId` opcional.
- **Delivery:** referencia única a pedido, repartidor opcional, estado, fechas y `seedId` opcional.
## Constantes del dominio

Definidas en `src/constants/index.js` mediante `Object.freeze()`:
\| Constante | Valores |
\|---|---|
\| `USER_ROLES` | `admin`, `user`, `driver` |
\| `PRODUCT_STATUS` | `available`, `out_of_stock` |
\| `ORDER_STATUS` | `pending`, `confirmed`, `in_transit`, `delivered`, `cancelled` |
\| `ORDER_PRIORITY` | `low`, `medium`, `high` |
\| `DELIVERY_STATUS` | `pending`, `assigned`, `in_progress`, `completed`, `failed` |
Los modelos y el servicio de mocking reutilizan estas constantes para evitar valores de dominio escritos directamente en distintos archivos.
## Módulo 3 — Manejo profesional de errores

El módulo incorpora errores personalizados, un diccionario de códigos y un middleware global para responder de forma uniforme ante errores de validación, recursos inexistentes, conflictos y fallas inesperadas. Los Controllers delegan los errores mediante `next(error)`, mientras que los Services aplican las reglas de negocio y lanzan errores tipados.

### Clases de errores

Definidas en `src/errors/app.error.js`:

- `AppError`: clase base de los errores operacionales de la aplicación.
- `ValidationError`: datos de entrada inválidos (HTTP 400).
- `NotFoundError`: recursos inexistentes (HTTP 404).
- `ConflictError`: conflictos de integridad o negocio (HTTP 409).

El diccionario `src/constants/error-codes.js` centraliza códigos, mensajes y estados HTTP. `src/middlewares/notFound.middleware.js` transforma rutas desconocidas en errores 404, y `src/middlewares/error.middleware.js` procesa errores propios, JSON inválido y errores de Mongoose/MongoDB. Las fallas inesperadas se responden con HTTP 500 sin exponer detalles internos.

## Formato de respuestas y errores

### Respuestas exitosas

Los endpoints de usuarios, productos y mocking devuelven respuestas exitosas con la estructura:
```json

{

  "status": "success",

  "payload": {}

}

```
`payload` puede contener un objeto, un array o un resumen de inserción, según el endpoint. Los GET exitosos responden `200 OK`; las operaciones de creación y el seed responden `201 Created`.
### Respuestas de error

Los errores operacionales utilizan un formato consistente:
```json

{

  "status": "error",

  "code": "USER_NOT_FOUND",

  "message": "Usuario no encontrado"

}

```
Los códigos y mensajes de errores propios de la aplicación se centralizan en `src/constants/error-codes.js`. Las clases de error tipadas se definen en `src/errors/app.error.js` y el middleware global traduce los errores a respuestas HTTP JSON.
\| HTTP | Situación | Ejemplo de código |
\|---|---|---|
\| 400 Bad Request | Cantidad de mocks inválida | `INVALID_MOCK_QUANTITY` |
| 400 Bad Request | `seedId` ausente o inválido | `INVALID_SEED_ID` |
\| 400 Bad Request | JSON malformado | `INVALID_JSON` |
\| 400 Bad Request | Precio o stock inválido | `INVALID_PRODUCT_PRICE`, `INVALID_PRODUCT_STOCK` |
\| 400 Bad Request | Email o rol inválido | `USER_EMAIL_REQUIRED`, `INVALID_USER_ROLE` |
\| 404 Not Found | Ruta inexistente | `ROUTE_NOT_FOUND` |
\| 404 Not Found | Usuario o producto inexistente | `USER_NOT_FOUND`, `PRODUCT_NOT_FOUND` |
| 404 Not Found | Seed inexistente o ya eliminado | `SEED_NOT_FOUND` |
\| 409 Conflict | Email duplicado | `USER_EMAIL_ALREADY_EXISTS` |
| 409 Conflict | Referencias externas impiden borrar un seed | `SEED_HAS_EXTERNAL_REFERENCES` |
\| 500 Internal Server Error | Error inesperado del servidor | `INTERNAL_ERROR` |
Los errores de Mongoose, incluidos `CastError`, errores de validación y claves únicas duplicadas, también se procesan en el middleware global.
### Ejemplos de errores

**Ruta inexistente:**
```http

GET http://localhost:8080/api/noexiste

```
Respuesta `404 Not Found`:
```json

{

  "status": "error",

  "code": "ROUTE_NOT_FOUND",

  "message": "La ruta solicitada no existe"

}

```
**Cantidad inválida:**
```http

GET http://localhost:8080/api/mocks/users?qty=abc

```
Respuesta `400 Bad Request`:
```json

{

  "status": "error",

  "code": "INVALID_MOCK_QUANTITY",

  "message": "La cantidad debe ser un número entero entre 1 y 100"

}

```
**JSON malformado:** enviar un body como `{roto` con `Content-Type: application/json`. Respuesta `400 Bad Request`:
```json

{

  "status": "error",

  "code": "INVALID_JSON",

  "message": "El cuerpo de la petición contiene un JSON inválido"

}

```

## Pruebas manuales y casos sugeridos

Se verificaron manualmente en Postman casos de cantidades inválidas, errores de usuarios y productos, rutas inexistentes, JSON malformado y la inserción/eliminación de un seed de dos registros por entidad (ocho documentos insertados y ocho eliminados). Los siguientes casos conforman una lista de verificación; algunos requieren pruebas adicionales.
Utilizar Thunder Client o Postman y una base de datos de pruebas:

1. `GET /api/mocks/users?qty=3`: comprobar `200` y tres usuarios con rol `user`.
2. `GET /api/mocks/drivers?qty=3`: comprobar tres usuarios con rol `driver`.
3. `GET /api/mocks/orders?qty=3` y `GET /api/mocks/deliveries?qty=3`: verificar estados, prioridades y fechas.
4. `GET /api/mocks/dataset?qty=3`: comprobar relaciones, totales, stock y estados coherentes, sin persistencia.
5. Probar `qty=abc`, `qty=0`, `qty=-1`, `qty=1.5`, `qty=101` y `qty=`: comprobar `400 INVALID_MOCK_QUANTITY`.
6. `GET /api/noexiste`: comprobar `404 ROUTE_NOT_FOUND`.
7. Enviar JSON malformado con `Content-Type: application/json`: comprobar `400 INVALID_JSON`.
8. `GET /api/products` y `GET /api/users`: comprobar `200` y estructura `status` / `payload`.
9. `POST /api/mocks/seed?qty=2`: comprobar `201`, `seedId`, cantidades y referencias persistidas.
10. Probar el seed en una base sin productos disponibles: verificar creación transaccional de productos con stock positivo.
11. `DELETE /api/mocks?seedId=incorrecto`: comprobar `400 INVALID_SEED_ID`.
12. `DELETE /api/mocks?seedId=000000000000000000000000`: comprobar `404 SEED_NOT_FOUND`.
13. Crear una referencia externa de prueba a un usuario del seed, con tipo BSON `ObjectId`, y comprobar `409 SEED_HAS_EXTERNAL_REFERENCES`. Confirmar que el seed no fue eliminado.
14. Eliminar la referencia externa de prueba y repetir el DELETE: comprobar `200`, cantidades eliminadas y conservación de productos reutilizados.
15. Repetir el mismo DELETE: comprobar `404 SEED_NOT_FOUND`.

No utilizar documentos de producción para las pruebas de inserción, conflictos o limpieza.

## Seguridad y control de versiones

No subir al repositorio:

- `node_modules/`
- `.env`
- Credenciales, secretos o cadenas de conexión privadas

Mantener `.env.example` con valores de referencia sin secretos. Los endpoints de seed y limpieza están destinados al entorno de desarrollo y **no deben exponerse públicamente en producción sin controles de autenticación, autorización y restricciones de entorno**.

## Autor

Esteban Damian Oyarzun Romano
