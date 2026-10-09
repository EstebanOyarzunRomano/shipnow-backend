
import mongoose from "mongoose";
import config from "./env.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    console.log(
      "Base de datos activa:",
      mongoose.connection.name
    );

    console.log("Conectado correctamente a MongoDB");

    console.log(
      "Base de datos activa:",
      mongoose.connection.name
    );
  } catch (error) {
    console.error(
      "Error al conectar con MongoDB:",
      error.message
    );

    throw error;
  }
};

export default connectDB;