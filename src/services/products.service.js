
import productRepository from "../repositories/products.repository.js";

import { PRODUCT_STATUS } from "../constants/index.js";
import { ERROR_CODES } from "../constants/error-codes.js";

import {
  ValidationError,
  NotFoundError,
} from "../errors/app.error.js";

class ProductService {
  // Obtener todos los productos
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

  // Obtener producto por ID
  async getProductById(id) {
    const product = await productRepository.getById(id);

    if (!product) {
      const error = ERROR_CODES.PRODUCT_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    return product;
  }

  // Crear producto
  async createProduct(productData) {
    if (
      !productData ||
      typeof productData !== "object" ||
      Array.isArray(productData) ||
      Object.keys(productData).length === 0
    ) {
      const error = ERROR_CODES.INVALID_DATA;

      throw new ValidationError(
        "Debe proporcionar datos válidos para crear el producto",
        error.code
      );
    }

    // Validar precio
    if (
      typeof productData.price !== "number" ||
      !Number.isFinite(productData.price) ||
      productData.price < 0
    ) {
      const error = ERROR_CODES.INVALID_PRODUCT_PRICE;

      throw new ValidationError(error.message, error.code);
    }

    // Validar stock
    if (
      typeof productData.stock !== "number" ||
      !Number.isFinite(productData.stock) ||
      !Number.isInteger(productData.stock) ||
      productData.stock < 0
    ) {
      const error = ERROR_CODES.INVALID_PRODUCT_STOCK;

      throw new ValidationError(error.message, error.code);
    }

    // Calcular el estado automáticamente
    const data = {
      ...productData,
      status:
        productData.stock > 0
          ? PRODUCT_STATUS.AVAILABLE
          : PRODUCT_STATUS.OUT_OF_STOCK,
    };

    return productRepository.create(data);
  }

  // Actualizar producto
  async updateProduct(id, productData) {
    if (
      !productData ||
      typeof productData !== "object" ||
      Array.isArray(productData) ||
      Object.keys(productData).length === 0
    ) {
      const error = ERROR_CODES.INVALID_DATA;

      throw new ValidationError(
        "Debe proporcionar al menos un campo para actualizar",
        error.code
      );
    }

    const existingProduct = await productRepository.getById(id);

    if (!existingProduct) {
      const error = ERROR_CODES.PRODUCT_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    // Validar precio si se envía
    if (
      productData.price !== undefined &&
      (
        typeof productData.price !== "number" ||
        !Number.isFinite(productData.price) ||
        productData.price < 0
      )
    ) {
      const error = ERROR_CODES.INVALID_PRODUCT_PRICE;

      throw new ValidationError(error.message, error.code);
    }

    // Validar stock si se envía
    if (
      productData.stock !== undefined &&
      (
        typeof productData.stock !== "number" ||
        !Number.isFinite(productData.stock) ||
        !Number.isInteger(productData.stock) ||
        productData.stock < 0
      )
    ) {
      const error = ERROR_CODES.INVALID_PRODUCT_STOCK;

      throw new ValidationError(error.message, error.code);
    }

    // Evitar que el cliente controle directamente el estado
    const { status, ...data } = productData;

    // Utilizar el stock nuevo o el existente
    const finalStock =
      data.stock !== undefined
        ? data.stock
        : existingProduct.stock;

    // Calcular siempre el estado según el stock
    data.status =
      finalStock > 0
        ? PRODUCT_STATUS.AVAILABLE
        : PRODUCT_STATUS.OUT_OF_STOCK;

    return productRepository.updateById(id, data);
  }

  // Eliminar producto
  async deleteProduct(id) {
    const product = await productRepository.deleteById(id);

    if (!product) {
      const error = ERROR_CODES.PRODUCT_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    return product;
  }
}

const productService = new ProductService();

export default productService;
