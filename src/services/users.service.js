import userRepository from "../repositories/users.repository.js";
import logger from "../config/logger.js";

import { USER_ROLES } from "../constants/index.js";
import { ERROR_CODES } from "../constants/error-codes.js";

import {
  ValidationError,
  NotFoundError,
  ConflictError,
} from "../errors/app.error.js";

class UserService {
  // Obtener todos los usuarios
  async getAllUsers(filters = {}) {
    logger.debug("Consultando listado de usuarios");

    const users = await userRepository.getAll(filters);

    logger.debug("Consulta de usuarios completada");

    return users;
  }

  // Obtener usuario por ID
  async getUserById(id) {
    logger.debug(`Buscando usuario con ID: ${id}`);

    const user = await userRepository.getById(id);

    if (!user) {
      const error = ERROR_CODES.USER_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    logger.debug(`Usuario encontrado: ${id}`);

    return user;
  }

  // Crear usuario
  async createUser(userData) {
    if (
      !userData ||
      typeof userData.email !== "string" ||
      !userData.email.trim()
    ) {
      const error = ERROR_CODES.USER_EMAIL_REQUIRED;

      throw new ValidationError(error.message, error.code);
    }

    const email = userData.email.trim().toLowerCase();

    const validRoles = Object.values(USER_ROLES);

    if (
      userData.role !== undefined &&
      !validRoles.includes(userData.role)
    ) {
      const error = ERROR_CODES.INVALID_USER_ROLE;

      throw new ValidationError(error.message, error.code);
    }

    const existingUser = await userRepository.getByEmail(email);

    if (existingUser) {
      const error = ERROR_CODES.USER_EMAIL_ALREADY_EXISTS;

      throw new ConflictError(error.message, error.code);
    }

    const data = {
      ...userData,
      email,
      role: userData.role ?? USER_ROLES.USER,
    };

    const user = await userRepository.create(data);

    logger.info(`Usuario creado correctamente. ID: ${user._id}`);

    return user;
  }

  // Actualizar usuario
  async updateUser(id, userData) {
    if (
      !userData ||
      typeof userData !== "object" ||
      Array.isArray(userData) ||
      Object.keys(userData).length === 0
    ) {
      const error = ERROR_CODES.INVALID_DATA;

      throw new ValidationError(
        "Debe proporcionar al menos un campo para actualizar",
        error.code
      );
    }

    logger.debug(`Iniciando actualización de usuario: ${id}`);

    const existingUser = await userRepository.getById(id);

    if (!existingUser) {
      const error = ERROR_CODES.USER_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    if (
      userData.role !== undefined &&
      !Object.values(USER_ROLES).includes(userData.role)
    ) {
      const error = ERROR_CODES.INVALID_USER_ROLE;

      throw new ValidationError(error.message, error.code);
    }

    const data = { ...userData };

    if (userData.email !== undefined) {
      if (
        typeof userData.email !== "string" ||
        !userData.email.trim()
      ) {
        const error = ERROR_CODES.USER_EMAIL_EMPTY;

        throw new ValidationError(error.message, error.code);
      }

      const email = userData.email.trim().toLowerCase();

      if (email !== existingUser.email) {
        const userWithSameEmail =
          await userRepository.getByEmail(email);

        if (userWithSameEmail) {
          const error = ERROR_CODES.USER_EMAIL_ALREADY_EXISTS;

          throw new ConflictError(error.message, error.code);
        }
      }

      data.email = email;
    }

    const updatedUser = await userRepository.updateById(id, data);

    logger.info(`Usuario actualizado correctamente. ID: ${id}`);

    return updatedUser;
  }

  // Eliminar usuario
  async deleteUser(id) {
    logger.debug(`Iniciando eliminación de usuario: ${id}`);

    const user = await userRepository.deleteById(id);

    if (!user) {
      const error = ERROR_CODES.USER_NOT_FOUND;

      throw new NotFoundError(error.message, error.code);
    }

    logger.info(`Usuario eliminado correctamente. ID: ${id}`);

    return user;
  }
}

const userService = new UserService();

export default userService;