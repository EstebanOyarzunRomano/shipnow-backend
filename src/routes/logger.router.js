import { Router } from "express";
import logger from "../config/logger.js";

const router = Router();

// Endpoint interno para probar todos los niveles del logger
router.get("/logger-test", (req, res) => {
  logger.debug("Logger test: mensaje de depuración");
  logger.http("Logger test: evento HTTP");
  logger.info("Logger test: mensaje informativo");
  logger.warning("Logger test: mensaje de advertencia");
  logger.error("Logger test: error de prueba");
  logger.fatal("Logger test: falla crítica simulada");

  res.status(200).json({
    status: "success",
    message: "Prueba del logger ejecutada correctamente",
    levels: [
      "debug",
      "http",
      "info",
      "warning",
      "error",
      "fatal",
    ],
  });
});

export default router;