import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import paymentService from "../../services/paymentService";

const statuses = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

const ORDER_STATUS_MAP = {
    Pending: 0,
    Processing: 1,
    Shipped: 2,
    Delivered: 3,
    Cancelled: 4,
};

const isResaleOrder = (order) => {
    const items = order?.items || order?.orderItems || [];
    const orderType = order?.orderType || order?.type;

    return Boolean(
        order?.isResale ||
        order?.resaleListingId != null ||
        (typeof orderType === "string" &&
            orderType.toLowerCase() === "resale") ||
        items.some(
            (item) => item?.isResale || item?.resaleListingId != null
        )
    );
};

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
            const raw = response.data;
            const list = Array.isArray(raw)
                ? raw
                : raw?.orders ||
                  raw?.items ||
                  raw?.data ||
                  [];
            const regularOrders = list.filter((order) => !isResaleOrder(order));
            setOrders(regularOrders);
            console.log(
                "[AdminOrders] Loaded regular orders from API:",
                regularOrders
            );
        } catch (err) {
            setError(err.userMessage || "Failed to load orders.");
        } finally {
            setLoading(false);
        }
    };

    const getCustomerName = (order) => {
        const candidates = [
            order?.customerName,
            order?.CustomerName,
            order?.customer?.fullName,
            order?.customer?.userName,
            order?.customer?.name,
            order?.userName,
            order?.user?.fullName,
            order?.user?.userName,
            order?.user?.name,
            order?.buyerName,
            order?.customerEmail,
            order?.CustomerEmail,
            order?.customer?.email,
            order?.user?.email,
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }

        return "Unknown Customer";
    };

    const getCustomerEmail = (order) => {
        const candidates = [
            order?.customerEmail,
            order?.CustomerEmail,
            order?.customer?.email,
            order?.user?.email,
            order?.email,
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }

        return "—";
    };

    const getCustomerPhone = (order) => {
        const candidates = [
            order?.customerPhone,
            order?.CustomerPhone,
            order?.shippingPhone,
            order?.phoneNumber,
            order?.customer?.phoneNumber,
            order?.customer?.phone,
        ];

        for (const candidate of candidates) {
            if (typeof candidate === "string" && candidate.trim().length > 0) {
                return candidate.trim();
            }
        }

        return "—";
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

    const STATUS_DISPLAY_MAP = {
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
        Pending: "Pending",
        Processing: "Processing",
        Shipped: "Shipped",
        Delivered: "Delivered",
        Cancelled: "Cancelled",
    };

    const getStatus = (order) => {
        const raw = order?.status;
        if (raw === null || raw === undefined) return "Pending";
        if (STATUS_DISPLAY_MAP[raw] !== undefined) {
            return STATUS_DISPLAY_MAP[raw];
        }
        return String(raw);
    };

    const PAYMENT_METHOD_MAP = {
        0: "eSewa",
        1: "Khalti",
        2: "COD",
        3: "COD",
        "0": "eSewa",
        "1": "Khalti",
        "2": "COD",
        "3": "COD",
        Esewa: "eSewa",
        Khalti: "Khalti",
        CashOnDelivery: "COD",
        COD: "COD",
    };

    const getPaymentMethod = (order) => {
        const raw =
            order.paymentMethod ??
            order.payments?.[0]?.paymentMethod ??
            order.payment?.paymentMethod ??
            null;

        if (raw === null || raw === undefined) return "—";

        // Map numeric IDs to names
        if (PAYMENT_METHOD_MAP[raw] !== undefined) {
            return PAYMENT_METHOD_MAP[raw];
        }

        // If it's a string like "Khalti" or "COD", return as-is
        const str = String(raw).trim();
        if (str === "" || (!isNaN(Number(str)) && str !== "")) return "—";

        return str;
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

    const isCodOrder = (order) => {
        const method = getPaymentMethod(order);
        return method === "COD";
    };

    const handleStatusChange = async (orderId, status) => {
        try {
            setUpdatingId(orderId);
            setError("");
            setSuccess("");

            const statusValue = ORDER_STATUS_MAP[status] ?? status;

            const response = await api.patch(`/orders/admin/${orderId}/status`, {
                status: statusValue,
            });

            const updatedOrder = response?.data;

            // Auto-mark payment as Paid for COD orders when delivered
            if (status === "Delivered") {
                const targetOrder = orders.find((o) => o.id === orderId);
                if (targetOrder && isCodOrder(targetOrder)) {
                    try {
                        await paymentService.markCodPaid(orderId);
                    } catch (payErr) {
                        console.warn(
                            "[AdminOrders] Could not auto-mark COD payment as paid:",
                            payErr
                        );
                    }
                }
            }

            setOrders((currentOrders) =>
                currentOrders.map((order) =>
                    order.id === orderId
                        ? {
                              ...order,
                              ...(updatedOrder &&
                              typeof updatedOrder === "object"
                                  ? updatedOrder
                                  : {}),
                              status,
                              // Optimistically reflect payment status in UI
                              ...(status === "Delivered" && isCodOrder(order)
                                  ? { paymentStatus: 1 }
                                  : {}),
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
        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="mb-6 min-w-0 sm:mb-8">
                <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                    Orders
                </h1>

                <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-gray-600">
                    View customer orders and manage their delivery status.
                </p>
            </div>

            {error && (
                <div className="mb-5 break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700 sm:mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-5 break-words rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm leading-6 text-green-700 sm:mb-6">
                    {success}
                </div>
            )}

            <div className="mb-5 grid grid-cols-1 gap-3 sm:mb-6 sm:grid-cols-2 sm:gap-4 md:grid-cols-4">
                <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="break-words text-sm text-gray-500">
                        Total Orders
                    </p>

                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                        {orders.length}
                    </p>
                </div>

                <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="break-words text-sm text-gray-500">
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

                <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="break-words text-sm text-gray-500">
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

                <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                    <p className="break-words text-sm text-gray-500">
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

            <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="flex min-w-0 flex-col gap-2 border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
                    <h2 className="break-words font-semibold text-gray-900">
                        All Orders
                    </h2>

                    <p className="text-sm text-gray-500">
                        {orders.length} order
                        {orders.length !== 1 ? "s" : ""}
                    </p>
                </div>

                {loading ? (
                    <div className="w-full overflow-x-auto">
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

                            <tbody className="divide-y divide-gray-100 animate-pulse">
                                {[...Array(5)].map((_, i) => (
                                    <tr key={i}>
                                        <td className="px-6 py-5">
                                            <div className="h-4 w-20 rounded bg-gray-100" />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="h-4 w-28 rounded bg-gray-100" />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="h-4 w-24 rounded bg-gray-100" />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="h-4 w-20 rounded bg-gray-100" />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="h-4 w-24 rounded bg-gray-100" />
                                        </td>

                                        <td className="px-6 py-5">
                                            <div className="h-6 w-20 rounded-full bg-gray-100" />
                                        </td>

                                        <td className="px-6 py-5 text-right">
                                            <div className="ml-auto h-9 w-32 rounded-lg bg-gray-100" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="px-4 py-12 text-center text-sm text-gray-500 sm:px-6">
                        No orders found.
                    </div>
                ) : (
                    <div className="w-full overflow-x-auto">
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
                                            className="transition-colors hover:bg-gray-50"
                                        >
                                            <td className="max-w-[180px] px-6 py-5 text-sm text-gray-700">
                                                <Link
                                                    to={`/orders/${order.id}?admin=true`}
                                                    className="break-words font-medium text-gray-900 underline decoration-gray-300 underline-offset-2 transition hover:decoration-gray-900"
                                                >
                                                    #{getOrderNumber(order)}
                                                </Link>
                                            </td>

                                            <td className="max-w-[220px] px-6 py-5 text-sm text-gray-700">
                                                <span className="break-words">
                                                    {getCustomerName(order)}
                                                </span>
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                                                {getOrderDate(order)}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                                                {formatPrice(getOrderTotal(order))}
                                            </td>

                                            <td className="whitespace-nowrap px-6 py-5 text-sm text-gray-700">
                                                {getPaymentMethod(order)}
                                            </td>

                                            <td className="px-6 py-5">
                                                <span
                                                    className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${getStatusClasses(
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
                                                        disabled={
                                                            updatingId === order.id
                                                        }
                                                        onChange={(e) =>
                                                            handleStatusChange(
                                                                order.id,
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full max-w-[150px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900 disabled:cursor-not-allowed disabled:opacity-60"
                                                    >
                                                        {statuses.map(
                                                            (orderStatus) => (
                                                                <option
                                                                    key={
                                                                        orderStatus
                                                                    }
                                                                    value={
                                                                        orderStatus
                                                                    }
                                                                >
                                                                    {
                                                                        orderStatus
                                                                    }
                                                                </option>
                                                            )
                                                        )}
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
        </main>
    );
};

export default AdminOrders;