
import userRepository from "../repositories/users.repository.js";
import { USER_ROLES } from "../constants/index.js";
import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../errors/app.error.js";

class UserService {
  async getAllUsers(filters = {}) {
    return userRepository.getAll(filters);
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    return user;
  }

  async createUser(userData) {
    if (
      !userData ||
      typeof userData.email !== "string" ||
      !userData.email.trim()
    ) {
      throw new ValidationError("El email es obligatorio");
    }

    const email = userData.email.trim().toLowerCase();

    const validRoles = Object.values(USER_ROLES);

    if (
      userData.role !== undefined &&
      !validRoles.includes(userData.role)
    ) {
      throw new ValidationError("Rol de usuario inválido");
    }

    const existingUser = await userRepository.getByEmail(email);

    if (existingUser) {
      throw new ConflictError("Ya existe un usuario con ese email");
    }

    const data = {
      ...userData,
      email,
      role: userData.role ?? USER_ROLES.USER,
    };

    return userRepository.create(data);
  }

  async updateUser(id, userData) {
    const existingUser = await userRepository.getById(id);

    if (!existingUser) {
      throw new NotFoundError("Usuario no encontrado");
    }

    if (
      userData.role !== undefined &&
      !Object.values(USER_ROLES).includes(userData.role)
    ) {
      throw new ValidationError("Rol de usuario inválido");
    }

    const data = { ...userData };

    if (userData.email !== undefined) {
      if (
        typeof userData.email !== "string" ||
        !userData.email.trim()
      ) {
        throw new ValidationError("El email no puede estar vacío");
      }

      const email = userData.email.trim().toLowerCase();

      if (email !== existingUser.email) {
        const userWithSameEmail =
          await userRepository.getByEmail(email);

        if (userWithSameEmail) {
          throw new ConflictError(
            "Ya existe un usuario con ese email"
          );
        }
      }

      data.email = email;
    }

    return userRepository.updateById(id, data);
  }

  async deleteUser(id) {
    const user = await userRepository.deleteById(id);

    if (!user) {
      throw new NotFoundError("Usuario no encontrado");
    }

    return user;
  }
}

const userService = new UserService();

export default userService;