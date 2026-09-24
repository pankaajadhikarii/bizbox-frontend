import api from "./api";

const resaleService = {
    // Get all active resale listings
    async getAll() {
        const response = await api.get("/resale");
        return response.data;
    },

    // Get resale listing by ID
    async getById(id) {
        const response = await api.get(`/resale/${id}`);
        return response.data;
    },

    // Create resale listing
    async create(listingData) {
        const response = await api.post("/resale", listingData);
        return response.data;
    },

    // Update resale listing
    async update(id, listingData) {
        const response = await api.put(`/resale/${id}`, listingData);
        return response.data;
    },

    // Delete resale listing
    async delete(id) {
        const response = await api.delete(`/resale/${id}`);
        return response.data;
    },

    // Purchase resale listing
    async purchase(id, orderData) {
        const response = await api.post(
            `/resale/${id}/purchase`,
            orderData
        );
        return response.data;
    },
};

export default resaleService;