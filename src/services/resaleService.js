import api from "./api";

const resaleService = {
    // Get all active resale listings (public)
    async getAll() {
        const response = await api.get("/resale");
        return response.data;
    },

    // Get resale listing by ID (public)
    async getById(id) {
        const response = await api.get(`/resale/${id}`);
        return response.data;
    },

    // Get products eligible for resale (auth required)
    async getEligibleProducts() {
        const response = await api.get("/resale/eligible-products");
        return response.data;
    },

    // Get current user's own listings (auth required)
    async getMyListings() {
        const response = await api.get("/resale/my-listings");
        return response.data;
    },

    // Create resale listing — must use FormData (auth required)
    async create(formData) {
        const response = await api.post("/resale", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Update resale listing — must use FormData (auth required)
    async update(id, formData) {
        const response = await api.put(`/resale/${id}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data;
    },

    // Delete / remove resale listing (auth required)
    async delete(id) {
        const response = await api.delete(`/resale/${id}`);
        return response.data;
    },

    // Purchase a resale item (auth required)
    async purchase(id, orderData) {
        const response = await api.post(`/resale/${id}/purchase`, orderData);
        return response.data;
    },
};

export default resaleService;