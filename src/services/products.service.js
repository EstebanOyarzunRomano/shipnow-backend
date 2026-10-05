import productRepository from "../repositories/products.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";

class ProductService {
  async getAllProducts(filters = {}) {
    return productRepository.getAll(filters);
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    return product;
  }

  async createProduct(productData) {
    if (productData.price < 0) {
      throw new Error("El precio no puede ser negativo");
    }

    if (productData.stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }

    const data = {
      ...productData,
      status:
        productData.stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK,
    };

    return productRepository.create(data);
  }

  async updateProduct(id, productData) {
    const existingProduct = await productRepository.getById(id);

    if (!existingProduct) {
      throw new Error("Producto no encontrado");
    }

    if (productData.price !== undefined && productData.price < 0) {
      throw new Error("El precio no puede ser negativo");
    }

    if (productData.stock !== undefined && productData.stock < 0) {
      throw new Error("El stock no puede ser negativo");
    }

    const data = { ...productData };

    if (productData.stock !== undefined) {
      data.status =
        productData.stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK;
    }

    return productRepository.updateById(id, data);
  }

  async deleteProduct(id) {
    const product = await productRepository.deleteById(id);

    if (!product) {
      throw new Error("Producto no encontrado");
    }

    return product;
  }
}

const productService = new ProductService();

export default productService;