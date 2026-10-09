
import mocksService from "../services/mocks.service.js";
import { ValidationError } from "../errors/app.error.js";

class MocksController {
  getQuantity(req) {
    const qty = req.query.qty ?? 10;

    if (
      String(qty).trim() === "" ||
      !Number.isInteger(Number(qty)) ||
      Number(qty) < 1 ||
      Number(qty) > 100
    ) {
      throw new ValidationError(
        "La cantidad debe ser un número entero entre 1 y 100"
      );
    }

    return Number(qty);
  }

  getUsers(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const users = mocksService.generateUsers(qty);

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }

  getDrivers(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const drivers = mocksService.generateDrivers(qty);

      res.status(200).json(drivers);
    } catch (error) {
      next(error);
    }
  }

  getOrders(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const orders = mocksService.generateOrders(qty);

      res.status(200).json(orders);
    } catch (error) {
      next(error);
    }
  }

  getDeliveries(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const deliveries = mocksService.generateDeliveries(qty);

      res.status(200).json(deliveries);
    } catch (error) {
      next(error);
    }
  }

  getDataset(req, res, next) {
    try {
      const qty = this.getQuantity(req);

      const dataset = mocksService.generateMockDataset(qty);

      res.status(200).json({
        message: "Datos simulados generados correctamente",
        quantity: qty,
        data: dataset,
      });
    } catch (error) {
      next(error);
    }
  }

  async seed(req, res, next) {
    try {
      const qty = this.getQuantity(req);
      const result = await mocksService.seed(qty);

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
}

const mocksController = new MocksController();

export default mocksController;