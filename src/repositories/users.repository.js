import User from "../models/user.model.js";

class UserRepository {
  async getAll(filters = {}) {
    const query = {};

    if (filters.role) {
      query.role = filters.role;
    }

    return User.find(query)
      .select("firstName lastName email role createdAt updatedAt")
      .lean();
  }

  async getById(id) {
    return User.findById(id).lean();
  }

  async getByEmail(email) {
    return User.findOne({ email }).lean();
  }

  async create(userData) {
    const user = await User.create(userData);
    return user.toObject();
  }

  async createMany(usersData, session = null) {
    return User.insertMany(usersData, {
      session,
      ordered: true,
    });
  }

  async updateById(id, userData) {
    return User.findByIdAndUpdate(id, userData, {
      new: true,
      runValidators: true,
    }).lean();
  }

  async deleteById(id) {
    return User.findByIdAndDelete(id).lean();
  }
}

const userRepository = new UserRepository();

export default userRepository;