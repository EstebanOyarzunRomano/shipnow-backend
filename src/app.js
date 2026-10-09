
import express from "express";

import productsRouter from "./routes/products.router.js";
import usersRouter from "./routes/users.router.js";
import mocksRouter from "./routes/mocks.router.js";

import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

// Middleware para interpretar JSON
app.use(express.json());

// Rutas de la API
app.use("/api/products", productsRouter);
app.use("/api/users", usersRouter);
app.use("/api/mocks", mocksRouter);

// Middleware global de errores
app.use(errorMiddleware);

export default app;