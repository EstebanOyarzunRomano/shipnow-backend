import mocksService from "../services/mocks.service.js";
import asyncHandler from "../middlewares/asyncHandler.js";

class MocksController {
  // Obtener cantidad de registros solicitados
  getQuantity(req) {
    return req.query.qty ?? 10;
  }

  // Generar usuarios simulados
  getUsers = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const users = mocksService.generateUsers(qty);

    res.status(200).json({
      status: "success",
      payload: users,
    });
  });

  // Generar repartidores simulados
  getDrivers = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const drivers = mocksService.generateDrivers(qty);

    res.status(200).json({
      status: "success",
      payload: drivers,
    });
  });

  // Generar pedidos simulados
  getOrders = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const orders = mocksService.generateOrders(qty);

    res.status(200).json({
      status: "success",
      payload: orders,
    });
  });

  // Generar entregas simuladas
  getDeliveries = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const deliveries = mocksService.generateDeliveries(qty);

    res.status(200).json({
      status: "success",
      payload: deliveries,
    });
  });

  // Generar conjunto de datos relacionados
  getDataset = asyncHandler(async (req, res) => {
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
  });

  // Insertar datos de prueba en MongoDB
  seed = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const result = await mocksService.seed(qty);

    res.status(201).json({
      status: "success",
      payload: result,
    });
  });

  // Eliminar registros generados por una ejecución del seed
  deleteSeed = asyncHandler(async (req, res) => {
    const { seedId } = req.query;

    const result = await mocksService.deleteSeed(seedId);

    res.status(200).json({
      status: "success",
      payload: result,
    });
  });
}

const mocksController = new MocksController();

export default mocksController;