import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import orderService from "../services/orderService";
import { resolveImageUrl } from "../utils/imageUrl";

const fallbackImage =
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80";

const statusSteps = [
    {
        key: "Pending",
        label: "Order Placed",
        description: "Your order has been received.",
    },
    {
        key: "Processing",
        label: "Processing",
        description: "Your order is being prepared.",
    },
    {
        key: "Shipped",
        label: "Shipped",
        description: "Your order is on its way.",
    },
    {
        key: "Delivered",
        label: "Delivered",
        description: "Your order has been delivered.",
    },
];

const statusAliases = {
    pending: "Pending",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
    cancelled: "Cancelled",
};

const OrderDetails = () => {
    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        if (id) {
            loadOrder();
        }
    }, [id]);

    const loadOrder = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await orderService.getById(id);

            setOrder(data);
        } catch (err) {
            setError(
                err.userMessage ||
                "Unable to load this order. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const normalizeStatus = (status) => {
        if (!status) {
            return "Pending";
        }

        const value = String(status).toLowerCase();

        return (
            statusAliases[value] ||
            String(status)
        );
    };

    const getItems = () => {
        if (Array.isArray(order?.items)) {
            return order.items;
        }

        if (Array.isArray(order?.orderItems)) {
            return order.orderItems;
        }

        if (Array.isArray(order?.order?.items)) {
            return order.order.items;
        }

        return [];
    };

    const items = getItems();

    const getProduct = (item) => {
        return (
            item.product ||
            item.productDetails ||
            item
        );
    };

    const getProductName = (item) => {
        const product = getProduct(item);

        return (
            product.name ||
            item.productName ||
            "Equipment"
        );
    };

    const getProductImage = (item) => {
        const product = getProduct(item);
        const raw = product.imageUrl || product.image;

        return (
            resolveImageUrl(raw) ||
            fallbackImage
        );
    };

    const getCategoryName = (item) => {
        const product = getProduct(item);

        return (
            product.category?.name ||
            product.categoryName ||
            item.categoryName ||
            "Equipment"
        );
    };

    const getQuantity = (item) => {
        return Number(item.quantity) || 1;
    };

    const getUnitPrice = (item) => {
        const product = getProduct(item);

        return Number(
            item.unitPrice ??
            item.price ??
            product.price ??
            0
        );
    };

    const getItemTotal = (item) => {
        const quantity = getQuantity(item);

        if (
            item.totalPrice !== undefined &&
            item.totalPrice !== null
        ) {
            return Number(item.totalPrice);
        }

        if (
            item.subtotal !== undefined &&
            item.subtotal !== null
        ) {
            return Number(item.subtotal);
        }

        return (
            getUnitPrice(item) * quantity
        );
    };

    const getOrderTotal = () => {
        if (!order) {
            return 0;
        }

        return Number(
            order.totalAmount ??
            order.total ??
            order.grandTotal ??
            order.orderTotal ??
            items.reduce(
                (sum, item) =>
                    sum + getItemTotal(item),
                0
            )
        );
    };

    const getPaymentMethod = () => {
        const method =
            order?.paymentMethod ??
            order?.payment?.paymentMethod;

        if (method === 0 || method === "Esewa") {
            return "eSewa";
        }

        if (method === 1 || method === "Khalti") {
            return "Khalti";
        }

        if (
            method === 2 ||
            method === "CashOnDelivery"
        ) {
            return "Cash on Delivery";
        }

        if (typeof method === "string") {
            return method;
        }

        return "Not specified";
    };

    const getPaymentStatus = () => {
        return (
            order?.paymentStatus ??
            order?.payment?.status ??
            "Pending"
        );
    };

    const getOrderDate = () => {
        const date =
            order?.createdAt ??
            order?.orderDate ??
            order?.createdDate;

        if (!date) {
            return "—";
        }

        const parsedDate = new Date(date);

        if (Number.isNaN(parsedDate.getTime())) {
            return date;
        }

        return parsedDate.toLocaleDateString(
            "en-US",
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );
    };

    const getOrderNumber = () => {
        return (
            order?.orderNumber ||
            order?.id ||
            id
        );
    };

    const currentStatus = normalizeStatus(
        order?.status
    );

    const currentStepIndex =
        statusSteps.findIndex(
            (step) => step.key === currentStatus
        );

    const isCancelled =
        currentStatus === "Cancelled";

    return (
        <div className="min-h-screen bg-[#faf8fe] text-[#1a1b1f]">
            {/* Header */}
            <header className="hidden fixed left-0 right-0 top-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:px-12">
                    <Link
                        to="/"
                        className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                            B
                        </div>

                        <span className="text-[17px] font-semibold tracking-tight">
                            BizBox
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-7 xl:flex">
                        <Link
                            to="/equipment"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            Business Kits
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            Resale & Trade-in
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            How It Works
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            Support
                        </Link>
                    </nav>

                    <div className="flex items-center gap-2">
                        <Link
                            to="/cart"
                            className="flex h-9 items-center gap-2 rounded-full bg-[#eeedf3] px-3 text-black"
                        >
                            <span className="text-[17px]">
                                🛍
                            </span>

                            <span className="text-[11px] font-medium">
                                Cart
                            </span>
                        </Link>

                        <Link
                            to="/orders"
                            className="hidden h-9 items-center rounded-full bg-black px-4 text-[12px] font-medium text-white sm:flex"
                        >
                            Orders
                        </Link>

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm text-white">
                            U
                        </div>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-[11px] text-[#4c4546]">
                    <Link
                        to="/orders"
                        className="transition-colors hover:text-black"
                    >
                        Orders
                    </Link>

                    <span>/</span>

                    <span className="text-black">
                        Order Details
                    </span>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="animate-pulse">
                        <div className="h-12 w-72 rounded bg-[#eeedf3]" />

                        <div className="mt-4 h-4 w-52 rounded bg-[#eeedf3]" />

                        <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
                            <div className="space-y-6">
                                <div className="h-64 rounded-3xl bg-white" />
                                <div className="h-80 rounded-3xl bg-white" />
                            </div>

                            <div className="h-96 rounded-3xl bg-white" />
                        </div>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <section className="flex min-h-112.5 flex-col items-center justify-center rounded-3xl bg-white px-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6] text-xl font-semibold text-[#93000a]">
                            !
                        </div>

                        <h1 className="mt-6 text-2xl font-semibold tracking-tight">
                            Unable to load order
                        </h1>

                        <p className="mt-3 max-w-md text-[13px] leading-6 text-[#4c4546]">
                            {error}
                        </p>

                        <div className="mt-7 flex gap-3">
                            <button
                                type="button"
                                onClick={loadOrder}
                                className="h-11 rounded-full bg-black px-6 text-[12px] font-semibold text-white"
                            >
                                Try Again
                            </button>

                            <Link
                                to="/orders"
                                className="flex h-11 items-center rounded-full bg-[#eeedf3] px-6 text-[12px] font-semibold text-black"
                            >
                                Back to Orders
                            </Link>
                        </div>
                    </section>
                )}

                {/* Order */}
                {!loading && !error && order && (
                    <>
                        {/* Page Heading */}
                        <section className="mb-10">
                            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
                                <div>
                                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9e7ed] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-black">
                                        <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                        Order Details
                                    </span>

                                    <h1 className="mt-5 text-[38px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[48px]">
                                        Order #{getOrderNumber()}
                                    </h1>

                                    <p className="mt-3 text-[13px] text-[#4c4546]">
                                        Placed on {getOrderDate()}
                                    </p>
                                </div>

                                <div
                                    className={`inline-flex w-fit items-center rounded-full px-4 py-2 text-[11px] font-semibold ${isCancelled
                                            ? "bg-[#ffdad6] text-[#93000a]"
                                            : currentStatus ===
                                                "Delivered"
                                                ? "bg-[#dff5df] text-[#176b2c]"
                                                : "bg-black text-white"
                                        }`}
                                >
                                    {currentStatus}
                                </div>
                            </div>
                        </section>

                        {/* Status Timeline */}
                        <section className="mb-8 rounded-3xl bg-white p-7 sm:p-8">
                            <div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                    Order Progress
                                </span>

                                <h2 className="mt-2 text-[20px] font-semibold tracking-tight">
                                    Status Timeline
                                </h2>
                            </div>

                            {isCancelled ? (
                                <div className="mt-7 rounded-2xl bg-[#ffdad6] p-5">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#93000a] text-sm text-white">
                                            ×
                                        </div>

                                        <div>
                                            <p className="text-[13px] font-semibold text-[#93000a]">
                                                Order Cancelled
                                            </p>

                                            <p className="mt-1 text-[11px] text-[#93000a]/70">
                                                This order is no longer being
                                                processed.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="mt-8">
                                    <div className="hidden md:block">
                                        <div className="relative">
                                            <div className="absolute left-[10%] right-[10%] top-5 h-px bg-[#dedce2]" />

                                            <div
                                                className="absolute left-[10%] top-5 h-px bg-black transition-all"
                                                style={{
                                                    width:
                                                        currentStepIndex <=
                                                            0
                                                            ? "0%"
                                                            : `${Math.min(
                                                                (currentStepIndex /
                                                                    (statusSteps.length -
                                                                        1)) *
                                                                80,
                                                                80
                                                            )}%`,
                                                }}
                                            />

                                            <div className="relative grid grid-cols-4">
                                                {statusSteps.map(
                                                    (step, index) => {
                                                        const completed =
                                                            index <=
                                                            currentStepIndex;

                                                        const active =
                                                            index ===
                                                            currentStepIndex;

                                                        return (
                                                            <div
                                                                key={step.key}
                                                                className="flex flex-col items-center text-center"
                                                            >
                                                                <div
                                                                    className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white text-[11px] font-semibold ${completed
                                                                            ? "bg-black text-white"
                                                                            : "bg-[#eeedf3] text-[#8d8889]"
                                                                        }`}
                                                                >
                                                                    {completed
                                                                        ? "✓"
                                                                        : index + 1}
                                                                </div>

                                                                <p
                                                                    className={`mt-4 text-[11px] font-semibold ${active
                                                                            ? "text-black"
                                                                            : completed
                                                                                ? "text-[#4c4546]"
                                                                                : "text-[#9b9697]"
                                                                        }`}
                                                                >
                                                                    {step.label}
                                                                </p>

                                                                <p className="mt-1 max-w-32.5 text-[10px] leading-4 text-[#8d8889]">
                                                                    {
                                                                        step.description
                                                                    }
                                                                </p>
                                                            </div>
                                                        );
                                                    }
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-5 md:hidden">
                                        {statusSteps.map(
                                            (step, index) => {
                                                const completed =
                                                    index <=
                                                    currentStepIndex;

                                                const active =
                                                    index ===
                                                    currentStepIndex;

                                                return (
                                                    <div
                                                        key={step.key}
                                                        className="flex gap-4"
                                                    >
                                                        <div className="flex flex-col items-center">
                                                            <div
                                                                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${completed
                                                                        ? "bg-black text-white"
                                                                        : "bg-[#eeedf3] text-[#8d8889]"
                                                                    }`}
                                                            >
                                                                {completed
                                                                    ? "✓"
                                                                    : index + 1}
                                                            </div>

                                                            {index !==
                                                                statusSteps.length -
                                                                1 && (
                                                                    <div
                                                                        className={`mt-2 h-8 w-px ${index <
                                                                                currentStepIndex
                                                                                ? "bg-black"
                                                                                : "bg-[#dedce2]"
                                                                            }`}
                                                                    />
                                                                )}
                                                        </div>

                                                        <div className="pt-1">
                                                            <p
                                                                className={`text-[12px] font-semibold ${active
                                                                        ? "text-black"
                                                                        : completed
                                                                            ? "text-[#4c4546]"
                                                                            : "text-[#9b9697]"
                                                                    }`}
                                                            >
                                                                {step.label}
                                                            </p>

                                                            <p className="mt-1 text-[10px] leading-5 text-[#8d8889]">
                                                                {
                                                                    step.description
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                        )}
                                    </div>
                                </div>
                            )}
                        </section>

                        {/* Main Content */}
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
                            {/* Left */}
                            <div className="space-y-8">
                                {/* Ordered Items */}
                                <section className="rounded-3xl bg-white px-6 sm:px-8">
                                    <div className="flex items-center justify-between border-b border-black/5 py-6">
                                        <div>
                                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                                Order Contents
                                            </span>

                                            <h2 className="mt-1 text-[18px] font-semibold">
                                                Ordered Items
                                            </h2>
                                        </div>

                                        <span className="text-[11px] text-[#4c4546]">
                                            {items.length}{" "}
                                            {items.length === 1
                                                ? "product"
                                                : "products"}
                                        </span>
                                    </div>

                                    {items.length === 0 ? (
                                        <div className="py-12 text-center text-[13px] text-[#4c4546]">
                                            No items found for this
                                            order.
                                        </div>
                                    ) : (
                                        <div>
                                            {items.map(
                                                (item, index) => {
                                                    const quantity =
                                                        getQuantity(item);

                                                    const unitPrice =
                                                        getUnitPrice(item);

                                                    const itemTotal =
                                                        getItemTotal(item);

                                                    return (
                                                        <div
                                                            key={
                                                                item.id ||
                                                                item.productId ||
                                                                index
                                                            }
                                                            className={`flex flex-col gap-5 py-6 sm:flex-row ${index !== 0
                                                                ? "border-t border-black/5"
                                                                    : ""
                                                                }`}
                                                        >
                                                            <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-[#f4f3f8]">
                                                                <img
                                                                    src={getProductImage(
                                                                        item
                                                                    )}
                                                                    alt={getProductName(
                                                                        item
                                                                    )}
                                                                    className="h-full w-full object-cover"
                                                                    onError={(
                                                                        event
                                                                    ) => {
                                                                        event.currentTarget.src =
                                                                            fallbackImage;
                                                                    }}
                                                                />
                                                            </div>

                                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                                                                <div className="flex items-start justify-between gap-4">
                                                                    <div>
                                                                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                                                            {getCategoryName(
                                                                                item
                                                                            )}
                                                                        </span>

                                                                        <h3 className="mt-1 text-[15px] font-semibold">
                                                                            {getProductName(
                                                                                item
                                                                            )}
                                                                        </h3>
                                                                    </div>

                                                                    <span className="shrink-0 text-[15px] font-semibold">
                                                                        $
                                                                        {itemTotal.toLocaleString()}
                                                                    </span>
                                                                </div>

                                                                <div className="flex items-center justify-between gap-4 text-[11px] text-[#4c4546]">
                                                                    <span>
                                                                        $
                                                                        {unitPrice.toLocaleString()}{" "}
                                                                        × {quantity}
                                                                    </span>

                                                                    <span>
                                                                        Quantity:{" "}
                                                                        {quantity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                }
                                            )}
                                        </div>
                                    )}
                                </section>

                                {/* Shipping Address */}
                                <section className="rounded-3xl bg-white p-7 sm:p-8">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                        Delivery
                                    </span>

                                    <h2 className="mt-2 text-[20px] font-semibold tracking-tight">
                                        Shipping Address
                                    </h2>

                                    <div className="mt-6 rounded-2xl bg-[#f4f3f8] p-5">
                                        <div className="flex gap-4">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm">
                                                📍
                                            </div>

                                            <div>
                                                <p className="text-[12px] font-semibold">
                                                    Delivery Address
                                                </p>

                                                <p className="mt-2 text-[12px] leading-6 text-[#4c4546]">
                                                    {order.shippingAddress ||
                                                        order.deliveryAddress ||
                                                        "No shipping address provided."}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right */}
                            <aside className="space-y-4 lg:sticky lg:top-24">
                                {/* Order Summary */}
                                <section className="rounded-3xl bg-black p-7 text-white">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                                        Summary
                                    </span>

                                    <h2 className="mt-2 text-[22px] font-semibold tracking-tight">
                                        Order Summary
                                    </h2>

                                    <div className="my-7 h-px bg-white/10" />

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between text-[13px]">
                                            <span className="text-white/50">
                                                Items
                                            </span>

                                            <span>
                                                {items.reduce(
                                                    (sum, item) =>
                                                        sum +
                                                        getQuantity(item),
                                                    0
                                                )}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-[13px]">
                                            <span className="text-white/50">
                                                Products
                                            </span>

                                            <span>
                                                {items.length}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between text-[13px]">
                                            <span className="text-white/50">
                                                Payment
                                            </span>

                                            <span>
                                                {getPaymentMethod()}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="my-7 h-px bg-white/10" />

                                    <div className="flex items-end justify-between">
                                        <div>
                                            <span className="text-[10px] uppercase tracking-wider text-white/40">
                                                Total
                                            </span>

                                            <p className="mt-1 text-[10px] text-white/40">
                                                Final order amount
                                            </p>
                                        </div>

                                        <span className="text-[25px] font-semibold tracking-tight">
                                            $
                                            {getOrderTotal().toLocaleString()}
                                        </span>
                                    </div>
                                </section>

                                {/* Payment */}
                                <section className="rounded-3xl bg-white p-6">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                        Payment
                                    </span>

                                    <div className="mt-4 flex items-center justify-between gap-4">
                                        <div>
                                            <p className="text-[13px] font-semibold">
                                                {getPaymentMethod()}
                                            </p>

                                            <p className="mt-1 text-[10px] text-[#4c4546]">
                                                Payment method
                                            </p>
                                        </div>

                                        <span
                                            className={`rounded-full px-3 py-1.5 text-[10px] font-semibold ${String(
                                                getPaymentStatus()
                                            ).toLowerCase() ===
                                                    "paid"
                                                    ? "bg-[#dff5df] text-[#176b2c]"
                                                    : "bg-[#eeedf3] text-[#4c4546]"
                                                }`}
                                        >
                                            {getPaymentStatus()}
                                        </span>
                                    </div>
                                </section>

                                {/* Order Info */}
                                <section className="rounded-3xl bg-white p-6">
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                        Information
                                    </span>

                                    <div className="mt-5 space-y-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <span className="text-[11px] text-[#4c4546]">
                                                Order ID
                                            </span>

                                            <span className="max-w-45 break-all text-right text-[11px] font-medium">
                                                {getOrderNumber()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[11px] text-[#4c4546]">
                                                Date
                                            </span>

                                            <span className="text-right text-[11px] font-medium">
                                                {getOrderDate()}
                                            </span>
                                        </div>

                                        <div className="flex items-center justify-between gap-4">
                                            <span className="text-[11px] text-[#4c4546]">
                                                Status
                                            </span>

                                            <span className="text-right text-[11px] font-medium">
                                                {currentStatus}
                                            </span>
                                        </div>
                                    </div>
                                </section>

                                <Link
                                    to="/orders"
                                    className="flex h-11 w-full items-center justify-center rounded-full bg-[#eeedf3] text-[12px] font-semibold text-black transition hover:bg-[#e4e2e9]"
                                >
                                    ← Back to Orders
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="flex h-11 w-full items-center justify-center rounded-full border border-black/8 bg-white text-[12px] font-semibold text-black transition hover:bg-[#f4f3f8]"
                                >
                                    Continue Shopping
                                </Link>
                            </aside>
                        </div>
                    </>
                )}
            </main>

            {/* Footer */}
            <footer className="hidden w-full bg-[#f4f3f8]">
                <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-12">
                    <div className="grid grid-cols-2 gap-8 pb-14 md:grid-cols-4 lg:gap-12">
                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                Shop by Business
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Coffee Shop
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Bakery
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Restaurant
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Salon
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                Services
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Business Kits
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Equipment
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Resale & Trade-in
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Support
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                Account
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/cart"
                                    className="hover:text-black"
                                >
                                    Cart
                                </Link>

                                <Link
                                    to="/orders"
                                    className="hover:text-black"
                                >
                                    Orders
                                </Link>

                                <Link
                                    to="/login"
                                    className="hover:text-black"
                                >
                                    Sign In
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                BizBox
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    About BizBox
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    How It Works
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Privacy
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Terms
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-black/6 pt-8 md:flex-row">
                        <p className="text-center text-[11px] text-[#4c4546] md:text-left">
                            © 2026 BizBox. Commercial equipment
                            for growing businesses.
                        </p>

                        <div className="flex items-center gap-6 text-[11px] text-[#4c4546]">
                            <span>Nepal</span>

                            <Link
                                to="/"
                                className="hover:text-black"
                            >
                                Legal
                            </Link>

                            <Link
                                to="/"
                                className="hover:text-black"
                            >
                                Site Map
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default OrderDetails;