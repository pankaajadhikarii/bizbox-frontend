import api from "./api";

const cartService = {
    // Get current user's cart
    async getCart() {
        const response = await api.get("/cart");
        return response.data;
    },

    // Add product to cart
    async addItem(productId, quantity) {
        const response = await api.post("/cart/items", {
            productId,
            quantity,
        });
        return response.data;
    },

    // Update cart item quantity
    async updateItem(itemId, quantity) {
        const response = await api.put(`/cart/items/${itemId}`, {
            quantity,
        });
        return response.data;
    },

    // Remove item from cart
    async removeItem(itemId) {
        const response = await api.delete(`/cart/items/${itemId}`);
        return response.data;
    },

    // Clear current user's cart
    async clearCart() {
        const response = await api.delete("/cart");
        return response.data;
    },
};

export default cartService;