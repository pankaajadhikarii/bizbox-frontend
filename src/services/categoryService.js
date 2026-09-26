import api from "./api";

const categoryService = {
  // Get all active categories
  async getAll() {
    const response = await api.get("/categories");
    return response.data;
  },

  // Get category by ID
  async getById(id) {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // Create category - Admin
  async create(categoryData) {
    const response = await api.post("/categories", categoryData);
    return response.data;
  },

  // Update category - Admin
  async update(id, categoryData) {
    const response = await api.put(`/categories/${id}`, categoryData);
    return response.data;
  },

  // Delete category - Admin
  async delete(id) {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },
};

export default categoryService;
