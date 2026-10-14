
import { AppError } from "../errors/app.error.js";
import { ERROR_CODES } from "../constants/error-codes.js";

const errorMiddleware = (err, req, res, next) => {
  // 1. Errores personalizados de la aplicación
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
    });
  }

  // 2. JSON malformado
  if (err.type === "entity.parse.failed") {
    const error = ERROR_CODES.INVALID_JSON;

    return res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
    });
  }

  // 3. Identificador inválido de MongoDB
  if (err.name === "CastError") {
    const error = ERROR_CODES.INVALID_IDENTIFIER;

    return res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
    });
  }

  // 4. Error de validación de Mongoose
  if (err.name === "ValidationError") {
    const error = ERROR_CODES.INVALID_DATA;

    const messages = Object.values(err.errors || {}).map(
      (item) => item.message
    );

    return res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: messages.join(", ") || error.message,
    });
  }

  // 5. Clave duplicada en MongoDB
  if (err.code === 11000) {
    const error = ERROR_CODES.DUPLICATE_RESOURCE;

    return res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
    });
  }

  // 6. Errores inesperados
  console.error("Error inesperado:", err);

  const error = ERROR_CODES.INTERNAL_ERROR;

  return res.status(error.statusCode).json({
    status: "error",
    code: error.code,
    message: error.message,
  });
};

export default errorMiddleware;