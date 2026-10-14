
import mocksService from "../services/mocks.service.js";
import { ValidationError } from "../errors/app.error.js";
import { ERROR_CODES } from "../constants/error-codes.js";

class MocksController {
  // Validar cantidad de registros solicitados
  getQuantity(req) {
    const qty = req.query.qty ?? 10;

    if (
      String(qty).trim() === "" ||
      !Number.isInteger(Number(qty)) ||
      Number(qty) < 1 ||
      Number(qty) > 100
    ) {
      const error = ERROR_CODES.INVALID_MOCK_QUANTITY;

      throw new ValidationError(
        error.message,
        error.code
      );
    }

    return Number(qty);
  }

  // Generar usuarios simulados
  getUsers(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const users = mocksService.generateUsers(qty);

      res.status(200).json({
        status: "success",
        payload: users,
      });
    } catch (error) {
      next(error);
    }
  }

  // Generar repartidores simulados
  getDrivers(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const drivers = mocksService.generateDrivers(qty);

      res.status(200).json({
        status: "success",
        payload: drivers,
      });
    } catch (error) {
      next(error);
    }
  }

  // Generar pedidos simulados
  getOrders(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const orders = mocksService.generateOrders(qty);

      res.status(200).json({
        status: "success",
        payload: orders,
      });
    } catch (error) {
      next(error);
    }
  }

  // Generar entregas simuladas
  getDeliveries(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const deliveries = mocksService.generateDeliveries(qty);

      res.status(200).json({
        status: "success",
        payload: deliveries,
      });
    } catch (error) {
      next(error);
    }
  }

  // Generar conjunto de datos relacionados
  getDataset(req, res, next) {
    try {
      const qty = this.getQuantity(req);

      const dataset = mocksService.generateMockDataset(qty);

      res.status(200).json({
        status: "success",
        payload: {
          message: "Datos simulados generados correctamente",
          quantity: qty,
          data: dataset,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // Insertar datos de prueba en MongoDB
  async seed(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const result = await mocksService.seed(qty);

      res.status(201).json({
        status: "success",
        payload: result,
      });
    } catch (error) {
      next(error);
    }
  }
}

const mocksController = new MocksController();

export default mocksController;