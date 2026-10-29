import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, test, expect } from "@jest/globals";
import logger from "../src/config/logger.js";

// Obtener la raíz del proyecto
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logsDir = path.resolve(__dirname, "../logs");

// Esperar hasta que Winston termine de escribir
const waitForLog = async (filePath, message) => {
  const timeout = Date.now() + 5000;

  while (Date.now() < timeout) {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, "utf8");

      if (content.includes(message)) {
        return true;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return false;
};

describe("Logger - Persistencia de errores", () => {
  test("logger.error debe generar un archivo de errores", async () => {
    const date = new Date().toLocaleDateString("en-CA");
    const logFile = path.join(logsDir, `error-${date}.log`);

    // Mensaje único para evitar falsos positivos
    const message = `TEST_LOG_ERROR_${Date.now()}_${process.pid}`;

    // Generar el error de prueba
    logger.error(message);

    // Esperar la escritura en disco
    const logSaved = await waitForLog(logFile, message);

    expect(logSaved).toBe(true);
  }, 10000);
});