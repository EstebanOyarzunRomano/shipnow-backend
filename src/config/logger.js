
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Directorio raíz del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "../..");

// Carpeta donde se almacenan los logs
const logsDir = path.join(rootDir, "logs");

// Crear la carpeta si no existe
fs.mkdirSync(logsDir, { recursive: true });

// Niveles personalizados de logging
const levels = {
  fatal: 0,
  error: 1,
  warning: 2,
  info: 3,
  http: 4,
  debug: 5,
};

// Colores para la consola
winston.addColors({
  fatal: "magenta",
  error: "red",
  warning: "yellow",
  info: "green",
  http: "cyan",
  debug: "blue",
});

// Determinar el entorno
const isProduction = process.env.NODE_ENV === "production";

// Formato común de mensajes
const logFormat = winston.format.printf(
  ({ timestamp, level, message, stack }) => {
    return `${timestamp} [${level}] ${stack || message}`;
  }
);

// Formato para archivos
const fileFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  logFormat
);

// Formato para consola
const consoleFormat = winston.format.combine(
  winston.format.timestamp({
    format: "YYYY-MM-DD HH:mm:ss",
  }),
  winston.format.errors({ stack: true }),
  winston.format.colorize({ level: true }),
  logFormat
);

// Transporte para errores y fallas críticas
const errorFileTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: "error-%DATE%.log",
  datePattern: "YYYY-MM-DD",
  level: "error",
  maxSize: "10m",
  maxFiles: "14d",
  format: fileFormat,
});

// Logger centralizado
const logger = winston.createLogger({
  levels,
  level: isProduction ? "info" : "debug",
  transports: [
    // Registros en consola
    new winston.transports.Console({
      level: isProduction ? "info" : "debug",
      format: consoleFormat,
    }),

    // Persistencia de errores con rotación
    errorFileTransport,
  ],
});

export default logger;