import api from "./api";

const TOKEN_KEY = "token";
const USER_KEY = "user";

const authService = {
    // Get the currently authenticated user
    async getMe() {
        const response = await api.get("/auth/me");
        return response.data;
    },

    // Login
    async login(email, password) {
        const response = await api.post("/auth/login", {
            email,
            password,
        });

        const data = response.data;

        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
        }

        if (data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        return data;
    },

    // Register
    async register(registerData) {
        const response = await api.post("/auth/register", registerData);

        const data = response.data;

        if (data.token) {
            localStorage.setItem(TOKEN_KEY, data.token);
        }

        if (data.user) {
            localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        }

        return data;
    },

    // Logout
    logout() {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
    },

    // Get token
    getToken() {
        return localStorage.getItem(TOKEN_KEY);
    },

    // Get current user
    getUser() {
        const user = localStorage.getItem(USER_KEY);

        if (!user) {
            return null;
        }

        return JSON.parse(user);
    },

    // Check login
    isAuthenticated() {
        return !!localStorage.getItem(TOKEN_KEY);
    },

    // Check admin role
    isAdmin() {
        const user = this.getUser();

        if (!user) {
            return false;
        }

        return user.roles?.includes("Admin");
    },
};

export default authService;