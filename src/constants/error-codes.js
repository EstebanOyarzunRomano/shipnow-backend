
export const ERROR_CODES = Object.freeze({
  INVALID_MOCK_QUANTITY: Object.freeze({
    code: "INVALID_MOCK_QUANTITY",
    message: "La cantidad debe ser un número entero entre 1 y 100",
    statusCode: 400,
  }),

  PRODUCTS_REQUIRED: Object.freeze({
    code: "PRODUCTS_REQUIRED",
    message: "Debe existir al menos un producto para generar pedidos",
    statusCode: 400,
  }),

  ROUTE_NOT_FOUND: Object.freeze({
    code: "ROUTE_NOT_FOUND",
    message: "La ruta solicitada no existe",
    statusCode: 404,
  }),

  RESOURCE_NOT_FOUND: Object.freeze({
    code: "RESOURCE_NOT_FOUND",
    message: "El recurso solicitado no existe",
    statusCode: 404,
  }),

  DUPLICATE_RESOURCE: Object.freeze({
    code: "DUPLICATE_RESOURCE",
    message: "Ya existe un registro con esos datos únicos",
    statusCode: 409,
  }),

  INVALID_IDENTIFIER: Object.freeze({
    code: "INVALID_IDENTIFIER",
    message: "Identificador o valor inválido",
    statusCode: 400,
  }),

  INVALID_DATA: Object.freeze({
    code: "INVALID_DATA",
    message: "Datos inválidos",
    statusCode: 400,
  }),

  INVALID_JSON: Object.freeze({
    code: "INVALID_JSON",
    message: "El cuerpo de la petición contiene un JSON inválido",
    statusCode: 400,
  }),

  INTERNAL_ERROR: Object.freeze({
    code: "INTERNAL_ERROR",
    message: "Error interno del servidor",
    statusCode: 500,
  }),

  PRODUCT_NOT_FOUND: Object.freeze({
    code: "PRODUCT_NOT_FOUND",
    message: "Producto no encontrado",
    statusCode: 404,
  }),

  INVALID_PRODUCT_PRICE: Object.freeze({
    code: "INVALID_PRODUCT_PRICE",
    message: "El precio debe ser un número mayor o igual a cero",
    statusCode: 400,
  }),

  INVALID_PRODUCT_STOCK: Object.freeze({
    code: "INVALID_PRODUCT_STOCK",
    message: "El stock debe ser un número entero mayor o igual a cero",
    statusCode: 400,
  }),
  USER_NOT_FOUND: Object.freeze({
  code: "USER_NOT_FOUND",
  message: "Usuario no encontrado",
  statusCode: 404,
  }),

  USER_EMAIL_REQUIRED: Object.freeze({
    code: "USER_EMAIL_REQUIRED",
    message: "El email es obligatorio",
    statusCode: 400,
  }),

  INVALID_USER_ROLE: Object.freeze({
    code: "INVALID_USER_ROLE",
    message: "Rol de usuario inválido",
    statusCode: 400,
  }),

  USER_EMAIL_ALREADY_EXISTS: Object.freeze({
    code: "USER_EMAIL_ALREADY_EXISTS",
    message: "Ya existe un usuario con ese email",
    statusCode: 409,
  }),

  USER_EMAIL_EMPTY: Object.freeze({
    code: "USER_EMAIL_EMPTY",
    message: "El email no puede estar vacío",
    statusCode: 400,
  }),
});