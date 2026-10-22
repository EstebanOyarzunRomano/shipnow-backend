import mocksService from "../services/mocks.service.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import logger from "../config/logger.js";

class MocksController {
  // Obtener cantidad de registros solicitados
  getQuantity(req) {
    return req.query.qty ?? 10;
  }

  // Generar usuarios simulados
  getUsers = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const users = mocksService.generateUsers(qty);

    logger.info(`Mocks: ${users.length} usuarios generados correctamente`);

    res.status(200).json({
      status: "success",
      payload: users,
    });
  });

  // Generar repartidores simulados
  getDrivers = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const drivers = mocksService.generateDrivers(qty);

    logger.info(`Mocks: ${drivers.length} repartidores generados correctamente`);

    res.status(200).json({
      status: "success",
      payload: drivers,
    });
  });

  // Generar pedidos simulados
  getOrders = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const orders = mocksService.generateOrders(qty);

    logger.info(`Mocks: ${orders.length} pedidos generados correctamente`);

    res.status(200).json({
      status: "success",
      payload: orders,
    });
  });

  // Generar entregas simuladas
  getDeliveries = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const deliveries = mocksService.generateDeliveries(qty);

    logger.info(`Mocks: ${deliveries.length} entregas generadas correctamente`);

    res.status(200).json({
      status: "success",
      payload: deliveries,
    });
  });

  // Generar conjunto de datos relacionados
  getDataset = asyncHandler(async (req, res) => {
    const qty = this.getQuantity(req);
    const dataset = mocksService.generateMockDataset(qty);

    logger.info(`Mocks: dataset generado correctamente - Cantidad solicitada: ${qty}`);

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

    logger.debug(`Mocks: iniciando seed - Cantidad solicitada: ${qty}`);

    const result = await mocksService.seed(qty);

    logger.info(
      `Mocks: seed completado - seedId: ${result.seedId} - ` +
      `Usuarios: ${result.inserted.users}, ` +
      `Repartidores: ${result.inserted.drivers}, ` +
      `Pedidos: ${result.inserted.orders}, ` +
      `Entregas: ${result.inserted.deliveries}, ` +
      `Productos: ${result.inserted.products}, ` +
      `Total insertado: ${result.totalInserted}`
    );

    res.status(201).json({
      status: "success",
      payload: result,
    });
  });

  // Eliminar registros generados por una ejecución del seed
  deleteSeed = asyncHandler(async (req, res) => {
    const { seedId } = req.query;

    const result = await mocksService.deleteSeed(seedId);

    logger.info(
      `Mocks: seed eliminado - seedId: ${result.seedId} - Total eliminado: ${result.totalDeleted}`
    );

    res.status(200).json({
      status: "success",
      payload: result,
    });
  });
}

const mocksController = new MocksController();

export default mocksController;