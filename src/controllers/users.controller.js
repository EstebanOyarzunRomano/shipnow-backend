import userService from "../services/users.service.js";

class UserController {
  async getAll(req, res) {
    try {
      const users = await userService.getAllUsers(req.query);

      res.status(200).json({
        status: "success",
        data: users,
      });
    } catch (error) {
      res.status(500).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async getById(req, res) {
    try {
      const user = await userService.getUserById(req.params.id);

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async create(req, res) {
    try {
      const user = await userService.createUser(req.body);

      res.status(201).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async update(req, res) {
    try {
      const user = await userService.updateUser(
        req.params.id,
        req.body
      );

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(400).json({
        status: "error",
        message: error.message,
      });
    }
  }

  async delete(req, res) {
    try {
      const user = await userService.deleteUser(req.params.id);

      res.status(200).json({
        status: "success",
        data: user,
      });
    } catch (error) {
      res.status(404).json({
        status: "error",
        message: error.message,
      });
    }
  }
}

const userController = new UserController();

export default userController;