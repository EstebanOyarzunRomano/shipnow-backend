import userRepository from "../repositories/users.repository.js";
import { USER_ROLES } from "../constants/index.js";

class UserService {
  async getAllUsers(filters = {}) {
    return userRepository.getAll(filters);
  }

  async getUserById(id) {
    const user = await userRepository.getById(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  }

  async createUser(userData) {
    const existingUser = await userRepository.getByEmail(userData.email);

    if (existingUser) {
      throw new Error("Ya existe un usuario con ese email");
    }

    const validRoles = Object.values(USER_ROLES);

    if (userData.role && !validRoles.includes(userData.role)) {
      throw new Error("Rol de usuario inválido");
    }

    const data = {
      ...userData,
      role: userData.role || USER_ROLES.USER,
    };

    return userRepository.create(data);
  }

  async updateUser(id, userData) {
    const existingUser = await userRepository.getById(id);

    if (!existingUser) {
      throw new Error("Usuario no encontrado");
    }

    if (userData.role) {
      const validRoles = Object.values(USER_ROLES);

      if (!validRoles.includes(userData.role)) {
        throw new Error("Rol de usuario inválido");
      }
    }

    if (userData.email && userData.email !== existingUser.email) {
      const userWithSameEmail = await userRepository.getByEmail(
        userData.email
      );

      if (userWithSameEmail) {
        throw new Error("Ya existe un usuario con ese email");
      }
    }

    return userRepository.updateById(id, userData);
  }

  async deleteUser(id) {
    const user = await userRepository.deleteById(id);

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    return user;
  }
}

const userService = new UserService();

export default userService;