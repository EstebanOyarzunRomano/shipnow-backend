import mongoose from "mongoose";
import config from "./env.config.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);

    console.log("Conectado correctamente a MongoDB");
  } catch (error) {
    console.error("Error al conectar con MongoDB:", error.message);
    throw error;
  }
};

export default connectDB;