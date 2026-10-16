
import Order from "../models/order.model.js";

class OrderRepository {
  async getAll(filters = {}) {
    return Order.find(filters)
      .populate("user", "firstName lastName email role")
      .populate("products.product", "name price")
      .lean();
  }

  async getById(id) {
    return Order.findById(id)
      .populate("user", "firstName lastName email role")
      .populate("products.product", "name price")
      .lean();
  }

  async create(orderData) {
    const order = await Order.create(orderData);
    return order.toObject();
  }

  async createMany(ordersData, session = null) {
    return Order.insertMany(ordersData, {
      session,
      ordered: true,
    });
  }


  // Consultar pedidos de una ejecución del seed
  async getBySeedId(seedId, session = null) {
    return Order.find({ seedId })
      .session(session)
      .lean();
  }

  // Buscar pedidos ajenos al seed que referencien
  // usuarios o productos que se planea eliminar
  async findExternalReferences(
    userIds,
    productIds,
    seedId,
    session = null
  ) {
    return Order.find({
      seedId: { $ne: seedId },
      $or: [
        { user: { $in: userIds } },
        { "products.product": { $in: productIds } },
      ],
    })
      .session(session)
      .lean();
  }

  // Eliminar pedidos de una ejecución del seed
  async deleteBySeedId(seedId, session = null) {
    return Order.deleteMany(
      { seedId },
      { session }
    );
  }

  async deleteById(id) {
    return Order.findByIdAndDelete(id).lean();
  }
}

const orderRepository = new OrderRepository();

export default orderRepository;