import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import businessTypeService from "../../services/businessTypeService";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
import api from "../../services/api";
import { ArrowRight } from "lucide-react";

const AdminDashboard = () => {
    const [stats, setStats] = useState({
        businessTypes: 0,
        categories: 0,
        products: 0,
        orders: 0,
    });

    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadDashboard = async () => {
            try {
                setLoading(true);
                setError("");

                const [
                    businessTypesResponse,
                    categoriesResponse,
                    productsResponse,
                    ordersResponse,
                ] = await Promise.all([
                    businessTypeService.getAll(),
                    categoryService.getAll(),
                    productService.getAll(),
                    api.get("/orders/admin"),
                ]);

                const businessTypes = Array.isArray(
                    businessTypesResponse
                )
                    ? businessTypesResponse
                    : businessTypesResponse?.businessTypes ||
                    businessTypesResponse?.items ||
                    businessTypesResponse?.data ||
                    [];

                const categories = Array.isArray(
                    categoriesResponse
                )
                    ? categoriesResponse
                    : categoriesResponse?.categories ||
                    categoriesResponse?.items ||
                    categoriesResponse?.data ||
                    [];

                const products = Array.isArray(
                    productsResponse
                )
                    ? productsResponse
                    : productsResponse?.products ||
                    productsResponse?.items ||
                    productsResponse?.data ||
                    [];

                const orders = Array.isArray(ordersResponse.data)
                    ? ordersResponse.data
                    : ordersResponse.data?.orders ||
                    ordersResponse.data?.items ||
                    ordersResponse.data?.data ||
                    [];

                const sortedOrders = [...orders]
                    .sort((a, b) => {
                        const dateA = new Date(
                            a.orderDate ||
                            a.createdAt ||
                            a.date ||
                            0
                        );

                        const dateB = new Date(
                            b.orderDate ||
                            b.createdAt ||
                            b.date ||
                            0
                        );

                        return dateB - dateA;
                    })
                    .slice(0, 5);

                setStats({
                    businessTypes: businessTypes.length,
                    categories: categories.length,
                    products: products.length,
                    orders: orders.length,
                });

                setRecentOrders(sortedOrders);
            } catch (err) {
                setError(
                    err.userMessage ||
                    err.response?.data?.message ||
                    "Unable to load the admin dashboard."
                );
            } finally {
                setLoading(false);
            }
        };

        loadDashboard();
    }, []);

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

    const formatDate = (date) => {
        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return "—";
        }

        return parsedDate.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getOrderNumber = (order) => {
        return (
            order?.orderNumber ||
            order?.number ||
            order?.id ||
            "—"
        );
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

        return "Customer";
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
        Pending: "Pending",
        Processing: "Processing",
        Shipped: "Shipped",
        Delivered: "Delivered",
        Cancelled: "Cancelled",
    };

    const getPaymentMethod = (order) => {
        const raw =
            order?.paymentMethod ??
            order?.payments?.[0]?.paymentMethod ??
            order?.payment?.paymentMethod ??
            null;

        if (raw === null || raw === undefined) return "—";

        if (PAYMENT_METHOD_MAP[raw] !== undefined) {
            return PAYMENT_METHOD_MAP[raw];
        }

        const str = String(raw).trim();
        if (str === "" || (!isNaN(Number(str)) && str !== "")) return "—";

        return str;
    };

    const getOrderStatus = (order) => {
        const raw = order?.status ?? order?.orderStatus;
        if (raw === null || raw === undefined) return "Pending";
        if (ORDER_STATUS_MAP[raw] !== undefined) {
            return ORDER_STATUS_MAP[raw];
        }
        return String(raw);
    };

    const getOrderTotal = (order) => {
        return (
            order?.totalAmount ??
            order?.total ??
            order?.amount ??
            0
        );
    };

    const getStatusClasses = (status) => {
        const normalized = String(status).toLowerCase();

        if (normalized === "delivered") {
            return "bg-green-50 text-green-700";
        }

        if (normalized === "shipped") {
            return "bg-blue-50 text-blue-700";
        }

        if (normalized === "processing") {
            return "bg-yellow-50 text-yellow-700";
        }

        if (normalized === "cancelled") {
            return "bg-red-50 text-red-700";
        }

        return "bg-gray-100 text-gray-700";
    };

    const statCards = [
        {
            title: "Business Types",
            value: stats.businessTypes,
            description: "Available business categories",
            href: "/admin/business-types",
        },
        {
            title: "Categories",
            value: stats.categories,
            description: "Equipment categories",
            href: "/admin/categories",
        },
        {
            title: "Products",
            value: stats.products,
            description: "Equipment in catalog",
            href: "/admin/products",
        },
        {
            title: "Orders",
            value: stats.orders,
            description: "Customer orders",
            href: "/admin/orders",
        },
    ];

    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 text-gray-900">
            {/* Header */}
            <header className="hidden border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/admin"
                        className="text-xl font-bold tracking-tight sm:text-2xl"
                    >
                        BizBox
                    </Link>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <Link
                            to="/"
                            className="hidden text-sm text-gray-600 transition hover:text-black sm:block"
                        >
                            View Store
                        </Link>

                        <span className="rounded-full bg-black px-3 py-1.5 text-xs font-medium text-white sm:px-4 sm:py-2">
                            Admin
                        </span>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
                {/* Heading */}
                <div className="min-w-0">
                    <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                        Dashboard
                    </h1>

                    <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-gray-600">
                        Overview of your catalog and customer orders.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-6 flex min-w-0 flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-4 sm:mt-8 sm:p-5 md:flex-row md:items-center md:justify-between">
                        <p className="min-w-0 break-words text-sm leading-6 text-red-700">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                window.location.reload()
                            }
                            className="w-full shrink-0 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:w-auto"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Stats */}
                <section className="mt-8 grid min-w-0 grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Link
                            key={card.title}
                            to={card.href}
                            className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:p-5"
                        >
                            <div className="flex min-w-0 items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <p className="break-words text-sm font-medium text-gray-500">
                                        {card.title}
                                    </p>

                                    {loading ? (
                                        <div className="mt-4 h-9 w-20 rounded-lg bg-gray-200" />
                                    ) : (
                                        <p className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                                            {card.value}
                                        </p>
                                    )}
                                </div>

                                <span className="shrink-0 text-gray-400">
                                    <ArrowRight size={15} />
                                </span>
                            </div>

                            <p className="mt-4 break-words text-xs leading-5 text-gray-500 sm:mt-5">
                                {card.description}
                            </p>
                        </Link>
                    ))}
                </section>

                {/* Recent Orders */}
                <section className="mt-5 min-w-0 overflow-hidden rounded-lg border border-gray-200 bg-white sm:mt-6">
                    <div className="flex min-w-0 flex-col gap-3 border-b border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-5">
                        <div className="min-w-0">
                            <h2 className="break-words text-base font-semibold sm:text-lg">
                                Recent Orders
                            </h2>

                            <p className="mt-1 break-words text-xs text-gray-500">
                                Latest customer activity
                            </p>
                        </div>

                        <Link
                            to="/admin/orders"
                            className="w-fit shrink-0 text-sm font-medium text-gray-900 transition-colors hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                        >
                            View all
                        </Link>
                    </div>

                    {loading ? (
                        <div className="divide-y divide-gray-100">
                            {[1, 2, 3, 4, 5].map(
                                (item) => (
                                    <div
                                        key={item}
                                        className="px-4 py-5 sm:px-6"
                                    >
                                        <div className="h-4 w-32 max-w-full rounded bg-gray-200" />
                                        <div className="mt-3 h-3 w-48 max-w-full rounded bg-gray-100" />
                                    </div>
                                )
                            )}
                        </div>
                    ) : recentOrders.length === 0 ? (
                        <div className="px-4 py-12 text-center sm:px-6 sm:py-16">
                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 sm:h-14 sm:w-14">
                                <span className="text-xl text-gray-400">
                                    —
                                </span>
                            </div>

                            <h3 className="mt-5 font-semibold">
                                No orders yet
                            </h3>

                            <p className="mt-2 break-words text-sm text-gray-500">
                                Customer orders will appear here.
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {recentOrders.map((order) => (
                                <Link
                                    key={
                                        order.id ||
                                        order.orderNumber
                                    }
                                    to={`/orders/${order.id}?admin=true`}
                                    className="flex min-w-0 flex-col gap-4 px-4 py-4 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-400 sm:px-6 sm:py-5 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="min-w-0">
                                        <p className="break-words text-sm font-semibold">
                                            #
                                            {getOrderNumber(
                                                order
                                            )}
                                        </p>

                                        <p className="mt-1 break-words text-xs leading-5 text-gray-500">
                                            {
                                                getCustomerName(
                                                    order
                                                )
                                            }
                                            {" • "}
                                            {formatDate(
                                                order.orderDate ||
                                                order.createdAt ||
                                                order.date
                                            )}
                                            {" • "}
                                            <span>
                                                {getPaymentMethod(order)}
                                            </span>
                                        </p>
                                    </div>

                                    <div className="flex min-w-0 items-center justify-between gap-3 sm:gap-5 md:shrink-0 md:justify-end">
                                        <span
                                            className={`shrink-0 rounded-full px-2.5 py-1.5 text-xs font-medium sm:px-3 ${getStatusClasses(
                                                getOrderStatus(
                                                    order
                                                )
                                            )}`}
                                        >
                                            {getOrderStatus(
                                                order
                                            )}
                                        </span>

                                        <span className="shrink-0 text-sm font-semibold">
                                            {formatCurrency(
                                                getOrderTotal(
                                                    order
                                                )
                                            )}
                                        </span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </section>

                {/* Admin Information */}
                <section className="mt-6 hidden rounded-3xl bg-black p-5 text-white sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div className="min-w-0">
                            <p className="break-words text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                                BizBox Administration
                            </p>

                            <h2 className="mt-3 break-words text-xl font-semibold sm:text-2xl">
                                Keep the catalog ready for every
                                business.
                            </h2>

                            <p className="mt-3 max-w-2xl break-words text-sm leading-6 text-gray-400">
                                Manage equipment and orders from one
                                centralized administration area.
                            </p>
                        </div>

                        <Link
                            to="/admin/products"
                            className="inline-flex w-full shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:ring-offset-black sm:w-auto"
                        >
                            Manage Catalog
                        </Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;