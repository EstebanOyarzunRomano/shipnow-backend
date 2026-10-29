import express from "express";
import swaggerUi from "swagger-ui-express";

import productsRouter from "./routes/products.router.js";
import usersRouter from "./routes/users.router.js";
import mocksRouter from "./routes/mocks.router.js";
import loggerRouter from "./routes/logger.router.js";

import swaggerSpec from "./config/swagger.js";

import notFoundMiddleware from "./middlewares/notFound.middleware.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// Documentación interactiva de la API
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rutas de la API
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/mocks", mocksRouter);

// Endpoint de prueba disponible únicamente en desarrollo
if (process.env.NODE_ENV !== "production") {
  app.use("/api", loggerRouter);
}

// Middleware para rutas inexistentes
app.use(notFoundMiddleware);

// Middleware global de errores
app.use(errorMiddleware);

export default app;