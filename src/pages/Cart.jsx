import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import cartService from "../services/cartService";

const fallbackImage =
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80";

const Cart = () => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [updatingItemId, setUpdatingItemId] = useState(null);
    const [removingItemId, setRemovingItemId] = useState(null);
    const [clearingCart, setClearingCart] = useState(false);

    const [message, setMessage] = useState("");

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

    const getItemId = (item) => {
        return item.id || item.cartItemId;
    };

    const getProductId = (item) => {
        const product = getProduct(item);

        return (
            item.productId ||
            product.id
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

        return (
            product.imageUrl ||
            product.image ||
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

    const showMessage = (text) => {
        setMessage(text);

        setTimeout(() => {
            setMessage("");
        }, 2500);
    };

    const handleIncrease = async (item) => {
        const itemId = getItemId(item);
        const currentQuantity = getQuantity(item);

        try {
            setUpdatingItemId(itemId);

            const updatedCart =
                await cartService.updateItem(
                    itemId,
                    currentQuantity + 1
                );

            setCart(updatedCart);

            if (!updatedCart) {
                await loadCart();
            }
        } catch (err) {
            showMessage(
                err.userMessage ||
                "Unable to update quantity."
            );
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleDecrease = async (item) => {
        const itemId = getItemId(item);
        const currentQuantity = getQuantity(item);

        if (currentQuantity <= 1) {
            return;
        }

        try {
            setUpdatingItemId(itemId);

            const updatedCart =
                await cartService.updateItem(
                    itemId,
                    currentQuantity - 1
                );

            setCart(updatedCart);

            if (!updatedCart) {
                await loadCart();
            }
        } catch (err) {
            showMessage(
                err.userMessage ||
                "Unable to update quantity."
            );
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleRemove = async (item) => {
        const itemId = getItemId(item);

        try {
            setRemovingItemId(itemId);

            await cartService.removeItem(itemId);

            await loadCart();

            showMessage("Item removed from cart.");
        } catch (err) {
            showMessage(
                err.userMessage ||
                "Unable to remove this item."
            );
        } finally {
            setRemovingItemId(null);
        }
    };

    const handleClearCart = async () => {
        if (items.length === 0) {
            return;
        }

        try {
            setClearingCart(true);

            await cartService.clearCart();

            await loadCart();

            showMessage("Cart cleared.");
        } catch (err) {
            showMessage(
                err.userMessage ||
                "Unable to clear your cart."
            );
        } finally {
            setClearingCart(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#faf8fe] text-[#1a1b1f]">
            {/* Header */}
            <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:px-12">
                    <Link
                        to="/"
                        className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                            B
                        </div>

                        <span className="text-[17px] font-semibold tracking-tight">
                            BizKit
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
                            <span className="text-[18px]">
                                🛍
                            </span>

                            <span className="rounded-full bg-white px-1.5 py-0.5 text-[10px] font-semibold">
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
            <main className="mx-auto max-w-7xl px-6 pb-20 pt-28 lg:px-12">
                {/* Heading */}
                <section className="pb-10">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9e7ed] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-black">
                            <span className="h-1.5 w-1.5 rounded-full bg-black" />
                            Your Selection
                        </span>

                        <span className="text-[11px] text-[#cfc4c5]">
                            •
                        </span>

                        <span className="text-[11px] text-[#4c4546]">
                            BizKit Cart
                        </span>
                    </div>

                    <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                        <div>
                            <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[52px]">
                                Your Cart.
                            </h1>

                            <p className="mt-3 max-w-xl text-[16px] leading-7 text-[#4c4546]">
                                Review your equipment selection before
                                placing your order.
                            </p>
                        </div>

                        {!loading && items.length > 0 && (
                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[17px] font-semibold">
                                        {totalItems}
                                    </span>

                                    <span className="text-[11px] text-[#4c4546]">
                                        Items
                                    </span>
                                </div>

                                <div className="h-8 w-px bg-[#e3e2e7]" />

                                <div className="flex flex-col">
                                    <span className="text-[17px] font-semibold">
                                        {items.length}
                                    </span>

                                    <span className="text-[11px] text-[#4c4546]">
                                        Products
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <div className="mb-8 rounded-2xl bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <section className="grid animate-pulse grid-cols-1 gap-8 lg:grid-cols-[1fr_380px]">
                        <div className="rounded-3xl bg-white p-6">
                            {Array.from({ length: 3 }).map(
                                (_, index) => (
                                    <div
                                        key={index}
                                        className={`flex gap-5 py-6 ${index !== 0
                                            ? "border-t border-black/5"
                                                : ""
                                            }`}
                                    >
                                        <div className="h-28 w-28 shrink-0 rounded-2xl bg-[#eeedf3]" />

                                        <div className="flex flex-1 flex-col justify-between">
                                            <div>
                                                <div className="h-3 w-20 rounded bg-[#eeedf3]" />

                                                <div className="mt-3 h-5 w-48 rounded bg-[#eeedf3]" />

                                                <div className="mt-2 h-3 w-28 rounded bg-[#eeedf3]" />
                                            </div>

                                            <div className="h-8 w-28 rounded-full bg-[#eeedf3]" />
                                        </div>
                                    </div>
                                )
                            )}
                        </div>

                        <div className="h-80 rounded-3xl bg-white" />
                    </section>
                ) : items.length === 0 ? (
                    /* Empty Cart */
                        <section className="flex min-h-125 flex-col items-center justify-center rounded-3xl bg-white px-6 text-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eeedf3] text-3xl">
                            🛍
                        </div>

                        <h2 className="mt-7 text-2xl font-semibold tracking-tight">
                            Your cart is empty
                        </h2>

                        <p className="mt-3 max-w-md text-[14px] leading-6 text-[#4c4546]">
                            You haven't added any equipment yet.
                            Explore the BizKit catalog and start
                            building your business setup.
                        </p>

                        <Link
                            to="/equipment"
                            className="mt-7 flex h-11 items-center justify-center rounded-full bg-black px-7 text-[12px] font-semibold text-white transition hover:bg-[#333]"
                        >
                            Browse Equipment →
                        </Link>
                    </section>
                ) : (
                    /* Cart Content */
                    <section className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
                        {/* Cart Items */}
                        <div className="rounded-3xl bg-white px-6 sm:px-8">
                                    <div className="flex items-center justify-between border-b border-black/5 py-6">
                                <div>
                                    <h2 className="text-[15px] font-semibold">
                                        Equipment Selection
                                    </h2>

                                    <p className="mt-1 text-[11px] text-[#4c4546]">
                                        {totalItems}{" "}
                                        {totalItems === 1
                                            ? "item"
                                            : "items"}{" "}
                                        in your cart
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClearCart}
                                    disabled={clearingCart}
                                    className="text-[11px] font-medium text-[#4c4546] underline underline-offset-2 transition-colors hover:text-black disabled:opacity-40"
                                >
                                    {clearingCart
                                        ? "Clearing..."
                                        : "Clear Cart"}
                                </button>
                            </div>

                            <div>
                                {items.map((item, index) => {
                                    const itemId = getItemId(item);
                                    const productId =
                                        getProductId(item);

                                    const itemPrice =
                                        getPrice(item);

                                    const itemQuantity =
                                        getQuantity(item);

                                    const itemTotal =
                                        itemPrice * itemQuantity;

                                    const isUpdating =
                                        updatingItemId === itemId;

                                    const isRemoving =
                                        removingItemId === itemId;

                                    return (
                                        <div
                                            key={itemId || productId}
                                            className={`flex flex-col gap-5 py-7 sm:flex-row ${index !== 0
                                                ? "border-t border-black/5"
                                                    : ""
                                                }`}
                                        >
                                            {/* Image */}
                                            <Link
                                                to={`/products/${productId}`}
                                                className="relative h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-[#f4f3f8] sm:h-32 sm:w-32"
                                            >
                                                <img
                                                    src={getProductImage(item)}
                                                    alt={getProductName(item)}
                                                    className="h-full w-full object-contain p-4 transition-transform duration-300 hover:scale-105"
                                                    onError={(event) => {
                                                        event.currentTarget.src =
                                                            fallbackImage;
                                                    }}
                                                />
                                            </Link>

                                            {/* Info */}
                                            <div className="flex min-w-0 flex-1 flex-col justify-between gap-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="min-w-0">
                                                        <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                                            {getProductCategory(
                                                                item
                                                            )}
                                                        </span>

                                                        <Link
                                                            to={`/products/${productId}`}
                                                            className="mt-1 block text-[17px] font-semibold leading-6 tracking-tight text-black transition-colors hover:text-[#4c4546]"
                                                        >
                                                            {getProductName(
                                                                item
                                                            )}
                                                        </Link>

                                                        <p className="mt-1 text-[11px] text-[#4c4546]">
                                                            $
                                                            {itemPrice.toLocaleString()}{" "}
                                                            per unit
                                                        </p>
                                                    </div>

                                                    <div className="shrink-0 text-right">
                                                        <p className="text-[16px] font-semibold">
                                                            $
                                                            {itemTotal.toLocaleString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between gap-4">
                                                    {/* Quantity */}
                                                    <div className="flex h-9 items-center overflow-hidden rounded-full bg-[#f4f3f8]">
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleDecrease(
                                                                    item
                                                                )
                                                            }
                                                            disabled={
                                                                itemQuantity <=
                                                                1 ||
                                                                isUpdating ||
                                                                isRemoving
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center text-base transition-colors hover:bg-[#eeedf3] disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            −
                                                        </button>

                                                        <span className="flex w-8 items-center justify-center text-[12px] font-semibold">
                                                            {isUpdating
                                                                ? "..."
                                                                : itemQuantity}
                                                        </span>

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleIncrease(
                                                                    item
                                                                )
                                                            }
                                                            disabled={
                                                                isUpdating ||
                                                                isRemoving
                                                            }
                                                            className="flex h-9 w-9 items-center justify-center text-base transition-colors hover:bg-[#eeedf3] disabled:cursor-not-allowed disabled:opacity-30"
                                                        >
                                                            +
                                                        </button>
                                                    </div>

                                                    {/* Remove */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRemove(item)
                                                        }
                                                        disabled={
                                                            isRemoving ||
                                                            isUpdating
                                                        }
                                                        className="text-[11px] font-medium text-[#4c4546] transition-colors hover:text-[#ba1a1a] disabled:opacity-40"
                                                    >
                                                        {isRemoving
                                                            ? "Removing..."
                                                            : "Remove"}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Continue Shopping */}
                                    <div className="border-t border-black/5 py-6">
                                <Link
                                    to="/equipment"
                                    className="inline-flex items-center gap-2 text-[12px] font-semibold text-black transition-colors hover:text-[#4c4546]"
                                >
                                    ← Continue Shopping
                                </Link>
                            </div>
                        </div>

                        {/* Summary */}
                        <aside className="lg:sticky lg:top-24">
                            <div className="rounded-3xl bg-black p-7 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                                            Order Summary
                                        </span>

                                        <h2 className="mt-2 text-[22px] font-semibold tracking-tight">
                                            Your Order
                                        </h2>
                                    </div>

                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-lg">
                                        🛍
                                    </div>
                                </div>

                                <div className="my-7 h-px bg-white/10" />

                                <div className="flex flex-col gap-4">
                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-white/60">
                                            Items
                                        </span>

                                        <span>
                                            {totalItems}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-white/60">
                                            Products
                                        </span>

                                        <span>
                                            {items.length}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-white/60">
                                            Subtotal
                                        </span>

                                        <span>
                                            $
                                            {subtotal.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-[13px]">
                                        <span className="text-white/60">
                                            Delivery
                                        </span>

                                        <span className="text-white/70">
                                            Calculated at checkout
                                        </span>
                                    </div>
                                </div>

                                <div className="my-7 h-px bg-white/10" />

                                <div className="flex items-end justify-between gap-4">
                                    <div>
                                        <span className="text-[10px] uppercase tracking-wider text-white/50">
                                            Estimated Subtotal
                                        </span>

                                        <p className="mt-1 text-[11px] text-white/50">
                                            Before delivery and final
                                            charges
                                        </p>
                                    </div>

                                    <span className="text-[24px] font-semibold tracking-tight">
                                        $
                                        {subtotal.toLocaleString()}
                                    </span>
                                </div>

                                <Link
                                    to="/checkout"
                                    className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-white text-[12px] font-semibold text-black transition hover:bg-[#f4f3f8]"
                                >
                                    Proceed to Checkout →
                                </Link>

                                <p className="mt-4 text-center text-[10px] leading-5 text-white/40">
                                    Your final order total will be
                                    calculated using current product,
                                    delivery, and payment information.
                                </p>
                            </div>

                            {/* Secure Note */}
                                    <div className="mt-4 rounded-2xl bg-white p-5 ring-1 ring-black/4">
                                <div className="flex gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eeedf3] text-sm">
                                        ✓
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-semibold">
                                            Ready when you are
                                        </p>

                                        <p className="mt-1 text-[11px] leading-5 text-[#4c4546]">
                                            Review your equipment and
                                            continue to checkout when
                                            you're ready to place the
                                            order.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </section>
                )}

                {/* Bottom CTA */}
                {!loading && items.length > 0 && (
                    <section className="mt-16">
                        <div className="relative overflow-hidden rounded-3xl bg-[#f4f3f8] p-8 md:p-10">
                            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                        BizKit Equipment
                                    </span>

                                    <h2 className="mt-2 text-[24px] font-semibold tracking-tight">
                                        Need something else?
                                    </h2>

                                    <p className="mt-2 max-w-xl text-[13px] leading-6 text-[#4c4546]">
                                        Browse the equipment catalog and
                                        add more products to your business
                                        setup.
                                    </p>
                                </div>

                                <Link
                                    to="/equipment"
                                    className="flex h-11 shrink-0 items-center justify-center rounded-full bg-black px-6 text-[12px] font-semibold text-white transition hover:bg-[#333]"
                                >
                                    Browse Equipment →
                                </Link>
                            </div>
                        </div>
                    </section>
                )}
            </main>

            {/* Message */}
            {message && (
                <div className="fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded-full bg-black px-5 py-3 text-[12px] font-medium text-white shadow-xl">
                    {message}
                </div>
            )}

            {/* Footer */}
            <footer className="w-full bg-[#f4f3f8]">
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
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Equipment Catalog
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
                                BizKit
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    About BizKit
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
                            © 2026 BizKit. Commercial equipment
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

export default Cart;