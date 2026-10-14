
import productService from "../services/products.service.js";

class ProductController {
  // Obtener todos los productos
  async getAll(req, res, next) {
    try {
      const products = await productService.getAllProducts(req.query);

      res.status(200).json({
        status: "success",
        payload: products,
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener producto por ID
  async getById(req, res, next) {
    try {
      const product = await productService.getProductById(req.params.id);

      res.status(200).json({
        status: "success",
        payload: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear producto
  async create(req, res, next) {
    try {
      const product = await productService.createProduct(req.body);

      res.status(201).json({
        status: "success",
        payload: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar producto
  async update(req, res, next) {
    try {
      const product = await productService.updateProduct(
        req.params.id,
        req.body
      );

      res.status(200).json({
        status: "success",
        payload: product,
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar producto
  async delete(req, res, next) {
    try {
      const product = await productService.deleteProduct(req.params.id);

      res.status(200).json({
        status: "success",
        payload: product,
      });
    } catch (error) {
      next(error);
    }
  }
}

const productController = new ProductController();

export default productController;