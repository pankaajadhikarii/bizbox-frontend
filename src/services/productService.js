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
        const isFormData = productData instanceof FormData;
        const response = await api.post("/products", productData, {
            headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
        });
        return response.data;
    },

    // Update product - Admin
    async update(id, productData) {
        const isFormData = productData instanceof FormData;
        const response = await api.put(`/products/${id}`, productData, {
            headers: isFormData ? { "Content-Type": "multipart/form-data" } : undefined,
        });
        return response.data;
    },

    // Delete product - Admin
    async delete(id) {
        const response = await api.delete(`/products/${id}`);
        return response.data;
    },
};

export default productService;