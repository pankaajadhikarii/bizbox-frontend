import api from "./api";

const businessTypeService = {
    // Get all active business types
    async getAll() {
        const response = await api.get("/business-types");
        return response.data;
    },

    // Get business type by ID
    async getById(id) {
        const response = await api.get(`/business-types/${id}`);
        return response.data;
    },

    // Get products assigned to a business type
    async getProducts(id) {
        const response = await api.get(`/business-types/${id}/products`);
        return response.data;
    },

    // Create business type - Admin
    async create(businessTypeData) {
        const response = await api.post("/business-types", businessTypeData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Update business type - Admin
    async update(id, businessTypeData) {
        const response = await api.put(
            `/business-types/${id}`,
            businessTypeData
        );
        return response.data;
    },

    // Delete business type - Admin
    async delete(id) {
        const response = await api.delete(`/business-types/${id}`);
        return response.data;
    },

    // Assign product to business type - Admin
    async addProduct(id, productData) {
        const response = await api.post(
            `/business-types/${id}/products`,
            productData
        );
        return response.data;
    },

    // Remove product from business type - Admin
    async removeProduct(id, productId) {
        const response = await api.delete(
            `/business-types/${id}/products/${productId}`
        );
        return response.data;
    },
};

export default businessTypeService;