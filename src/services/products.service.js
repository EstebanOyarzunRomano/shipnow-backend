import productRepository from "../repositories/products.repository.js";
import { PRODUCT_STATUS } from "../constants/index.js";
import {
  ValidationError,
  NotFoundError,
} from "../errors/app.error.js";

class ProductService {
  async getAllProducts(filters = {}) {
    const { onlyAvailable, ...repositoryFilters } = filters;

    if (onlyAvailable === "true") {
      repositoryFilters.status = PRODUCT_STATUS.AVAILABLE;
    }

    const products = await productRepository.getAll(repositoryFilters);

    if (onlyAvailable === "true") {
      return products.filter((product) => product.stock > 0);
    }

    return products;
  }

  async getProductById(id) {
    const product = await productRepository.getById(id);

    if (!product) {
      throw new NotFoundError("Producto no encontrado");
    }

    return product;
  }

  async createProduct(productData) {
    if (
      typeof productData.price !== "number" ||
      !Number.isFinite(productData.price) ||
      productData.price < 0
    ) {
      throw new ValidationError(
        "El precio debe ser un número mayor o igual a cero"
      );
    }

    if (
      typeof productData.stock !== "number" ||
      !Number.isFinite(productData.stock) ||
      !Number.isInteger(productData.stock) ||
      productData.stock < 0
    ) {
      throw new ValidationError(
        "El stock debe ser un número entero mayor o igual a cero"
      );
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
      throw new NotFoundError("Producto no encontrado");
    }

    if (
      productData.price !== undefined &&
      (
        typeof productData.price !== "number" ||
        !Number.isFinite(productData.price) ||
        productData.price < 0
      )
    ) {
      throw new ValidationError(
        "El precio debe ser un número mayor o igual a cero"
      );
    }

    if (
      productData.stock !== undefined &&
      (
        typeof productData.stock !== "number" ||
        !Number.isFinite(productData.stock) ||
        !Number.isInteger(productData.stock) ||
        productData.stock < 0
      )
    ) {
      throw new ValidationError(
        "El stock debe ser un número entero mayor o igual a cero"
      );
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
      throw new NotFoundError("Producto no encontrado");
    }

    return product;
  }
}

const productService = new ProductService();

export default productService;