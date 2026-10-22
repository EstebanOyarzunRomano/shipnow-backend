
import userService from "../services/users.service.js";
import asyncHandler from "../middlewares/asyncHandler.js";

class UserController {
  // Obtener todos los usuarios
  getAll = asyncHandler(async (req, res) => {
    const users = await userService.getAllUsers(req.query);

    res.status(200).json({
      status: "success",
      payload: users,
    });
  });

  // Obtener usuario por ID
  getById = asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      status: "success",
      payload: user,
    });
  });

  // Crear usuario
  create = asyncHandler(async (req, res) => {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      status: "success",
      payload: user,
    });
  });

  // Actualizar usuario
  update = asyncHandler(async (req, res) => {
    const user = await userService.updateUser(
      req.params.id,
      req.body
    );

    res.status(200).json({
      status: "success",
      payload: user,
    });
  });

  // Eliminar usuario
  delete = asyncHandler(async (req, res) => {
    const user = await userService.deleteUser(req.params.id);

    res.status(200).json({
      status: "success",
      payload: user,
    });
  });
}

const userController = new UserController();

export default userController;