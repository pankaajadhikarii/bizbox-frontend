import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../services/orderService";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await orderService.getAll();

            const orderList = Array.isArray(data)
                ? data
                : data?.orders ||
                data?.items ||
                data?.data ||
                [];

            setOrders(orderList);
        } catch (err) {
            setError(
                err.userMessage ||
                err.response?.data?.message ||
                "Unable to load your orders."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadOrders();
    }, []);

    const getOrderId = (order) =>
        order.id || order.orderId || order._id;

    const getOrderDate = (order) =>
        order.createdAt ||
        order.orderDate ||
        order.createdDate ||
        order.date;

    const getStatus = (order) =>
        order.status || order.orderStatus || "Pending";

    const getPaymentStatus = (order) =>
        order.paymentStatus ||
        order.payment?.status ||
        "Pending";

    const getTotal = (order) =>
        order.totalAmount ??
        order.total ??
        order.orderTotal ??
        order.grandTotal ??
        0;

    const getItems = (order) =>
        order.items ||
        order.orderItems ||
        order.products ||
        [];

    const getItemCount = (order) => {
        const items = getItems(order);

        if (!Array.isArray(items)) {
            return order.itemCount || order.totalItems || 0;
        }

        return items.reduce(
            (total, item) =>
                total +
                Number(item.quantity ?? item.qty ?? 1),
            0
        );
    };

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        const value = Number(amount);

        if (Number.isNaN(value)) {
            return "NPR 0.00";
        }

        return `NPR ${value.toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    const getStatusClasses = (status) => {
        switch (String(status).toLowerCase()) {
            case "delivered":
                return "bg-green-50 text-green-700";

            case "shipped":
                return "bg-blue-50 text-blue-700";

            case "processing":
                return "bg-yellow-50 text-yellow-700";

            case "cancelled":
            case "canceled":
                return "bg-red-50 text-red-700";

            case "pending":
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getPaymentClasses = (status) => {
        switch (String(status).toLowerCase()) {
            case "paid":
                return "bg-green-50 text-green-700";

            case "failed":
                return "bg-red-50 text-red-700";

            case "unpaid":
                return "bg-orange-50 text-orange-700";

            case "pending":
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="text-2xl font-bold tracking-tight"
                    >
                        BizKit
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <Link
                            to="/"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Home
                        </Link>

                        <Link
                            to="/equipment"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/orders"
                            className="text-sm font-medium text-black"
                        >
                            Orders
                        </Link>

                        <Link
                            to="/cart"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Cart
                        </Link>
                    </nav>

                    <Link
                        to="/equipment"
                        className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Shop Equipment
                    </Link>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-10">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        Account
                    </p>

                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                        Your Orders
                    </h1>

                    <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
                        View your complete purchase history and track your orders.
                    </p>
                </div>

                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse rounded-2xl border border-gray-200 p-6"
                            >
                                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                    <div className="space-y-3">
                                        <div className="h-4 w-32 rounded bg-gray-200" />
                                        <div className="h-3 w-24 rounded bg-gray-200" />
                                    </div>

                                    <div className="h-7 w-24 rounded-full bg-gray-200" />

                                    <div className="h-4 w-28 rounded bg-gray-200" />

                                    <div className="h-10 w-28 rounded-full bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            !
                        </div>

                        <h2 className="text-lg font-semibold text-red-900">
                            Unable to load orders
                        </h2>

                        <p className="mt-2 text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={loadOrders}
                            className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && orders.length === 0 && (
                    <div className="rounded-3xl border border-gray-200 px-6 py-20 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                className="h-7 w-7 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M9 5H7a2 2 0 00-2 2v11a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-6 text-2xl font-semibold">
                            No orders yet
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                            You have not placed any orders yet. Explore our equipment
                            catalog and find what your business needs.
                        </p>

                        <Link
                            to="/equipment"
                            className="mt-7 inline-flex rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Browse Equipment
                        </Link>
                    </div>
                )}

                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const orderId = getOrderId(order);
                            const status = getStatus(order);
                            const paymentStatus = getPaymentStatus(order);
                            const itemCount = getItemCount(order);
                            const total = getTotal(order);

                            return (
                                <div
                                    key={orderId}
                                    className="rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-gray-300 sm:p-6"
                                >
                                    <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-center">
                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                                Order
                                            </p>

                                            <p className="mt-2 font-mono text-sm font-semibold text-gray-900">
                                                #{orderId}
                                            </p>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {formatDate(getOrderDate(order))}
                                            </p>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                                Status
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                                                    status
                                                )}`}
                                            >
                                                {status}
                                            </span>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                                Payment
                                            </p>

                                            <span
                                                className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-medium ${getPaymentClasses(
                                                    paymentStatus
                                                )}`}
                                            >
                                                {paymentStatus}
                                            </span>

                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500">
                                                    {itemCount}{" "}
                                                    {itemCount === 1 ? "item" : "items"}
                                                </p>

                                                <p className="mt-1 text-base font-semibold">
                                                    {formatCurrency(total)}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <Link
                                                to={`/orders/${orderId}`}
                                                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-900 transition hover:border-black hover:bg-gray-50 lg:w-auto"
                                            >
                                                View Details

                                                <svg
                                                    className="h-4 w-4"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="1.5"
                                                        d="M5 12h14M13 6l6 6-6 6"
                                                    />
                                                </svg>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <footer className="mt-16 border-t border-gray-200">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p>
                        © {new Date().getFullYear()} BizKit. All rights reserved.
                    </p>

                    <div className="flex gap-6">
                        <Link
                            to="/equipment"
                            className="transition hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/orders"
                            className="transition hover:text-black"
                        >
                            Orders
                        </Link>

                        <Link
                            to="/cart"
                            className="transition hover:text-black"
                        >
                            Cart
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Orders;