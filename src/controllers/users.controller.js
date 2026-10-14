
import userService from "../services/users.service.js";

class UserController {
  // Obtener todos los usuarios
  async getAll(req, res, next) {
    try {
      const users = await userService.getAllUsers(req.query);

      res.status(200).json({
        status: "success",
        payload: users,
      });
    } catch (error) {
      next(error);
    }
  }

  // Obtener usuario por ID
  async getById(req, res, next) {
    try {
      const user = await userService.getUserById(req.params.id);

      res.status(200).json({
        status: "success",
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Crear usuario
  async create(req, res, next) {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        status: "success",
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Actualizar usuario
  async update(req, res, next) {
    try {
      const user = await userService.updateUser(
        req.params.id,
        req.body
      );

      res.status(200).json({
        status: "success",
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }

  // Eliminar usuario
  async delete(req, res, next) {
    try {
      const user = await userService.deleteUser(req.params.id);

      res.status(200).json({
        status: "success",
        payload: user,
      });
    } catch (error) {
      next(error);
    }
  }
}

const userController = new UserController();

export default userController;