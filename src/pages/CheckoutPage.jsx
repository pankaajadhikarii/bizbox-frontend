import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import cartService from "../services/cartService";
import orderService from "../services/orderService";
import { resolveImageUrl } from "../utils/imageUrl";

const fallbackImage =
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80";

const CheckoutPage = () => {
    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(2);

    const [error, setError] = useState("");
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        loadCart();
    }, []);

    const loadCart = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await cartService.getCart();

            setCart(data);
        } catch (err) {
            setError(
                err.userMessage ||
                "Unable to load your cart. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const getItems = () => {
        if (Array.isArray(cart)) {
            return cart;
        }

        return (
            cart?.items ||
            cart?.cartItems ||
            cart?.cart?.items ||
            []
        );
    };

    const items = getItems();

    const getProduct = (item) => {
        return item.product || item.productDetails || item;
    };

    const getProductId = (item) => {
        const product = getProduct(item);

        return item.productId || product.id;
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

    const getProductCategory = (item) => {
        const product = getProduct(item);

        return (
            product.category?.name ||
            product.categoryName ||
            "Equipment"
        );
    };

    const getPrice = (item) => {
        const product = getProduct(item);

        return Number(
            item.unitPrice ??
            item.price ??
            product.price ??
            0
        );
    };

    const getQuantity = (item) => {
        return Number(item.quantity) || 1;
    };

    const subtotal = items.reduce(
        (total, item) =>
            total +
            getPrice(item) *
            getQuantity(item),
        0
    );

    const totalItems = items.reduce(
        (total, item) =>
            total + getQuantity(item),
        0
    );

    const handlePlaceOrder = async (event) => {
        event.preventDefault();

        setValidationError("");
        setError("");

        if (!shippingAddress.trim()) {
            setValidationError(
                "Please enter your shipping address."
            );
            return;
        }

        if (items.length === 0) {
            setValidationError(
                "Your cart is empty."
            );
            return;
        }

        try {
            setPlacingOrder(true);

            const orderData = {
                shippingAddress:
                    shippingAddress.trim(),
                paymentMethod: Number(paymentMethod),
            };

            const response =
                await orderService.create(orderData);

            const orderId =
                response?.id ||
                response?.orderId ||
                response?.data?.id ||
                response?.data?.orderId;

            if (orderId) {
                navigate(`/orders/${orderId}`);
            } else {
                navigate("/orders");
            }
        } catch (err) {
            setError(
                err.userMessage ||
                "Unable to place your order. Please try again."
            );
        } finally {
            setPlacingOrder(false);
        }
    };

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

            {/* Main */}
            <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
                {/* Page Header */}
                <section className="pb-10">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9e7ed] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-black">
                            <span className="h-1.5 w-1.5 rounded-full bg-black" />
                            Checkout
                        </span>

                        <span className="text-[11px] text-[#cfc4c5]">
                            •
                        </span>

                        <span className="text-[11px] text-[#4c4546]">
                            Complete Your Order
                        </span>
                    </div>

                    <div className="mt-5">
                        <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[52px]">
                            Checkout.
                        </h1>

                        <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#4c4546]">
                            Confirm your delivery details and
                            payment method before placing your
                            order.
                        </p>
                    </div>
                </section>

                {/* Loading */}
                {loading ? (
                    <div className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
                        <div className="rounded-3xl bg-white p-8">
                            <div className="h-5 w-40 rounded bg-[#eeedf3]" />
                            <div className="mt-8 h-12 w-full rounded-xl bg-[#eeedf3]" />
                            <div className="mt-4 h-32 w-full rounded-xl bg-[#eeedf3]" />
                            <div className="mt-8 h-5 w-40 rounded bg-[#eeedf3]" />
                            <div className="mt-5 h-20 w-full rounded-2xl bg-[#eeedf3]" />
                            <div className="mt-3 h-20 w-full rounded-2xl bg-[#eeedf3]" />
                            <div className="mt-3 h-20 w-full rounded-2xl bg-[#eeedf3]" />
                        </div>

                        <div className="h-105 rounded-3xl bg-white" />
                    </div>
                ) : error && items.length === 0 ? (
                    <div className="rounded-3xl bg-white px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#ffdad6] text-2xl">
                            !
                        </div>

                        <h2 className="mt-6 text-2xl font-semibold">
                            Unable to load checkout
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#4c4546]">
                            {error}
                        </p>

                        <Link
                            to="/cart"
                            className="mt-7 inline-flex h-11 items-center rounded-full bg-black px-7 text-[12px] font-semibold text-white"
                        >
                            Back to Cart
                        </Link>
                    </div>
                ) : items.length === 0 ? (
                    /* Empty Cart */
                            <div className="flex min-h-112.5 flex-col items-center justify-center rounded-3xl bg-white px-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eeedf3] text-3xl">
                            🛍
                        </div>

                        <h2 className="mt-7 text-2xl font-semibold tracking-tight">
                            Your cart is empty
                        </h2>

                        <p className="mt-3 max-w-md text-[14px] leading-6 text-[#4c4546]">
                            Add some equipment before continuing
                            to checkout.
                        </p>

                        <Link
                            to="/equipment"
                            className="mt-7 flex h-11 items-center justify-center rounded-full bg-black px-7 text-[12px] font-semibold text-white transition hover:bg-[#333]"
                        >
                            Browse Equipment →
                        </Link>
                    </div>
                ) : (
                    <form
                        onSubmit={handlePlaceOrder}
                        className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start"
                    >
                        {/* Left Side */}
                        <div className="space-y-6">
                            {/* Shipping */}
                            <section className="rounded-3xl bg-white p-7 sm:p-8">
                                <div className="flex items-start justify-between gap-5">
                                    <div>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                            Step 01
                                        </span>

                                        <h2 className="mt-2 text-[20px] font-semibold tracking-tight">
                                            Delivery Address
                                        </h2>

                                        <p className="mt-1 text-[12px] leading-5 text-[#4c4546]">
                                            Where should we deliver your
                                            equipment?
                                        </p>
                                    </div>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeedf3] text-sm">
                                        01
                                    </div>
                                </div>

                                <div className="mt-7">
                                    <label
                                        htmlFor="shippingAddress"
                                        className="mb-2 block text-[11px] font-semibold uppercase tracking-wider text-[#4c4546]"
                                    >
                                        Shipping Address
                                    </label>

                                    <textarea
                                        id="shippingAddress"
                                        value={shippingAddress}
                                        onChange={(event) =>
                                            setShippingAddress(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your complete delivery address"
                                        rows={4}
                                                    className="w-full resize-none rounded-2xl border border-black/8 bg-[#faf8fe] px-4 py-3.5 text-[13px] outline-none transition placeholder:text-[#9c9697] focus:border-black focus:bg-white"
                                    />

                                    <p className="mt-2 text-[10px] text-[#4c4546]">
                                        Include your city, area, street,
                                        and any useful delivery instructions.
                                    </p>
                                </div>
                            </section>

                            {/* Payment */}
                            <section className="rounded-3xl bg-white p-7 sm:p-8">
                                <div className="flex items-start justify-between gap-5">
                                    <div>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                            Step 02
                                        </span>

                                        <h2 className="mt-2 text-[20px] font-semibold tracking-tight">
                                            Payment Method
                                        </h2>

                                        <p className="mt-1 text-[12px] leading-5 text-[#4c4546]">
                                            Select how you'd like to pay for
                                            this order.
                                        </p>
                                    </div>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eeedf3] text-sm">
                                        02
                                    </div>
                                </div>

                                <div className="mt-7 space-y-3">
                                    {/* eSewa */}
                                    <label
                                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${Number(paymentMethod) === 0
                                                ? "border-black bg-[#faf8fe]"
                                                : "border-black/[0.07] hover:border-black/20"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="0"
                                            checked={
                                                Number(paymentMethod) ===
                                                0
                                            }
                                            onChange={(event) =>
                                                setPaymentMethod(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                            className="h-4 w-4 accent-black"
                                        />

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeedf3] text-[11px] font-bold">
                                            eS
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-[13px] font-semibold">
                                                eSewa
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-[#4c4546]">
                                                Pay using eSewa
                                            </p>
                                        </div>
                                    </label>

                                    {/* Khalti */}
                                    <label
                                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${Number(paymentMethod) === 1
                                                ? "border-black bg-[#faf8fe]"
                                                : "border-black/[0.07] hover:border-black/20"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="1"
                                            checked={
                                                Number(paymentMethod) ===
                                                1
                                            }
                                            onChange={(event) =>
                                                setPaymentMethod(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                            className="h-4 w-4 accent-black"
                                        />

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeedf3] text-[11px] font-bold">
                                            K
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-[13px] font-semibold">
                                                Khalti
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-[#4c4546]">
                                                Pay using Khalti
                                            </p>
                                        </div>
                                    </label>

                                    {/* COD */}
                                    <label
                                        className={`flex cursor-pointer items-center gap-4 rounded-2xl border p-4 transition ${Number(paymentMethod) === 2
                                                ? "border-black bg-[#faf8fe]"
                                                : "border-black/[0.07] hover:border-black/20"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="2"
                                            checked={
                                                Number(paymentMethod) ===
                                                2
                                            }
                                            onChange={(event) =>
                                                setPaymentMethod(
                                                    Number(
                                                        event.target.value
                                                    )
                                                )
                                            }
                                            className="h-4 w-4 accent-black"
                                        />

                                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#eeedf3] text-[11px] font-bold">
                                            COD
                                        </div>

                                        <div className="flex-1">
                                            <p className="text-[13px] font-semibold">
                                                Cash on Delivery
                                            </p>

                                            <p className="mt-0.5 text-[10px] text-[#4c4546]">
                                                Pay when your order is delivered
                                            </p>
                                        </div>
                                    </label>
                                </div>

                                {Number(paymentMethod) === 2 && (
                                    <div className="mt-5 rounded-2xl bg-[#f4f3f8] px-4 py-3 text-[11px] leading-5 text-[#4c4546]">
                                        Your payment will remain unpaid
                                        until the order is delivered.
                                    </div>
                                )}
                            </section>

                            {/* Error */}
                            {(validationError || error) && (
                                <div className="rounded-2xl bg-[#ffdad6] px-5 py-4 text-[12px] leading-5 text-[#93000a]">
                                    {validationError || error}
                                </div>
                            )}

                            {/* Back */}
                            <Link
                                to="/cart"
                                className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#4c4546] transition-colors hover:text-black"
                            >
                                ← Back to Cart
                            </Link>
                        </div>

                        {/* Right Side */}
                        <aside className="lg:sticky lg:top-24">
                            <div className="rounded-3xl bg-black p-7 text-white">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/50">
                                            Step 03
                                        </span>

                                        <h2 className="mt-2 text-[22px] font-semibold tracking-tight">
                                            Order Summary
                                        </h2>
                                    </div>

                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-sm">
                                        03
                                    </div>
                                </div>

                                {/* Items */}
                                <div className="mt-7 space-y-4">
                                    {items.map((item, index) => {
                                        const productId =
                                            getProductId(item);

                                        const quantity =
                                            getQuantity(item);

                                        const price =
                                            getPrice(item);

                                        return (
                                            <div
                                                key={
                                                    item.id ||
                                                    productId ||
                                                    index
                                                }
                                                className="flex gap-3"
                                            >
                                                <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/10">
                                                    <img
                                                        src={getProductImage(
                                                            item
                                                        )}
                                                        alt={getProductName(
                                                            item
                                                        )}
                                                        className="h-full w-full object-cover"
                                                        onError={(event) => {
                                                            event.currentTarget.src =
                                                                fallbackImage;
                                                        }}
                                                    />
                                                </div>

                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-[12px] font-medium">
                                                        {getProductName(item)}
                                                    </p>

                                                    <p className="mt-1 text-[10px] text-white/50">
                                                        {getProductCategory(
                                                            item
                                                        )}{" "}
                                                        · Qty {quantity}
                                                    </p>
                                                </div>

                                                <p className="shrink-0 text-[12px] font-medium">
                                                    $
                                                    {(
                                                        price * quantity
                                                    ).toLocaleString()}
                                                </p>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="my-7 h-px bg-white/10" />

                                {/* Totals */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-white/50">
                                            Items
                                        </span>

                                        <span>
                                            {totalItems}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-white/50">
                                            Subtotal
                                        </span>

                                        <span>
                                            $
                                            {subtotal.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-white/50">
                                            Delivery
                                        </span>

                                        <span className="text-[11px] text-white/60">
                                            Calculated separately
                                        </span>
                                    </div>
                                </div>

                                <div className="my-7 h-px bg-white/10" />

                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wider text-white/40">
                                            Subtotal
                                        </span>

                                        <p className="mt-1 text-[10px] text-white/40">
                                            Final total calculated by
                                            server
                                        </p>
                                    </div>

                                    <span className="text-[25px] font-semibold tracking-tight">
                                        $
                                        {subtotal.toLocaleString()}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    disabled={placingOrder}
                                    className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-white text-[12px] font-semibold text-black transition hover:bg-[#f4f3f8] disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {placingOrder
                                        ? "Placing Order..."
                                        : "Place Order →"}
                                </button>

                                <p className="mt-4 text-center text-[10px] leading-5 text-white/35">
                                    By placing this order, you confirm
                                    your selected equipment, delivery
                                    address, and payment method.
                                </p>
                            </div>

                            {/* Secure Checkout */}
                                        <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-black/4">
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eeedf3] text-sm">
                                        ✓
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-semibold">
                                            Secure checkout
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-[#4c4546]">
                                            Your order information is processed
                                            through the BizBox API. No raw card
                                            details are stored by this page.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </form>
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

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    All Equipment
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
                                    Equipment Purchase
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
                                    to="/login"
                                    className="hover:text-black"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="hover:text-black"
                                >
                                    Register
                                </Link>

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

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Support
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

export default CheckoutPage;