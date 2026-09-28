import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Package, ArrowRight, RotateCcw, AlertCircle } from "lucide-react";
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

    const ORDER_STATUS_MAP = {
        0: "Pending",
        1: "Processing",
        2: "Shipped",
        3: "Delivered",
        4: "Cancelled",
        "0": "Pending",
        "1": "Processing",
        "2": "Shipped",
        "3": "Delivered",
        "4": "Cancelled",
        pending: "Pending",
        processing: "Processing",
        shipped: "Shipped",
        delivered: "Delivered",
        cancelled: "Cancelled",
        Pending: "Pending",
        Processing: "Processing",
        Shipped: "Shipped",
        Delivered: "Delivered",
        Cancelled: "Cancelled",
    };

    const getStatus = (rawStatus) => {
        if (rawStatus === null || rawStatus === undefined || rawStatus === "") {
            return "Pending";
        }
        if (ORDER_STATUS_MAP[rawStatus] !== undefined) {
            return ORDER_STATUS_MAP[rawStatus];
        }
        const lower = String(rawStatus).toLowerCase();
        if (ORDER_STATUS_MAP[lower] !== undefined) {
            return ORDER_STATUS_MAP[lower];
        }
        return String(rawStatus);
    };

    const getStatusClass = (status) => {
        const normalized = getStatus(status);
        switch (normalized) {
            case "Pending":
                return "bg-amber-50 text-amber-700 border border-amber-200/60";
            case "Processing":
                return "bg-blue-50 text-blue-700 border border-blue-200/60";
            case "Shipped":
                return "bg-purple-50 text-purple-700 border border-purple-200/60";
            case "Delivered":
                return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
            case "Cancelled":
                return "bg-red-50 text-red-700 border border-red-200/60";
            default:
                return "bg-gray-100 text-gray-700 border border-gray-200";
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

    return (
        <main className="min-h-screen bg-gray-50 py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                        My orders
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Track and review your recent equipment purchases.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                            <span>{error}</span>
                        </div>

                        <button
                            type="button"
                            onClick={fetchOrders}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 underline hover:no-underline"
                        >
                            <RotateCcw className="h-3.5 w-3.5" />
                            Retry
                        </button>
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm animate-pulse">
                        <div className="h-12 border-b border-gray-100 bg-gray-50" />
                        <div className="divide-y divide-gray-100 p-6 space-y-4">
                            {Array.from({ length: 4 }).map((_, idx) => (
                                <div key={idx} className="flex items-center justify-between pt-4 first:pt-0">
                                    <div className="space-y-2">
                                        <div className="h-4 w-32 rounded bg-gray-100" />
                                        <div className="h-3 w-20 rounded bg-gray-100" />
                                    </div>
                                    <div className="h-6 w-20 rounded-full bg-gray-100" />
                                    <div className="h-4 w-24 rounded bg-gray-100" />
                                    <div className="h-8 w-24 rounded-lg bg-gray-100" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : !error && orders.length === 0 ? (
                    /* Empty State */
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <Package className="h-8 w-8" />
                        </div>

                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            No orders found
                        </h2>

                        <p className="mt-1.5 max-w-sm text-sm text-gray-500">
                            You haven't placed any equipment orders yet. When you complete a purchase, it will appear here.
                        </p>

                        <Link
                            to="/equipment"
                            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Browse Equipment
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ) : (
                    /* Orders Table / Cards */
                    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                        {/* Desktop Table View */}
                        <div className="hidden overflow-x-auto md:block">
                            <table className="w-full text-left">
                                <thead className="border-b border-gray-200 bg-gray-50/75">
                                    <tr>
                                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Order
                                        </th>
                                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Date
                                        </th>
                                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Items
                                        </th>
                                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Total
                                        </th>
                                        <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Status
                                        </th>
                                        <th className="px-6 py-3.5 text-right text-xs font-semibold uppercase tracking-wider text-gray-500">
                                            Action
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100 text-sm">
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

                                        const status = getStatus(order.status);

                                        const date =
                                            order.createdAt ||
                                            order.orderDate ||
                                            order.createdDate;

                                        const isResaleOrder = Boolean(
                                            order.isResale ||
                                            order.resaleListingId != null ||
                                            order.orderType === "Resale" ||
                                            order.type === "Resale" ||
                                            items.some((i) => i.isResale || i.resaleListingId != null) ||
                                            sessionStorage.getItem(`resale_order_${orderId}`) === "true"
                                        );

                                        const displayStatus = isResaleOrder ? "Order Placed" : status;
                                        const statusClass = isResaleOrder
                                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                            : getStatusClass(status);

                                        return (
                                            <tr
                                                key={orderId}
                                                className="transition hover:bg-gray-50/60"
                                            >
                                                <td className="px-6 py-4.5">
                                                    <div className="font-semibold text-gray-900">
                                                        {orderNumber}
                                                    </div>
                                                    <div className="mt-0.5 text-xs text-gray-400">
                                                        ID: {orderId}
                                                    </div>
                                                </td>

                                                <td className="px-6 py-4.5 text-gray-600">
                                                    {formatDate(date)}
                                                </td>

                                                <td className="px-6 py-4.5 text-gray-600">
                                                    {items.length} {items.length === 1 ? "item" : "items"}
                                                </td>

                                                <td className="px-6 py-4.5 font-semibold text-gray-900">
                                                    Rs. {Number(total).toLocaleString()}
                                                </td>

                                                <td className="px-6 py-4.5">
                                                    <span
                                                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                                                    >
                                                        {displayStatus}
                                                    </span>
                                                </td>

                                                <td className="px-6 py-4.5 text-right">
                                                    <Link
                                                        to={`/orders/${orderId}${isResaleOrder ? "?type=resale" : ""}`}
                                                        className="inline-flex underline items-center gap-1 text-xs font-medium text-black transition hover:text-gray-600"
                                                    >
                                                        View details
                                                    </Link>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
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

                                const status = getStatus(order.status);

                                const date =
                                    order.createdAt ||
                                    order.orderDate ||
                                    order.createdDate;

                                const isResaleOrder = Boolean(
                                    order.isResale ||
                                    order.resaleListingId != null ||
                                    order.orderType === "Resale" ||
                                    order.type === "Resale" ||
                                    items.some((i) => i.isResale || i.resaleListingId != null) ||
                                    sessionStorage.getItem(`resale_order_${orderId}`) === "true"
                                );

                                const displayStatus = isResaleOrder ? "Order Placed" : status;
                                const statusClass = isResaleOrder
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                                    : getStatusClass(status);

                                return (
                                    <div key={orderId} className="p-5">
                                        <div className="flex items-start justify-between gap-4">
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {orderNumber}
                                                </p>
                                                <p className="mt-0.5 text-xs text-gray-400">
                                                    {formatDate(date)}
                                                </p>
                                            </div>

                                            <span
                                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}
                                            >
                                                {displayStatus}
                                            </span>
                                        </div>

                                        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-sm">
                                            <span className="text-gray-500">
                                                {items.length} {items.length === 1 ? "item" : "items"}
                                            </span>
                                            <span className="font-semibold text-gray-900">
                                                Rs. {Number(total).toLocaleString()}
                                            </span>
                                        </div>

                                        <Link
                                            to={`/orders/${orderId}${isResaleOrder ? "?type=resale" : ""}`}
                                            className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-white py-2 text-xs font-medium text-gray-900 transition hover:bg-gray-50 shadow-xs"
                                        >
                                            View details
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
};

export default Orders;