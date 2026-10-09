import app from "./app.js";
import config from "./config/env.config.js";
import connectDB from "./config/db.js";

const startServer = async () => {
  try {
    // Conectar con MongoDB antes de iniciar el servidor
    await connectDB();

    // Iniciar el servidor HTTP
    app.listen(config.port, () => {
      console.log(
        `Servidor ShipNow ejecutándose en http://localhost:${config.port}`
      );
    });
  } catch (error) {
    console.error("Error al iniciar ShipNow:", error.message);
    process.exit(1);
  }
};

startServer();