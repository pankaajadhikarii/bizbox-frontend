import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => authService.getUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadCurrentUser = async () => {
            const token = authService.getToken();
            const storedUser = authService.getUser();

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            try {
                const response = await authService.getMe();
                const currentUser = response?.user || response;

                localStorage.setItem("user", JSON.stringify(currentUser));
                setUser(currentUser);
            } catch {
                setUser(storedUser || null);
            } finally {
                setLoading(false);
            }
        };

        loadCurrentUser();
    }, []);

    const login = async (email, password) => {
        const data = await authService.login(email, password);

        const loggedInUser = authService.getUser();

        setUser(loggedInUser);

        return data;
    };

    const register = async (registerData) => {
        const data = await authService.register(registerData);

        const registeredUser = authService.getUser();

        setUser(registeredUser);

        return data;
    };

    const logout = () => {
        authService.logout();
        setUser(null);
    };

    const isAuthenticated = !!authService.getToken();

    const userRoles = Array.isArray(user?.roles)
        ? user.roles
        : [user?.role].filter(Boolean);

    const isAdmin = userRoles.some(
        (role) => String(role).toLowerCase() === "admin"
    );

    const value = {
        user,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider");
    }

    return context;
};

export default AuthContext;