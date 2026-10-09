import mongoose from "mongoose";
import { faker } from "@faker-js/faker";

import {
  USER_ROLES,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
} from "../constants/index.js";

import userRepository from "../repositories/users.repository.js";
import orderRepository from "../repositories/orders.repository.js";
import deliveryRepository from "../repositories/deliveries.repository.js";

import Product from "../models/product.model.js";
import { ValidationError } from "../errors/app.error.js";

class MocksService {
  // Generar un usuario ficticio
  generateUser(role = USER_ROLES.USER) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();

    return {
      firstName,
      lastName,
      email: faker.internet.email({
        firstName,
        lastName,
        provider: "example.com",
      }).toLowerCase(),
      role,
    };
  }

  // Generar usuarios comunes
  generateUsers(qty = 10) {
    return Array.from({ length: qty }, () =>
      this.generateUser(USER_ROLES.USER)
    );
  }

  // Generar repartidores
  generateDrivers(qty = 10) {
    return Array.from({ length: qty }, () =>
      this.generateUser(USER_ROLES.DRIVER)
    );
  }

  // Generar un pedido ficticio
  generateOrder(userId, productId) {
    const quantity = faker.number.int({
      min: 1,
      max: 5,
    });

    const price = faker.number.int({
      min: 1000,
      max: 20000,
    });

    return {
      user: userId,

      products: [
        {
          product: productId,
          quantity,
        },
      ],

      status: faker.helpers.arrayElement(
        Object.values(ORDER_STATUS)
      ),

      priority: faker.helpers.arrayElement(
        Object.values(ORDER_PRIORITY)
      ),

      total: quantity * price,

      deliveryAddress: faker.location.streetAddress(),
    };
  }

  // Generar pedidos simulados
  generateOrders(qty = 10) {
    return Array.from({ length: qty }, () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      return this.generateOrder(userId, productId);
    });
  }

  // Generar una entrega ficticia
  generateDelivery(orderId, driverId = null) {
    const status = driverId
      ? faker.helpers.arrayElement([
          DELIVERY_STATUS.ASSIGNED,
          DELIVERY_STATUS.IN_PROGRESS,
          DELIVERY_STATUS.COMPLETED,
          DELIVERY_STATUS.FAILED,
        ])
      : DELIVERY_STATUS.PENDING;

    const assignedAt = driverId ? new Date() : null;

    return {
      order: orderId,
      driver: driverId,
      status,
      assignedAt,
      deliveredAt:
        status === DELIVERY_STATUS.COMPLETED
          ? new Date()
          : null,
    };
  }

  // Generar entregas simuladas
  generateDeliveries(qty = 10) {
    return Array.from({ length: qty }, () => {
      const orderId = new mongoose.Types.ObjectId();

      const hasDriver = faker.datatype.boolean();

      const driverId = hasDriver
        ? new mongoose.Types.ObjectId()
        : null;

      return this.generateDelivery(orderId, driverId);
    });
  }

  // Generar un conjunto de datos relacionados
  generateMockDataset(qty = 10) {
    const users = this.generateUsers(qty).map((user) => ({
      _id: new mongoose.Types.ObjectId(),
      ...user,
    }));

    const drivers = this.generateDrivers(qty).map(
      (driver) => ({
        _id: new mongoose.Types.ObjectId(),
        ...driver,
      })
    );

    const products = Array.from(
      { length: qty },
      () => ({
        _id: new mongoose.Types.ObjectId(),
        name: faker.commerce.productName(),
        price: faker.number.int({
          min: 1000,
          max: 20000,
        }),
      })
    );

    const orders = Array.from({ length: qty }, () => {
      const user = faker.helpers.arrayElement(users);
      const product = faker.helpers.arrayElement(products);

      const order = this.generateOrder(
        user._id,
        product._id
      );

      return {
        _id: new mongoose.Types.ObjectId(),
        ...order,
        total: order.products[0].quantity * product.price,
      };
    });

    const deliveries = orders.map((order) => {
      const driver = faker.helpers.arrayElement(drivers);

      return {
        _id: new mongoose.Types.ObjectId(),
        ...this.generateDelivery(order._id, driver._id),
      };
    });

    return {
      users,
      drivers,
      products,
      orders,
      deliveries,
    };
  }

  // Insertar datos de prueba en MongoDB
  async seed(qty = 10) {
    const quantity = Number(qty);

    if (
      !Number.isInteger(quantity) ||
      quantity < 1 ||
      quantity > 100
    ) {
      throw new ValidationError(
        "La cantidad debe ser un entero entre 1 y 100"
      );
    }

    // Verificar productos existentes
    const products = await Product.find().lean();

    if (products.length === 0) {
      throw new ValidationError(
        "Debe existir al menos un producto para generar pedidos"
      );
    }

    // Generar usuarios y repartidores
    const usersData = this.generateUsers(quantity);
    const driversData = this.generateDrivers(quantity);

    // Evitar emails duplicados entre ejecuciones
    const uniqueSuffix =
      new mongoose.Types.ObjectId().toString();

    const allUsersData = [
      ...usersData,
      ...driversData,
    ].map((user, index) => ({
      ...user,
      email: `mock.${uniqueSuffix}.${index}@example.com`,
    }));

    // Iniciar sesión de MongoDB
    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(
        async () => {
          // 1. Insertar usuarios y repartidores
          const createdUsers =
            await userRepository.createMany(
              allUsersData,
              session
            );

          const users = createdUsers.filter(
            (user) => user.role === USER_ROLES.USER
          );

          const drivers = createdUsers.filter(
            (user) => user.role === USER_ROLES.DRIVER
          );

          // 2. Generar pedidos relacionados
          const ordersData = Array.from(
            { length: quantity },
            () => {
              const user =
                faker.helpers.arrayElement(users);

              const product =
                faker.helpers.arrayElement(products);

              const order = this.generateOrder(
                user._id,
                product._id
              );

              return {
                ...order,
                total:
                  order.products[0].quantity *
                  product.price,
              };
            }
          );

          const createdOrders =
            await orderRepository.createMany(
              ordersData,
              session
            );

          // 3. Generar entregas relacionadas
          const deliveriesData = createdOrders.map(
            (order) => {
              const driver =
                faker.helpers.arrayElement(drivers);

              return this.generateDelivery(
                order._id,
                driver._id
              );
            }
          );

          const createdDeliveries =
            await deliveryRepository.createMany(
              deliveriesData,
              session
            );

          // 4. Resumen de registros insertados
          return {
            message:
              "Datos de prueba insertados correctamente",

            inserted: {
              users: users.length,
              drivers: drivers.length,
              orders: createdOrders.length,
              deliveries: createdDeliveries.length,
            },

            totalInserted:
              createdUsers.length +
              createdOrders.length +
              createdDeliveries.length,
          };
        }
      );

      return result;
    } finally {
      await session.endSession();
    }
  }
}

const mocksService = new MocksService();

export default mocksService;