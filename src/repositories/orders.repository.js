
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

  async deleteById(id) {
    return Order.findByIdAndDelete(id).lean();
  }
}

const orderRepository = new OrderRepository();

export default orderRepository;