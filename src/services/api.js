import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,

    (error) => {
        const status = error.response?.status;

        if (status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");

            // Prevent redirect loops when already on the login page
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }

            error.userMessage = "Your session has expired. Please log in again.";

            return Promise.reject(error);
        }

        let message = "Something went wrong. Please try again.";

        if (error.response) {
            const { data } = error.response;

            if (status === 400) {
                if (data?.errors) {
                    message = Object.values(data.errors).flat().join(" ");
                } else {
                    message =
                        data?.message ||
                        data?.title ||
                        "The request contains invalid data.";
                }
            } else if (status === 403) {
                message = "You do not have permission to perform this action.";
            } else if (status === 404) {
                message = "The requested resource was not found.";
            } else if (status >= 500) {
                message = "Server error. Please try again later.";
            } else {
                message = data?.message || data?.title || message;
            }
        } else if (error.request) {
            message = "Unable to connect to the server.";
        }

        error.userMessage = message;

        return Promise.reject(error);
    }
);

export default api;