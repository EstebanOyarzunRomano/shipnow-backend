
import productRepository from "../repositories/products.repository.js";
import logger from "../config/logger.js";

import { PRODUCT_STATUS } from "../constants/index.js";
import { ERROR_CODES } from "../constants/error-codes.js";

import {
  ValidationError,
  NotFoundError,
} from "../errors/app.error.js";

class ProductService {
  // Obtener todos los productos
  async getAllProducts(filters = {}) {
    logger.debug("Consultando listado de productos");

    const { onlyAvailable, ...repositoryFilters } = filters;

    if (onlyAvailable === "true") {
      repositoryFilters.status = PRODUCT_STATUS.AVAILABLE;
    }

    const products = await productRepository.getAll(repositoryFilters);

    if (onlyAvailable === "true") {
      const availableProducts = products.filter(
        (product) => product.stock > 0
      );

      logger.debug(
        `Consulta completada. Productos disponibles: ${availableProducts.length}`
      );

      return availableProducts;
    }

    logger.debug(
      `Consulta completada. Productos encontrados: ${products.length}`
    );

    return products;
  }

  // Obtener producto por ID
  async getProductById(id) {
    logger.debug(`Buscando producto con ID: ${id}`);

    const product = await productRepository.getById(id);

    if (!product) {
      const error = ERROR_CODES.PRODUCT_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    logger.debug(`Producto encontrado: ${id}`);

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

    const product = await productRepository.create(data);

    logger.info(
      `Producto creado correctamente. ID: ${product._id}`
    );

    return product;
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

    logger.debug(`Iniciando actualización de producto: ${id}`);

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

    const updatedProduct = await productRepository.updateById(
      id,
      data
    );

    logger.info(
      `Producto actualizado correctamente. ID: ${id}`
    );

    return updatedProduct;
  }

  // Eliminar producto
  async deleteProduct(id) {
    logger.debug(`Iniciando eliminación de producto: ${id}`);

    const product = await productRepository.deleteById(id);

    if (!product) {
      const error = ERROR_CODES.PRODUCT_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    logger.info(
      `Producto eliminado correctamente. ID: ${id}`
    );

    return product;
  }
}

const productService = new ProductService();

export default productService;