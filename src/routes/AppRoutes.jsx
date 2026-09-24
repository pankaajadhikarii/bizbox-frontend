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
import Resale from "../pages/Resale";
import ResaleDetails from "../pages/ResaleDetails";
import ResalePurchase from "../pages/ResalePurchase";
import CreateResaleListing from "../pages/CreateResaleListing";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminBusinessTypes from "../pages/admin/AdminBusinessTypes";

const Placeholder = ({ title }) => {
    return <div>{title}</div>;
};

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
                    element={<Placeholder title="Login Page" />}
                />

                <Route
                    path="/register"
                    element={<Placeholder title="Register Page" />}
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

                    <Route
                        path="/resale"
                        element={<Resale />}
                    />
                </Route>

                <Route
                    path="/resale/:id"
                    element={<ResaleDetails />}
                />

                <Route
                    path="/resale/:id/purchase"
                    element={<ResalePurchase />}
                />

                <Route
                    path="/resale/create"
                    element={<CreateResaleListing />}
                />

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
                        element={<Placeholder title="Admin Categories" />}
                    />

                    <Route
                        path="/admin/products"
                        element={<Placeholder title="Admin Products" />}
                    />

                    <Route
                        path="/admin/orders"
                        element={<Placeholder title="Admin Orders" />}
                    />

                    <Route
                        path="/admin/resale"
                        element={<Placeholder title="Admin Resale" />}
                    />
                </Route>
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;