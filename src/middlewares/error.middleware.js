
import { AppError } from "../errors/app.error.js";

const errorMiddleware = (err, req, res, next) => {
  // 1. Errores personalizados de nuestra aplicación
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  // 2. Identificador inválido de MongoDB
  if (err.name === "CastError") {
    return res.status(400).json({
      status: "error",
      message: "Identificador o valor inválido",
    });
  }

  // 3. Error de validación del esquema de Mongoose
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors || {}).map(
      (error) => error.message
    );

    return res.status(400).json({
      status: "error",
      message: messages.join(", ") || "Datos inválidos",
    });
  }

  // 4. Error de clave única duplicada en MongoDB
  if (err.code === 11000) {
    return res.status(409).json({
      status: "error",
      message: "Ya existe un registro con esos datos únicos",
    });
  }

  // 5. Errores inesperados
  console.error("Error inesperado:", err);

  return res.status(500).json({
    status: "error",
    message: "Error interno del servidor",
  });
};

export default errorMiddleware;