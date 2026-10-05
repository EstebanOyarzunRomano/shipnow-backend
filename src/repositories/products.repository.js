import Product from "../models/product.model.js";

class ProductRepository {
  async getAll(filters = {}) {
    const query = {};

    if (filters.status) {
      query.status = filters.status;
    }

    return Product.find(query)
      .select("name description price stock status createdAt updatedAt")
      .lean();
  }

  async getById(id) {
    return Product.findById(id).lean();
  }

  async create(productData) {
    const product = await Product.create(productData);
    return product.toObject();
  }

  async updateById(id, productData) {
    return Product.findByIdAndUpdate(id, productData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteById(id) {
    return Product.findByIdAndDelete(id).lean();
  }
}

const productRepository = new ProductRepository();

export default productRepository;