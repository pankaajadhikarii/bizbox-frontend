import { createContext, useContext, useEffect, useState } from "react";
import authService from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => authService.getUser());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = authService.getToken();
        const storedUser = authService.getUser();

        if (token && storedUser) {
            setUser(storedUser);
        } else {
            setUser(null);
        }

        setLoading(false);
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

    const isAdmin =
        user?.roles?.includes("Admin") ?? false;

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