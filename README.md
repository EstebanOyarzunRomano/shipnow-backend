# ShipNow Backend

API REST desarrollada con **Node.js, Express, MongoDB Atlas y Mongoose** para el proyecto ShipNow de Backend III.

El proyecto utiliza una **arquitectura por capas** y cuenta con gestión de usuarios y productos (Módulo 1), además de un sistema de **mocking y carga de datos de prueba** (Módulo 2) para usuarios, repartidores, pedidos y entregas.

## Tecnologías

- Node.js y Express
- MongoDB Atlas y Mongoose
- @faker-js/faker (datos simulados)
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

Los endpoints GET de mocking generan datos **en memoria** y no los insertan en la base. El endpoint de seed usa repositorios y una transacción para persistir datos relacionados.

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

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/products` | Listar productos; filtros opcionales `status` y `onlyAvailable` |
| GET | `/api/products/:id` | Obtener producto por ID |
| POST | `/api/products` | Crear producto con body JSON |
| PUT | `/api/products/:id` | Actualizar producto |
| DELETE | `/api/products/:id` | Eliminar producto |

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

| Método | Endpoint | Descripción |
|---|---|---|
| GET | `/api/users` | Listar usuarios; filtro opcional `role` |
| GET | `/api/users/:id` | Obtener usuario por ID |
| POST | `/api/users` | Crear usuario con body JSON |
| PUT | `/api/users/:id` | Actualizar usuario |
| DELETE | `/api/users/:id` | Eliminar usuario |

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

El router `/api/mocks` permite generar información ficticia con Faker, sin cargarla manualmente. La generación de datos y la persistencia se mantienen separadas por capas.

### Endpoints de mocking

| Método | Endpoint | Resultado | ¿Guarda en MongoDB? |
|---|---|---|---|
| GET | `/api/mocks/users?qty=3` | Usuarios con rol `user` | No |
| GET | `/api/mocks/drivers?qty=3` | Repartidores con rol `driver` | No |
| GET | `/api/mocks/orders?qty=3` | Pedidos con estados y prioridades válidos | No |
| GET | `/api/mocks/deliveries?qty=3` | Entregas con estados y fechas | No |
| GET | `/api/mocks/dataset?qty=3` | Conjunto relacionado de usuarios, repartidores, productos, pedidos y entregas | No |
| POST | `/api/mocks/seed?qty=3` | Inserta usuarios, repartidores, pedidos y entregas relacionados | **Sí** |

El parámetro `qty` es opcional (valor predeterminado: `10`) y acepta enteros entre **1 y 100**. Un valor fuera de ese rango produce HTTP `400` con código `INVALID_MOCK_QUANTITY`.

La cantidad indicada en `qty` se aplica a cada tipo de entidad generado; en el seed, `qty=2` crea dos usuarios comunes, dos repartidores, dos pedidos y dos entregas.

### Ejemplo: generar usuarios sin persistencia

```http
GET http://localhost:8080/api/mocks/users?qty=2
```

Ejemplo ilustrativo de respuesta `200 OK` (los valores cambian en cada ejecución):

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

### Ejemplo: dataset relacionado sin persistencia

```http
GET http://localhost:8080/api/mocks/dataset?qty=3
```

La respuesta tiene la estructura:

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

**Nota:** los arrays vacíos del ejemplo anterior representan la estructura de la respuesta; con `qty=3` contendrán tres elementos por colección.

En un mismo dataset:

- `orders[].user` corresponde al `_id` de un usuario de `users`.
- `orders[].products[].product` corresponde al `_id` de un producto de `products`.
- `deliveries[].order` corresponde al `_id` de un pedido de `orders`.
- `deliveries[].driver` corresponde al `_id` de un repartidor de `drivers`, con rol `driver`.
- El total de cada pedido se calcula según precio y cantidad del producto simulado.

**Nota:** los endpoints individuales `/orders` y `/deliveries` generan identificadores ficticios con formato MongoDB, pero no crean los documentos referenciados ni garantizan referencias compartidas entre peticiones independientes. Para verificar relaciones completas sin persistencia, utilizar `/dataset`.

### Carga de datos de prueba (seed)

**Advertencia:** este endpoint escribe documentos reales en MongoDB. Utilizar únicamente una base de desarrollo/pruebas y evitar ejecutar la petición repetidamente sin necesidad.

**Requisito previo:** debe existir al menos un producto en la colección `products`. El seed reutiliza productos existentes a través de `products.repository.js`, sin crear productos nuevos ni modificar el stock. Se trata de datos de prueba, no de una operación comercial de inventario.

En Thunder Client o Postman:

```http
POST http://localhost:8080/api/mocks/seed?qty=2
```

No requiere body JSON. Respuesta esperada `201 Created`:

```json
{
  "status": "success",
  "payload": {
    "message": "Datos de prueba insertados correctamente",
    "inserted": {
      "users": 2,
      "drivers": 2,
      "orders": 2,
      "deliveries": 2
    },
    "totalInserted": 8
  }
}
```

Con `qty=2` se insertan cuatro documentos en `users` (dos usuarios y dos repartidores), dos en `orders` y dos en `deliveries`: **ocho documentos en total**.

El servicio:

1. Valida `qty` y comprueba que existan productos mediante el repositorio.
2. Genera usuarios y repartidores con emails únicos entre ejecuciones.
3. Inserta usuarios y obtiene sus `_id` reales.
4. Genera pedidos asociados a usuarios y productos existentes, calculando el total a partir del precio del producto.
5. Genera entregas asociadas a pedidos insertados y a usuarios con rol `driver`.
6. Ejecuta las inserciones mediante `session.withTransaction()` y devuelve el resumen al confirmarse.

La transacción requiere una implementación de MongoDB compatible, como un clúster de Atlas respaldado por un replica set. Si falla una operación dentro de la transacción, se revierten las inserciones de esa transacción.

### Verificación del seed en MongoDB Atlas

Abrir **Browse Collections** en Atlas y revisar:

- `users`: nuevos usuarios con rol `user` y `driver`.
- `orders`: referencias `user` y `products.product`, además de `status`, `priority`, `total` y `deliveryAddress`.
- `deliveries`: referencias `order` y `driver`, estado y fechas.

Para comprobar integridad referencial, buscar el `_id` de un repartidor en `users` y verificar que su rol sea `driver`; buscar también el `_id` de un pedido referenciado en `deliveries`.

### Modelos involucrados

- **User:** nombre, apellido, email único y rol. Los repartidores son usuarios con rol `driver`.
- **Product:** nombre, descripción, precio, stock y estado.
- **Order:** referencia a usuario, productos con cantidades, estado, prioridad, total y dirección.
- **Delivery:** referencia única a pedido, referencia opcional a repartidor, estado y fechas de asignación/finalización.

## Constantes del dominio

Definidas en `src/constants/index.js` mediante `Object.freeze()`:

| Constante | Valores |
|---|---|
| `USER_ROLES` | `admin`, `user`, `driver` |
| `PRODUCT_STATUS` | `available`, `out_of_stock` |
| `ORDER_STATUS` | `pending`, `confirmed`, `in_transit`, `delivered`, `cancelled` |
| `ORDER_PRIORITY` | `low`, `medium`, `high` |
| `DELIVERY_STATUS` | `pending`, `assigned`, `in_progress`, `completed`, `failed` |

Los modelos y el servicio de mocking reutilizan estas constantes para evitar valores de dominio escritos directamente en distintos archivos.

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

| HTTP | Situación | Ejemplo de código |
|---|---|---|
| 400 Bad Request | Cantidad de mocks inválida | `INVALID_MOCK_QUANTITY` |
| 400 Bad Request | JSON malformado | `INVALID_JSON` |
| 400 Bad Request | Precio o stock inválido | `INVALID_PRODUCT_PRICE`, `INVALID_PRODUCT_STOCK` |
| 400 Bad Request | Email o rol inválido | `USER_EMAIL_REQUIRED`, `INVALID_USER_ROLE` |
| 404 Not Found | Ruta inexistente | `ROUTE_NOT_FOUND` |
| 404 Not Found | Usuario o producto inexistente | `USER_NOT_FOUND`, `PRODUCT_NOT_FOUND` |
| 409 Conflict | Email duplicado | `USER_EMAIL_ALREADY_EXISTS` |
| 500 Internal Server Error | Error inesperado del servidor | Código según el middleware global |

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

## Pruebas sugeridas

Utilizar Thunder Client o Postman:

1. Ejecutar `GET /api/mocks/users?qty=3` y comprobar `200`, `status: "success"` y tres usuarios con rol `user` dentro de `payload`.
2. Ejecutar `GET /api/mocks/drivers?qty=3` y comprobar tres repartidores con rol `driver`.
3. Ejecutar `GET /api/mocks/orders?qty=3` y verificar estados y prioridades válidos.
4. Ejecutar `GET /api/mocks/deliveries?qty=3` y verificar estados y fechas.
5. Ejecutar `GET /api/mocks/dataset?qty=3` y comprobar coincidencias de identificadores entre entidades.
6. Probar `GET /api/mocks/users?qty=abc`, `qty=0`, `qty=-1`, `qty=1.5`, `qty=101` y `qty=`; todos deben responder `400` con `INVALID_MOCK_QUANTITY`.
7. Probar `GET /api/noexiste`; debe devolver `404` y `ROUTE_NOT_FOUND` en JSON.
8. Enviar un JSON malformado con encabezado `Content-Type: application/json`; debe devolver `400` y `INVALID_JSON`.
9. Probar `GET /api/products` y `GET /api/users`; ambos deben devolver `200` con `status` y `payload`.
10. En una base de **pruebas**, con al menos un producto creado, ejecutar `POST /api/mocks/seed?qty=2`; verificar `201`, `status: "success"` y el resumen en `payload`.
11. Revisar las colecciones en Atlas y verificar las referencias entre documentos insertados.

## Seguridad y control de versiones

No subir al repositorio:

- `node_modules/`
- `.env`
- Credenciales, secretos o cadenas de conexión privadas

Mantener `.env.example` con valores de referencia sin secretos. El endpoint de seed está destinado al entorno de desarrollo y **no debe exponerse públicamente en producción sin controles de acceso y restricciones de entorno**.

## Autor

Esteban Damian Oyarzun Romano
