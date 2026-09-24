import api from "./api";

const productService = {
    // Get all active products
    async getAll() {
        const response = await api.get("/products");
        return response.data;
    },

    // Get product by ID
    async getById(id) {
        const response = await api.get(`/products/${id}`);
        return response.data;
    },

    // Create product - Admin
    async create(productData) {
        const response = await api.post("/products", productData);
        return response.data;
    },

    // Update product - Admin
    async update(id, productData) {
        const response = await api.put(`/products/${id}`, productData);
        return response.data;
    },

    // Delete product - Admin
    async delete(id) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};

export default productService;