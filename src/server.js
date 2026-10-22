
import "dotenv/config";

import app from "./app.js";
import config from "./config/env.config.js";
import connectDB from "./config/db.js";
import logger from "./config/logger.js";

const startServer = async () => {
  try {
    // Conectar con MongoDB antes de iniciar el servidor
    await connectDB();

    // Iniciar el servidor HTTP
    const server = app.listen(config.port, () => {
      logger.info(
        `Servidor ShipNow ejecutándose en http://localhost:${config.port}`
      );
    });

    // Registrar errores del servidor HTTP
    server.on("error", (error) => {
      logger.fatal(
        `Error del servidor HTTP: ${error.stack || error.message}`
      );

      process.exit(1);
    });

  } catch (error) {
    // Registrar fallas críticas durante el arranque
    logger.fatal(
      `Error crítico al iniciar ShipNow: ${error.stack || error.message}`
    );

    process.exit(1);
  }
};

startServer();