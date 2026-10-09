import Delivery from "../models/delivery.model.js";

class DeliveryRepository {
  async getAll(filters = {}) {
    return Delivery.find(filters)
      .populate("order")
      .populate("driver", "firstName lastName email role")
      .lean();
  }

  async getById(id) {
    return Delivery.findById(id)
      .populate("order")
      .populate("driver", "firstName lastName email role")
      .lean();
  }

  async getByOrderId(orderId) {
    return Delivery.findOne({ order: orderId }).lean();
  }

  async create(deliveryData) {
    const delivery = await Delivery.create(deliveryData);
    return delivery.toObject();
  }

  async createMany(deliveriesData, session = null) {
    return Delivery.insertMany(deliveriesData, {
      session,
      ordered: true,
    });
  }

  async deleteById(id) {
    return Delivery.findByIdAndDelete(id).lean();
  }
}

const deliveryRepository = new DeliveryRepository();

export default deliveryRepository;