import express from "express";
import mongoose from "mongoose";

import config from "./config/env.config.js";
import productsRouter from "./routes/products.router.js";
import usersRouter from "./routes/users.router.js";

const app = express();

// Middlewares
app.use(express.json());

// Routes
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);

// Conexión a MongoDB e inicio del servidor
const startServer = async () => {
  try {
    await mongoose.connect(config.mongodbUri);

    console.log("Conectado correctamente a MongoDB");

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