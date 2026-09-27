import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowRight,
    ArrowLeft,
    CheckCircle2,
} from "lucide-react";
import cartService from "../services/cartService";
import { resolveImageUrl } from "../utils/imageUrl";

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

    const calculateDeliveryFee = (amount) => {
        if (amount > 2500) return 112;
        if (amount > 1500) return 70;
        if (amount > 1000) return 59;
        if (amount > 800) return 49;
        return 0;
    };

    const deliveryFee = calculateDeliveryFee(subtotal);
    const estimatedTotal = subtotal + deliveryFee;

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

            const updatedCart = await cartService.updateItem(
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

            const updatedCart = await cartService.updateItem(
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
        <main className="min-h-screen bg-gray-50 py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                            Shopping cart
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            {items.length > 0
                                ? `You have ${totalItems} ${totalItems === 1 ? "item" : "items"} in your cart.`
                                : "Review your equipment before checkout."}
                        </p>
                    </div>

                    {!loading && items.length > 0 && (
                        <button
                            type="button"
                            onClick={handleClearCart}
                            disabled={clearingCart}
                            className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            {clearingCart ? "Clearing..." : "Clear cart"}
                        </button>
                    )}
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {/* Loading Skeleton */}
                {loading ? (
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start animate-pulse">
                        <div className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm divide-y divide-gray-100">
                            {Array.from({ length: 3 }).map((_, idx) => (
                                <div key={idx} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                                    <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100" />
                                    <div className="flex flex-1 flex-col justify-between py-1">
                                        <div className="space-y-2">
                                            <div className="h-4 w-40 rounded bg-gray-100" />
                                            <div className="h-3 w-24 rounded bg-gray-100" />
                                        </div>
                                        <div className="h-4 w-28 rounded bg-gray-100" />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="lg:col-span-4 h-64 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" />
                    </div>
                ) : items.length === 0 ? (
                    /* Empty State */
                    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                            <ShoppingBag className="h-8 w-8" />
                        </div>
                        <h2 className="mt-4 text-xl font-semibold text-gray-900">
                            Your cart is empty
                        </h2>
                        <p className="mt-1.5 max-w-sm text-sm text-gray-500">
                            Looks like you haven't added any equipment to your cart yet. Explore our catalog to find what you need.
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
                    /* Cart Content Grid */
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
                        {/* Cart Items List */}
                        <div className="lg:col-span-8 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="divide-y divide-gray-100">
                                {items.map((item) => {
                                    const itemId = getItemId(item);
                                    const productId = getProductId(item);
                                    const itemPrice = getPrice(item);
                                    const itemQuantity = getQuantity(item);
                                    const itemTotal = itemPrice * itemQuantity;
                                    const isUpdating = updatingItemId === itemId;
                                    const isRemoving = removingItemId === itemId;

                                    return (
                                        <div
                                            key={itemId || productId}
                                            className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6"
                                        >
                                            {/* Thumbnail */}
                                            <Link
                                                to={`/products/${productId}`}
                                                className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                                            >
                                                <img
                                                    src={getProductImage(item)}
                                                    alt={getProductName(item)}
                                                    className="h-full w-full object-cover"
                                                    onError={(event) => {
                                                        event.currentTarget.src = fallbackImage;
                                                    }}
                                                />
                                            </Link>

                                            {/* Details */}
                                            <div className="flex min-w-0 flex-1 flex-col gap-1">
                                                <span className="text-[11px] font-medium uppercase tracking-wider text-gray-400">
                                                    {getProductCategory(item)}
                                                </span>
                                                <Link
                                                    to={`/products/${productId}`}
                                                    className="font-medium text-gray-900 transition hover:text-gray-600 line-clamp-1"
                                                >
                                                    {getProductName(item)}
                                                </Link>
                                                <p className="text-xs text-gray-500">
                                                    Rs. {itemPrice.toLocaleString()} per unit
                                                </p>
                                            </div>

                                            {/* Actions & Price */}
                                            <div className="flex items-center justify-between gap-4 sm:justify-end sm:gap-6">
                                                {/* Quantity Adjuster */}
                                                <div className="flex items-center rounded-lg border border-gray-200 bg-gray-50">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleDecrease(item)}
                                                        disabled={itemQuantity <= 1 || isUpdating || isRemoving}
                                                        className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30 rounded-l-lg"
                                                        aria-label="Decrease quantity"
                                                    >
                                                        <Minus className="h-3.5 w-3.5" />
                                                    </button>
                                                    <span className="flex w-8 items-center justify-center text-xs font-semibold text-gray-900">
                                                        {isUpdating ? "..." : itemQuantity}
                                                    </span>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleIncrease(item)}
                                                        disabled={isUpdating || isRemoving}
                                                        className="flex h-8 w-8 items-center justify-center text-gray-600 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30 rounded-r-lg"
                                                        aria-label="Increase quantity"
                                                    >
                                                        <Plus className="h-3.5 w-3.5" />
                                                    </button>
                                                </div>

                                                {/* Item Subtotal */}
                                                <div className="w-24 text-right">
                                                    <span className="text-sm font-semibold text-gray-900">
                                                        Rs. {itemTotal.toLocaleString()}
                                                    </span>
                                                </div>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemove(item)}
                                                    disabled={isRemoving || isUpdating}
                                                    className="p-1.5 text-gray-400 transition hover:text-red-600 disabled:opacity-30"
                                                    aria-label="Remove item"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Card Footer: Continue shopping */}
                            <div className="border-t border-gray-100 bg-gray-50/50 px-5 py-3.5">
                                <Link
                                    to="/equipment"
                                    className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 transition hover:text-black"
                                >
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                    Continue shopping
                                </Link>
                            </div>
                        </div>

                        {/* Order Summary Sidebar */}
                        <aside className="lg:col-span-4 lg:sticky lg:top-24">
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-base font-semibold text-gray-900">
                                    Order Summary
                                </h2>

                                <div className="mt-5 space-y-3 text-sm">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Items ({totalItems})</span>
                                        <span>Rs. {subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Delivery</span>
                                        <span className="font-medium text-gray-900">
                                            {deliveryFee > 0 ? `Rs. ${deliveryFee.toLocaleString()}` : "Free"}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-semibold text-gray-900">
                                        <span>Estimated Total</span>
                                        <span>Rs. {estimatedTotal.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link
                                    to="/checkout"
                                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
                                >
                                    Proceed to Checkout
                                    <ArrowRight className="h-4 w-4" />
                                </Link>

                                <div className="mt-5 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-500 space-y-1.5">
                                    <div className="flex items-center gap-1.5 font-medium text-gray-700">
                                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                                        <span>Secure Checkout</span>
                                    </div>
                                    <p className="leading-relaxed">
                                        Review delivery details and payment options on the next step.
                                    </p>
                                </div>
                            </div>
                        </aside>
                    </div>
                )}
            </div>

            {/* Notification Toast */}
            {message && (
                <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-gray-900 px-4 py-2.5 text-xs font-medium text-white shadow-xl">
                    {message}
                </div>
            )}
        </main>
    );
};

export default Cart;