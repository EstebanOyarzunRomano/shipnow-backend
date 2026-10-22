
import { AppError } from "../errors/app.error.js";
import { ERROR_CODES } from "../constants/error-codes.js";
import logger from "../config/logger.js";

const errorMiddleware = (err, req, res, next) => {
  // Información básica de la petición
  const requestInfo = `${req.method} ${req.originalUrl}`;

  // 1. Errores personalizados de la aplicación
  if (err instanceof AppError) {
    const logMessage = `[${err.code}] ${err.message} - ${requestInfo}`;

    // Clasificar según el código HTTP
    if (err.statusCode >= 500) {
      logger.error(
        `${logMessage} - ${err.stack || "Sin stack disponible"}`
      );
    } else {
      logger.warning(logMessage);
    }

    return res.status(err.statusCode).json({
      status: "error",
      code: err.code,
      message: err.message,
    });
  }

  // 2. JSON malformado
  if (err.type === "entity.parse.failed") {
    const error = ERROR_CODES.INVALID_JSON;

    logger.warning(
      `[${error.code}] JSON malformado - ${requestInfo}`
    );

    return res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
    });
  }

  // 3. Identificador inválido de MongoDB
  if (err.name === "CastError") {
    const error = ERROR_CODES.INVALID_IDENTIFIER;

    logger.warning(
      `[${error.code}] Identificador inválido - ${requestInfo}`
    );

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

    logger.warning(
      `[${error.code}] Error de validación - ${requestInfo}: ${messages.join(", ")}`
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

    logger.warning(
      `[${error.code}] Recurso duplicado - ${requestInfo}`
    );

    return res.status(error.statusCode).json({
      status: "error",
      code: error.code,
      message: error.message,
    });
  }

  // 6. Errores inesperados del servidor
  logger.error(
    `Error inesperado en ${requestInfo}: ${err.stack || err.message || String(err)}`
  );

  const error = ERROR_CODES.INTERNAL_ERROR;

  return res.status(error.statusCode).json({
    status: "error",
    code: error.code,
    message: error.message,
  });
};

export default errorMiddleware;