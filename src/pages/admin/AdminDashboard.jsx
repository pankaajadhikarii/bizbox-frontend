import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import businessTypeService from "../../services/businessTypeService";
import categoryService from "../../services/categoryService";
import productService from "../../services/productService";
import api from "../../services/api";

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
        return (
            order?.customerName ||
            order?.customer?.fullName ||
            order?.customer?.name ||
            order?.userName ||
            "Customer"
        );
    };

    const getOrderStatus = (order) => {
        return (
            order?.status ||
            order?.orderStatus ||
            "Pending"
        );
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
        <div className="min-h-screen bg-gray-50 text-gray-900">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/admin"
                        className="text-2xl font-bold tracking-tight"
                    >
                        BizKit
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="hidden text-sm text-gray-600 transition hover:text-black sm:block"
                        >
                            View Store
                        </Link>

                        <span className="rounded-full bg-black px-4 py-2 text-xs font-medium text-white">
                            Admin
                        </span>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                {/* Heading */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        Administration
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                        Dashboard
                    </h1>

                    <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
                        Manage BizKit's equipment catalog, business
                        types, categories, orders, and marketplace
                        activity.
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mt-8 flex flex-col gap-4 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            onClick={() =>
                                window.location.reload()
                            }
                            className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Stats */}
                <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {statCards.map((card) => (
                        <Link
                            key={card.title}
                            to={card.href}
                            className="group rounded-3xl border border-gray-200 bg-white p-6 transition hover:-translate-y-0.5 hover:border-gray-400"
                        >
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">
                                        {card.title}
                                    </p>

                                    {loading ? (
                                        <div className="mt-4 h-9 w-20 animate-pulse rounded-lg bg-gray-200" />
                                    ) : (
                                        <p className="mt-3 text-3xl font-semibold tracking-tight">
                                            {card.value}
                                        </p>
                                    )}
                                </div>

                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition group-hover:bg-black group-hover:text-white">
                                    →
                                </div>
                            </div>

                            <p className="mt-5 text-xs text-gray-500">
                                {card.description}
                            </p>
                        </Link>
                    ))}
                </section>

                {/* Content Grid */}
                <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_320px]">
                    {/* Recent Orders */}
                    <section className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-semibold">
                                    Recent Orders
                                </h2>

                                <p className="mt-1 text-xs text-gray-500">
                                    Latest customer activity
                                </p>
                            </div>

                            <Link
                                to="/admin/orders"
                                className="text-sm font-medium text-gray-900 transition hover:text-gray-500"
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
                                            className="animate-pulse px-6 py-5"
                                        >
                                            <div className="h-4 w-32 rounded bg-gray-200" />
                                            <div className="mt-3 h-3 w-48 rounded bg-gray-100" />
                                        </div>
                                    )
                                )}
                            </div>
                        ) : recentOrders.length === 0 ? (
                            <div className="px-6 py-16 text-center">
                                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                    <span className="text-xl text-gray-400">
                                        —
                                    </span>
                                </div>

                                <h3 className="mt-5 font-semibold">
                                    No orders yet
                                </h3>

                                <p className="mt-2 text-sm text-gray-500">
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
                                        to={`/orders/${order.id
                                            }`}
                                        className="flex flex-col gap-4 px-6 py-5 transition hover:bg-gray-50 sm:flex-row sm:items-center sm:justify-between"
                                    >
                                        <div className="min-w-0">
                                            <p className="truncate text-sm font-semibold">
                                                #
                                                {getOrderNumber(
                                                    order
                                                )}
                                            </p>

                                            <p className="mt-1 text-xs text-gray-500">
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
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between gap-5 sm:justify-end">
                                            <span
                                                className={`rounded-full px-3 py-1.5 text-xs font-medium ${getStatusClasses(
                                                    getOrderStatus(
                                                        order
                                                    )
                                                )}`}
                                            >
                                                {getOrderStatus(
                                                    order
                                                )}
                                            </span>

                                            <span className="text-sm font-semibold">
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

                    {/* Quick Actions */}
                    <section className="h-fit rounded-3xl border border-gray-200 bg-white">
                        <div className="border-b border-gray-200 px-6 py-5">
                            <h2 className="text-lg font-semibold">
                                Quick Actions
                            </h2>

                            <p className="mt-1 text-xs text-gray-500">
                                Manage your store
                            </p>
                        </div>

                        <div className="space-y-3 p-5">
                            <Link
                                to="/admin/products"
                                className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4 transition hover:bg-gray-100"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        Manage Products
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Add or update equipment
                                    </p>
                                </div>

                                <span className="text-gray-400">
                                    →
                                </span>
                            </Link>

                            <Link
                                to="/admin/categories"
                                className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4 transition hover:bg-gray-100"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        Manage Categories
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Organize equipment
                                    </p>
                                </div>

                                <span className="text-gray-400">
                                    →
                                </span>
                            </Link>

                            <Link
                                to="/admin/business-types"
                                className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4 transition hover:bg-gray-100"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        Business Types
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Manage business categories
                                    </p>
                                </div>

                                <span className="text-gray-400">
                                    →
                                </span>
                            </Link>

                            <Link
                                to="/admin/orders"
                                className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4 transition hover:bg-gray-100"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        Manage Orders
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Process customer orders
                                    </p>
                                </div>

                                <span className="text-gray-400">
                                    →
                                </span>
                            </Link>

                            <Link
                                to="/admin/resale"
                                className="flex items-center justify-between rounded-2xl bg-gray-50 px-5 py-4 transition hover:bg-gray-100"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        Resale Marketplace
                                    </p>

                                    <p className="mt-1 text-xs text-gray-500">
                                        Manage resale listings
                                    </p>
                                </div>

                                <span className="text-gray-400">
                                    →
                                </span>
                            </Link>
                        </div>
                    </section>
                </div>

                {/* Admin Information */}
                <section className="mt-8 rounded-3xl bg-black p-7 text-white sm:p-8">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                                BizKit Administration
                            </p>

                            <h2 className="mt-3 text-2xl font-semibold">
                                Keep the catalog ready for every
                                business.
                            </h2>

                            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-400">
                                Manage equipment and orders from one
                                centralized administration area.
                            </p>
                        </div>

                        <Link
                            to="/admin/products"
                            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-gray-200"
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