import mongoose from "mongoose";
import config from "./env.config.js";
import logger from "./logger.js";

const connectDB = async () => {
  try {
    // Establecer conexión con MongoDB
    await mongoose.connect(config.mongodbUri);

    // Registrar conexión exitosa y base de datos activa
    logger.info(
      `MongoDB conectado correctamente - Base de datos: ${mongoose.connection.name}`
    );

  } catch (error) {
    // Registrar el error de conexión
    logger.error(
      `Error al conectar con MongoDB: ${error.stack || error.message}`
    );

    // Propagar el error para impedir el inicio del servidor
    throw error;
  }
};

export default connectDB;