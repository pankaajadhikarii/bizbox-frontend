import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import orderService from "../services/orderService";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await orderService.getAll();
            setOrders(Array.isArray(data) ? data : data.orders || []);
        } catch (err) {
            setError(
                err.userMessage || "Unable to load your orders. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const getStatusClass = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-100 text-yellow-700";
            case "Processing":
                return "bg-blue-100 text-blue-700";
            case "Shipped":
                return "bg-purple-100 text-purple-700";
            case "Delivered":
                return "bg-green-100 text-green-700";
            case "Cancelled":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const formatDate = (date) => {
        if (!date) return "-";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white px-6 py-12">
                <div className="mx-auto max-w-6xl">
                    <div className="animate-pulse">
                        <div className="mb-8 h-8 w-40 rounded bg-gray-200" />
                        <div className="h-20 rounded-xl bg-gray-100" />
                        <div className="mt-4 h-20 rounded-xl bg-gray-100" />
                        <div className="mt-4 h-20 rounded-xl bg-gray-100" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-6xl">
                <div className="mb-10">
                    <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                        My Orders
                    </h1>
                    <p className="mt-2 text-sm text-gray-500">
                        View and track your orders.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>

                        <button
                            onClick={fetchOrders}
                            className="font-medium underline hover:no-underline"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {!error && orders.length === 0 ? (
                    <div className="rounded-2xl border border-gray-200 bg-gray-50 px-6 py-16 text-center">
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-white text-gray-400 shadow-sm">
                            <svg
                                className="h-7 w-7"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-5 text-lg font-medium text-gray-900">
                            No orders yet
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Your completed purchases will appear here.
                        </p>

                        <Link
                            to="/"
                            className="mt-6 inline-flex rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Start Shopping
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-200 bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Order
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Items
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Total
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => {
                                        const orderId = order.id;
                                        const orderNumber =
                                            order.orderNumber || `#${order.id}`;

                                        const total =
                                            order.totalAmount ??
                                            order.total ??
                                            order.grandTotal ??
                                            0;

                                        const items =
                                            order.items ||
                                            order.orderItems ||
                                            [];

                                        const status = order.status || "Pending";

                                        const date =
                                            order.createdAt ||
                                            order.orderDate ||
                                            order.createdDate;

                                        return (
                                            <tr
                                                key={orderId}
                                                className="transition hover:bg-gray-50"
                                            >
                                                <td className="px-6 py-5">
                                                    <div className="font-medium text-gray-900">
                                                        {orderNumber}
                                                    </div>

                                                    <div className="mt-1 text-xs text-gray-400">
                                                        ID: {orderId}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-gray-600">
                                                    {formatDate(date)}
                                                </td>

                                                <td className="px-6 py-5 text-sm text-gray-600">
                                                    {items.length}
                                                </td>

                                                <td className="px-6 py-5 text-sm font-medium text-gray-900">
                                                    Rs. {Number(total).toLocaleString()}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                            status
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <Link
                                                        to={`/orders/${orderId}`}
                                                        className="text-sm font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                                                    >
                                                        View Details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="divide-y divide-gray-100 md:hidden">
                            {orders.map((order) => {
                                const orderId = order.id;

                                const orderNumber =
                                    order.orderNumber || `#${order.id}`;

                                const total =
                                    order.totalAmount ??
                                    order.total ??
                                    order.grandTotal ??
                                    0;

                                const items =
                                    order.items ||
                                    order.orderItems ||
                                    [];

                                const status = order.status || "Pending";

                                const date =
                                    order.createdAt ||
                                    order.orderDate ||
                                    order.createdDate;

                                return (
                                    <div key={orderId} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-medium text-gray-900">
                                                    {orderNumber}
                                                </p>

                                                <p className="mt-1 text-xs text-gray-400">
                                                    {formatDate(date)}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                                    status
                                                )}`}
                                            >
                                                {status}
                                            </span>
                                        </div>

                                        <div className="mt-5 grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400">Items</p>
                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    {items.length}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-xs text-gray-400">Total</p>
                                                <p className="mt-1 text-sm font-medium text-gray-900">
                                                    Rs. {Number(total).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        <Link
                                            to={`/orders/${orderId}`}
                                            className="mt-5 block rounded-lg border border-gray-300 px-4 py-2.5 text-center text-sm font-medium text-gray-900 transition hover:bg-gray-50"
                                        >
                                            View Order
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Orders;