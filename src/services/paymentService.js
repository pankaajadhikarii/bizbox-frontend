import api from "./api";

const paymentService = {
    // Get payment details
    async getById(id) {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },

    // Mark COD payment as paid - Admin
    async markCodPaid(id) {
        const response = await api.patch(
            `/payments/admin/${id}/cod-paid`
        );
        return response.data;
    },
};

export default paymentService;