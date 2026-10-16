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


  // Consultar entregas de una ejecución del seed
  async getBySeedId(seedId, session = null) {
    return Delivery.find({ seedId })
      .session(session)
      .lean();
  }

  // Buscar entregas ajenas al seed que referencien
  // pedidos o repartidores que se planea eliminar
  async findExternalReferences(
    orderIds,
    driverIds,
    seedId,
    session = null
  ) {
    return Delivery.find({
      seedId: { $ne: seedId },
      $or: [
        { order: { $in: orderIds } },
        { driver: { $in: driverIds } },
      ],
    })
      .session(session)
      .lean();
  }

  // Eliminar entregas de una ejecución del seed
  async deleteBySeedId(seedId, session = null) {
    return Delivery.deleteMany(
      { seedId },
      { session }
    );
  }

  async deleteById(id) {
    return Delivery.findByIdAndDelete(id).lean();
  }
}

const deliveryRepository = new DeliveryRepository();

export default deliveryRepository;