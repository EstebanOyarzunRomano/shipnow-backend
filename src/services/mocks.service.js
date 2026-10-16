
import mongoose from "mongoose";
import { fakerES as faker } from "@faker-js/faker";

import {
  USER_ROLES,
  PRODUCT_STATUS,
  ORDER_STATUS,
  ORDER_PRIORITY,
  DELIVERY_STATUS,
} from "../constants/index.js";

import { ERROR_CODES } from "../constants/error-codes.js";

import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../errors/app.error.js";

import userRepository from "../repositories/users.repository.js";
import orderRepository from "../repositories/orders.repository.js";
import deliveryRepository from "../repositories/deliveries.repository.js";
import productRepository from "../repositories/products.repository.js";

class MocksService {

  // Validar la cantidad de registros simulados
  validateQuantity(qty = 10) {
    if (
      qty === null ||
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
    const quantity = this.validateQuantity(qty);

    return Array.from({ length: quantity }, () =>
      this.generateUser(USER_ROLES.USER)
    );
  }

  // Generar repartidores
  generateDrivers(qty = 10) {
    const quantity = this.validateQuantity(qty);

    return Array.from({ length: quantity }, () =>
      this.generateUser(USER_ROLES.DRIVER)
    );
  }

  // Generar un producto ficticio
    // Generar un producto ficticio en español
  generateProduct() {
    const name = faker.commerce.productName();

    const stock = faker.helpers.arrayElement([
      0,
      faker.number.int({ min: 1, max: 100 }),
    ]);

    const descriptions = [
      `${name} de excelente calidad, ideal para uso diario.`,
      `${name} fabricado con materiales resistentes y duraderos.`,
      `${name} con diseño moderno y excelente terminación.`,
      `${name} pensado para brindar comodidad y practicidad.`,
      `${name} disponible a un precio accesible.`,
    ];

    return {
      name,
      description: faker.helpers.arrayElement(
        descriptions
      ),
      price: faker.number.int({
        min: 1000,
        max: 20000,
      }),
      stock,
      status:
        stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK,
    };
  }

  // Generar productos ficticios
  generateProducts(qty = 10) {
    const quantity = this.validateQuantity(qty);

    return Array.from(
      { length: quantity },
      () => this.generateProduct()
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
    const quantity = this.validateQuantity(qty);

    return Array.from({ length: quantity }, () => {
      const userId = new mongoose.Types.ObjectId();
      const productId = new mongoose.Types.ObjectId();

      return this.generateOrder(userId, productId);
    });
  }

  // Generar una entrega ficticia
    // Generar una entrega coherente con el estado del pedido
  generateDelivery(
    orderId,
    driverId = null,
    orderStatus = ORDER_STATUS.PENDING
  ) {
    let status;
    let assignedDriver = driverId;

    switch (orderStatus) {
      case ORDER_STATUS.DELIVERED:
        status = DELIVERY_STATUS.COMPLETED;
        break;

      case ORDER_STATUS.IN_TRANSIT:
        status = DELIVERY_STATUS.IN_PROGRESS;
        break;

      case ORDER_STATUS.CANCELLED:
        status = DELIVERY_STATUS.FAILED;
        break;

      case ORDER_STATUS.CONFIRMED:
        status = driverId
          ? DELIVERY_STATUS.ASSIGNED
          : DELIVERY_STATUS.PENDING;
        break;

      case ORDER_STATUS.PENDING:
      default:
        status = DELIVERY_STATUS.PENDING;
        assignedDriver = null;
        break;
    }

    // Los estados avanzados necesitan un repartidor
    if (
      [
        DELIVERY_STATUS.COMPLETED,
        DELIVERY_STATUS.IN_PROGRESS,
        DELIVERY_STATUS.FAILED,
      ].includes(status) &&
      !assignedDriver
    ) {
      status = DELIVERY_STATUS.PENDING;
    }

    const assignedAt = assignedDriver
      ? new Date()
      : null;

    return {
      order: orderId,
      driver: assignedDriver,
      status,
      assignedAt,
      deliveredAt:
        status === DELIVERY_STATUS.COMPLETED
          ? new Date()
          : null,
    };
  }

  // Generar entregas simuladas independientes
  generateDeliveries(qty = 10) {
    const quantity = this.validateQuantity(qty);

    return Array.from({ length: quantity }, () => {
      const orderId = new mongoose.Types.ObjectId();

      const orderStatus = faker.helpers.arrayElement(
        Object.values(ORDER_STATUS)
      );

      const driverId = new mongoose.Types.ObjectId();

      return this.generateDelivery(
        orderId,
        driverId,
        orderStatus
      );
    });
  }

  // Generar un conjunto de datos relacionados
  generateMockDataset(qty = 10) {
    const quantity = this.validateQuantity(qty);

    const users = this.generateUsers(quantity).map(
      (user) => ({
        _id: new mongoose.Types.ObjectId(),
        ...user,
      })
    );

    const drivers = this.generateDrivers(quantity).map(
      (driver) => ({
        _id: new mongoose.Types.ObjectId(),
        ...driver,
      })
    );

    const products = this.generateProducts(quantity).map(
      (product) => ({
        _id: new mongoose.Types.ObjectId(),
        ...product,
      })
    );

    const availableProducts = products.filter(
      (product) =>
        product.status === PRODUCT_STATUS.AVAILABLE &&
        product.stock > 0
    );

    // Garantizar al menos un producto disponible
    if (availableProducts.length === 0) {
      products[0].stock = faker.number.int({
        min: 1,
        max: 100,
      });

      products[0].status = PRODUCT_STATUS.AVAILABLE;
      availableProducts.push(products[0]);
    }

    const orders = Array.from(
      { length: quantity },
      () => {
        const user = faker.helpers.arrayElement(users);
        const product = faker.helpers.arrayElement(
          availableProducts
        );

        const order = this.generateOrder(
          user._id,
          product._id
        );

        return {
          _id: new mongoose.Types.ObjectId(),
          ...order,
          total:
            order.products[0].quantity *
            product.price,
        };
      }
    );

    const deliveries = orders.map((order) => {
      const driver = faker.helpers.arrayElement(drivers);

      return {
        _id: new mongoose.Types.ObjectId(),
        ...this.generateDelivery(
          order._id,
          driver._id,
          order.status
        ),
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
  const quantity = this.validateQuantity(qty);

    // Identificador único de esta ejecución
    const seedId = new mongoose.Types.ObjectId().toString();

    const usersData = this.generateUsers(quantity);
    const driversData = this.generateDrivers(quantity);

    const allUsersData = [
      ...usersData,
      ...driversData,
    ].map((user, index) => ({
      ...user,
      email: `mock.${seedId}.${index}@example.com`,
      seedId,
    }));

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Consultar productos existentes
        const existingProducts =
          await productRepository.getAll();

        let availableProducts = existingProducts.filter(
          (product) =>
            product.status === PRODUCT_STATUS.AVAILABLE &&
            product.stock > 0
        );

        let createdProducts = [];

        // 2. Crear productos si no hay disponibles
        if (availableProducts.length === 0) {
          const productsData =
            this.generateProducts(quantity).map(
              (product) => ({
                ...product,
                seedId,
                stock:
                  product.stock > 0
                    ? product.stock
                    : faker.number.int({
                        min: 1,
                        max: 100,
                      }),
                status: PRODUCT_STATUS.AVAILABLE,
              })
            );

          createdProducts =
            await productRepository.createMany(
              productsData,
              session
            );

          availableProducts = createdProducts;
        }

        // 3. Insertar usuarios y repartidores
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

        // 4. Generar pedidos relacionados
        const ordersData = Array.from(
          { length: quantity },
          () => {
            const user = faker.helpers.arrayElement(users);
            const product =
              faker.helpers.arrayElement(
                availableProducts
              );

            const order = this.generateOrder(
              user._id,
              product._id
            );

            return {
              ...order,
              seedId,
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

        // 5. Generar entregas relacionadas
        const deliveriesData =
          createdOrders.map((order) => {
            const driver =
              faker.helpers.arrayElement(drivers);

            return {
              ...this.generateDelivery(
                order._id,
                driver._id,
                order.status
              ),
              seedId,
            };
          });

        const createdDeliveries =
          await deliveryRepository.createMany(
            deliveriesData,
            session
          );

        // 6. Resumen de inserción
        return {
          message:
            "Datos de prueba insertados correctamente",
          seedId,
          inserted: {
            products: createdProducts.length,
            users: users.length,
            drivers: drivers.length,
            orders: createdOrders.length,
            deliveries: createdDeliveries.length,
          },
          totalInserted:
            createdProducts.length +
            createdUsers.length +
            createdOrders.length +
            createdDeliveries.length,
        };
      });
    } finally {
      await session.endSession();
    }
  }

  // Eliminar registros de una ejecución del seed
  async deleteSeed(seedId) {
    if (
      typeof seedId !== "string" ||
      !mongoose.isValidObjectId(seedId)
    ) {
      throw new ValidationError(
        ERROR_CODES.INVALID_SEED_ID.message,
        ERROR_CODES.INVALID_SEED_ID.code
      );
    }

    const session = await mongoose.startSession();

    try {
      return await session.withTransaction(async () => {
        // 1. Consultar registros de esta ejecución
        // Las consultas se ejecutan secuencialmente
        const users =
          await userRepository.getBySeedId(seedId, session);

        const products =
          await productRepository.getBySeedId(
            seedId,
            session
          );

        const orders =
          await orderRepository.getBySeedId(
            seedId,
            session
          );

        const deliveries =
          await deliveryRepository.getBySeedId(
            seedId,
            session
          );

        const total =
          users.length +
          products.length +
          orders.length +
          deliveries.length;

        if (total === 0) {
          throw new NotFoundError(
            ERROR_CODES.SEED_NOT_FOUND.message,
            ERROR_CODES.SEED_NOT_FOUND.code
          );
        }

        const userIds = users.map((user) => user._id);
        const productIds = products.map(
          (product) => product._id
        );
        const orderIds = orders.map(
          (order) => order._id
        );

        // 2. Comprobar referencias externas
        const externalOrders =
          await orderRepository.findExternalReferences(
            userIds,
            productIds,
            seedId,
            session
          );

        const externalDeliveries =
          await deliveryRepository.findExternalReferences(
            orderIds,
            userIds,
            seedId,
            session
          );

        if (
          externalOrders.length > 0 ||
          externalDeliveries.length > 0
        ) {
          throw new ConflictError(
            ERROR_CODES.SEED_HAS_EXTERNAL_REFERENCES.message,
            ERROR_CODES.SEED_HAS_EXTERNAL_REFERENCES.code
          );
        }

        // 3. Eliminar respetando dependencias
        const deletedDeliveries =
          await deliveryRepository.deleteBySeedId(
            seedId,
            session
          );

        const deletedOrders =
          await orderRepository.deleteBySeedId(
            seedId,
            session
          );

        const deletedUsers =
          await userRepository.deleteBySeedId(
            seedId,
            session
          );

        const deletedProducts =
          await productRepository.deleteBySeedId(
            seedId,
            session
          );

        // 4. Resumen de eliminación
        return {
          message:
            "Datos simulados eliminados correctamente",
          seedId,
          deleted: {
            products: deletedProducts.deletedCount,
            users: deletedUsers.deletedCount,
            orders: deletedOrders.deletedCount,
            deliveries: deletedDeliveries.deletedCount,
          },
          totalDeleted:
            deletedProducts.deletedCount +
            deletedUsers.deletedCount +
            deletedOrders.deletedCount +
            deletedDeliveries.deletedCount,
        };
      });
    } finally {
      await session.endSession();
    }
  }
}

const mocksService = new MocksService();

export default mocksService;