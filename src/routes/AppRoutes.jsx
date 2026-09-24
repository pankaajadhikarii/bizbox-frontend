import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminRoute from "./AdminRoute";

import Home from "../pages/Home";
import Equipment from "../pages/Equiment";
import ProductDetails from "../pages/ProductDetails";

import Cart from "../pages/Cart";
import CheckoutPage from "../pages/CheckoutPage";
import OrderDetails from "../pages/OrderDetails";
import Orders from "../pages/Orders";

import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminBusinessTypes from "../pages/admin/AdminBusinessTypes";
import AdminCategories from "../pages/admin/AdminCategories";
import AdminProducts from "../pages/admin/AdminProducts";
import AdminOrders from "../pages/admin/AdminOrders";

import Login from "../pages/Login";
import Register from "../pages/Register";

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Routes */}
                <Route
                    path="/"
                    element={<Home />}
                />

                <Route
                    path="/equipment"
                    element={<Equipment />}
                />

                <Route
                    path="/products/:id"
                    element={<ProductDetails />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                {/* Protected Customer Routes */}
                <Route element={<ProtectedRoute />}>
                    <Route
                        path="/cart"
                        element={<Cart />}
                    />

                    <Route
                        path="/checkout"
                        element={<CheckoutPage />}
                    />

                    <Route
                        path="/orders"
                        element={<Orders />}
                    />

                    <Route
                        path="/orders/:id"
                        element={<OrderDetails />}
                    />
                </Route>

                {/* Protected Admin Routes */}
                <Route element={<AdminRoute />}>
                    <Route
                        path="/admin"
                        element={<AdminDashboard />}
                    />

                    <Route
                        path="/admin/business-types"
                        element={<AdminBusinessTypes />}
                    />

                    <Route
                        path="/admin/categories"
                        element={<AdminCategories />}
                    />

                    <Route
                        path="/admin/products"
                        element={<AdminProducts />}
                    />

                    <Route
                        path="/admin/orders"
                        element={<AdminOrders />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;