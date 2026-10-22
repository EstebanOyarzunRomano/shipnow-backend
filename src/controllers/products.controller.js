import productService from "../services/products.service.js";
import asyncHandler from "../middlewares/asyncHandler.js";

class ProductController {
  // Obtener todos los productos
  getAll = asyncHandler(async (req, res) => {
    const products = await productService.getAllProducts(req.query);

    res.status(200).json({
      status: "success",
      payload: products,
    });
  });

  // Obtener producto por ID
  getById = asyncHandler(async (req, res) => {
    const product = await productService.getProductById(req.params.id);

    res.status(200).json({
      status: "success",
      payload: product,
    });
  });

  // Crear producto
  create = asyncHandler(async (req, res) => {
    const product = await productService.createProduct(req.body);

    res.status(201).json({
      status: "success",
      payload: product,
    });
  });

  // Actualizar producto
  update = asyncHandler(async (req, res) => {
    const product = await productService.updateProduct(
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: "success",
      payload: product,
    });
  });

  // Eliminar producto
  delete = asyncHandler(async (req, res) => {
    const product = await productService.deleteProduct(req.params.id);

    res.status(200).json({
      status: "success",
      payload: product,
    });
  });
}

const productController = new ProductController();

export default productController;