import api from "./api";

export function postToEsewa(paymentUrl, fields) {
    if (!paymentUrl) {
        throw new Error("Missing eSewa payment URL.");
    }

    const form = document.createElement("form");
    form.method = "POST";
    form.action = paymentUrl;
    form.enctype = "application/x-www-form-urlencoded";
    form.acceptCharset = "UTF-8";

    for (const [name, value] of Object.entries(fields || {})) {
        if (value !== null && typeof value === "object") continue;

        const input = document.createElement("input");
        input.type = "hidden";
        input.name = name;
        input.value = String(value ?? "");
        form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
}

const paymentService = {
    // Get payment details
    async getById(id) {
        const response = await api.get(`/payments/${id}`);
        return response.data;
    },

    async initiateEsewa(orderId) {
        const response = await api.post("/payments/esewa/initiate", { orderId });
        return response.data;
    },

    async verifyEsewa(data) {
        const response = await api.post("/payments/esewa/verify", { data });
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