import { useEffect, useState } from "react";
import api from "../../services/api";

const statuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        loadOrders();
    }, []);

    const loadOrders = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/orders/admin");
            setOrders(response.data || []);
        } catch (err) {
            setError(err.userMessage || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const getCustomerName = (order) => {
        return (
            order.customerName ||
            order.customer?.name ||
            order.customer?.fullName ||
            "Unknown Customer"
        );
    };

    const getCustomerEmail = (order) => {
        return (
            order.customerEmail ||
            order.customer?.email ||
            "—"
        );
    };

    const getCustomerPhone = (order) => {
        return (
            order.customerPhone ||
            order.customer?.phoneNumber ||
            order.customer?.phone ||
            "—"
        );
    };

    const getOrderTotal = (order) => {
        return (
            order.totalAmount ??
            order.total ??
            order.grandTotal ??
            0
        );
    };

    const getOrderDate = (order) => {
        const date =
            order.createdAt ||
            order.orderDate ||
            order.createdDate;

        if (!date) return "—";

        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getOrderNumber = (order) => {
        return order.orderNumber || `#${order.id}`;
    };

    const getStatus = (order) => {
        return order.status || "Pending";
    };

    const getPaymentMethod = (order) => {
        return (
            order.paymentMethod ||
            order.payment?.paymentMethod ||
            "—"
        );
    };

    const formatPrice = (amount) => {
        return Number(amount).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    const getStatusClasses = (status) => {
        switch (status) {
            case "Pending":
                return "bg-yellow-50 text-yellow-700";

            case "Processing":
                return "bg-blue-50 text-blue-700";

            case "Shipped":
                return "bg-purple-50 text-purple-700";

            case "Delivered":
                return "bg-green-50 text-green-700";

            case "Cancelled":
                return "bg-red-50 text-red-700";

            default:
                return "bg-gray-100 text-gray-600";
        }
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            setUpdatingId(orderId);
            setError("");
            setSuccess("");

            await api.patch(`/orders/admin/${orderId}/status`, {
                status,
            });

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? {
                            ...order,
                            status,
                        }
                        : order
                )
            );

            setSuccess("Order status updated successfully.");
        } catch (err) {
            setError(
                err.userMessage || "Failed to update order status."
            );
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8">
                    <p className="text-sm font-medium text-gray-500">
                        Admin
                    </p>

                    <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                        Orders
                    </h1>

                    <p className="mt-2 text-sm text-gray-500">
                        View customer orders and manage their delivery status.
                    </p>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Total Orders
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {orders.length}
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {
                                orders.filter(
                                    (order) => getStatus(order) === "Pending"
                                ).length
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Processing
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {
                                orders.filter(
                                    (order) => getStatus(order) === "Processing"
                                ).length
                            }
                        </p>
                    </div>

                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Delivered
                        </p>

                        <p className="mt-2 text-2xl font-semibold text-gray-900">
                            {
                                orders.filter(
                                    (order) => getStatus(order) === "Delivered"
                                ).length
                            }
                        </p>
                    </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">

                    <div className="border-b border-gray-200 px-6 py-5">
                        <h2 className="font-semibold text-gray-900">
                            All Orders
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {orders.length} order
                            {orders.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {loading ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            Loading orders...
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No orders found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[1100px]">

                                <thead className="bg-gray-50">
                                    <tr className="border-b border-gray-200 text-left">

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Order
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Customer
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Date
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Total
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Payment
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Update
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {orders.map((order) => {
                                        const status = getStatus(order);

                                        return (
                                            <tr
                                                key={order.id}
                                                className="transition hover:bg-gray-50"
                                            >

                                                <td className="px-6 py-5">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {getOrderNumber(order)}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            ID: {order.id}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div>
                                                        <p className="font-medium text-gray-900">
                                                            {getCustomerName(order)}
                                                        </p>

                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {getCustomerEmail(order)}
                                                        </p>

                                                        <p className="mt-1 text-xs text-gray-400">
                                                            {getCustomerPhone(order)}
                                                        </p>
                                                    </div>
                                                </td>

                                                <td className="px-6 py-5 text-sm text-gray-600">
                                                    {getOrderDate(order)}
                                                </td>

                                                <td className="px-6 py-5">
                                                    <p className="font-medium text-gray-900">
                                                        {formatPrice(getOrderTotal(order))}
                                                    </p>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span className="text-sm text-gray-600">
                                                        {getPaymentMethod(order)}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <span
                                                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
                                                            status
                                                        )}`}
                                                    >
                                                        {status}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-5">
                                                    <div className="flex justify-end">
                                                        <select
                                                            value={status}
                                                            disabled={updatingId === order.id}
                                                            onChange={(e) =>
                                                                handleStatusChange(
                                                                    order.id,
                                                                    e.target.value
                                                                )
                                                            }
                                                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition focus:border-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                                                        >
                                                            {statuses.map((orderStatus) => (
                                                                <option
                                                                    key={orderStatus}
                                                                    value={orderStatus}
                                                                >
                                                                    {orderStatus}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                </td>

                                            </tr>
                                        );
                                    })}

                                </tbody>
                            </table>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default AdminOrders;