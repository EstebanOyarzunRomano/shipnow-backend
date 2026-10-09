
import { Router } from "express";
import mocksController from "../controllers/mocks.controller.js";

const router = Router();

// Generar datos simulados sin guardar en MongoDB
router.get(
  "/users",
  mocksController.getUsers.bind(mocksController)
);

router.get(
  "/drivers",
  mocksController.getDrivers.bind(mocksController)
);

router.get(
  "/orders",
  mocksController.getOrders.bind(mocksController)
);

router.get(
  "/deliveries",
  mocksController.getDeliveries.bind(mocksController)
);

router.get(
  "/dataset",
  mocksController.getDataset.bind(mocksController)
);

// Insertar datos de prueba en MongoDB
router.post(
  "/seed",
  mocksController.seed.bind(mocksController)
);

export default router;