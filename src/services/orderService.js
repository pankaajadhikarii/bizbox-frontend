import api from "./api";

const orderService = {
    // Get current user's orders
    async getAll() {
        const response = await api.get("/orders");
        return response.data;
    },

    // Get order by ID
    async getById(id) {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Create order
    async create(orderData) {
        const response = await api.post("/orders", orderData);
        return response.data;
    },

    // Cancel order
    async cancel(id) {
        const response = await api.post(`/orders/${id}/cancel`);
        return response.data;
    },
};

export default orderService;