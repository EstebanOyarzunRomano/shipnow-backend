import dotenv from "dotenv";

dotenv.config();

const requiredEnvVars = ["PORT", "MONGODB_URI", "NODE_ENV"];

for (const variable of requiredEnvVars) {
  if (!process.env[variable]) {
    throw new Error(
      `Variable de entorno requerida no definida: ${variable}`
    );
  }
}

const port = Number(process.env.PORT);

if (!Number.isInteger(port) || port <= 0 || port > 65535) {
  throw new Error(
    "La variable de entorno PORT debe ser un número válido entre 1 y 65535"
  );
}

const config = Object.freeze({
  port,
  mongodbUri: process.env.MONGODB_URI,
  nodeEnv: process.env.NODE_ENV,
});

export default config;