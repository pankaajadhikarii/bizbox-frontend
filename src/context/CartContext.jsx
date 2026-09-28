import { createContext, useContext, useEffect, useState, useCallback } from "react";
import cartService from "../services/cartService";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [cart, setCart] = useState(null);
    const [cartCount, setCartCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const loadCart = useCallback(async () => {
        if (!isAuthenticated) {
            setCart(null);
            setCartCount(0);
            return;
        }

        try {
            setLoading(true);
            const data = await cartService.getCart();
            setCart(data);

            const items = Array.isArray(data)
                ? data
                : data?.items || data?.cartItems || data?.cart?.items || [];

            const total = items.reduce(
                (sum, item) => sum + (Number(item.quantity) || 1),
                0
            );
            setCartCount(total);
        } catch {
            setCart(null);
            setCartCount(0);
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    useEffect(() => {
        const handleCartUpdated = () => {
            loadCart();
        };

        window.addEventListener("cart-updated", handleCartUpdated);
        return () => {
            window.removeEventListener("cart-updated", handleCartUpdated);
        };
    }, [loadCart]);

    const refreshCart = () => {
        return loadCart();
    };

    const value = {
        cart,
        cartCount,
        loading,
        refreshCart,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return context;
};

export default CartContext;
