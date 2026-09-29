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
        err.userMessage || "Unable to load your cart. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getItems = () => {
    if (Array.isArray(cart)) {
      return cart;
    }

    return cart?.items || cart?.cartItems || cart?.cart?.items || [];
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

    return product.name || item.productName || "Equipment";
  };

  const getProductImage = (item) => {
    const product = getProduct(item);
    const raw = product.imageUrl || product.image;

    return resolveImageUrl(raw);
  };

  const getProductCategory = (item) => {
    const product = getProduct(item);

    return product.category?.name || product.categoryName || "Equipment";
  };

  const getPrice = (item) => {
    const product = getProduct(item);

    return Number(item.unitPrice ?? item.price ?? product.price ?? 0);
  };

  const getQuantity = (item) => {
    return Number(item.quantity) || 1;
  };

  const subtotal = items.reduce(
    (total, item) => total + getPrice(item) * getQuantity(item),
    0,
  );

  const totalItems = items.reduce(
    (total, item) => total + getQuantity(item),
    0,
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
        currentQuantity + 1,
      );

      setCart(updatedCart);

      if (!updatedCart) {
        await loadCart();
      }
    } catch (err) {
      showMessage(err.userMessage || "Unable to update quantity.");
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
        currentQuantity - 1,
      );

      setCart(updatedCart);

      if (!updatedCart) {
        await loadCart();
      }
    } catch (err) {
      showMessage(err.userMessage || "Unable to update quantity.");
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
      showMessage(err.userMessage || "Unable to remove this item.");
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
      showMessage(err.userMessage || "Unable to clear your cart.");
    } finally {
      setClearingCart(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-semibold tracking-tight text-black sm:text-3xl lg:text-4xl">
              Shopping cart
            </h1>

            <p className="mt-2 text-sm leading-6 text-gray-600">
              {items.length > 0
                ? `You have ${totalItems} ${
                    totalItems === 1 ? "item" : "items"
                  } in your cart.`
                : "Review your equipment before checkout."}
            </p>
          </div>

          {!loading && items.length > 0 && (
            <button
              type="button"
              onClick={handleClearCart}
              disabled={clearingCart}
              className="inline-flex w-fit items-center gap-1.5 self-start rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:self-auto"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {clearingCart ? "Clearing..." : "Clear cart"}
            </button>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 break-words rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 animate-pulse lg:grid-cols-12 lg:items-start lg:gap-8">
            <div className="divide-y divide-gray-100 overflow-hidden rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6 lg:col-span-8">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div
                  key={idx}
                  className="flex gap-3 py-4 first:pt-0 sm:gap-4"
                >
                  <div className="h-16 w-16 shrink-0 rounded-xl bg-gray-100 sm:h-20 sm:w-20" />

                  <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                    <div className="space-y-2">
                      <div className="h-4 w-32 max-w-full rounded bg-gray-100 sm:w-40" />
                      <div className="h-3 w-20 rounded bg-gray-100 sm:w-24" />
                    </div>

                    <div className="h-4 w-24 rounded bg-gray-100 sm:w-28" />
                  </div>
                </div>
              ))}
            </div>

            <div className="h-64 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-4" />
          </div>
        ) : items.length === 0 ? (

          /* Empty State */
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:min-h-[400px] sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400 sm:h-16 sm:w-16">
              <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
              Your cart is empty
            </h2>

            <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-500">
              Looks like you haven't added any equipment to your cart yet.
              Explore our catalog to find what you need.
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

          /* Cart */
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">

            {/* Cart Items */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:col-span-8">
              <div className="divide-y divide-gray-100">
                {items.map((item) => {
                  const itemId = getItemId(item);
                  const productId = getProductId(item);
                  const itemPrice = getPrice(item);
                  const itemQuantity = getQuantity(item);
                  const itemTotal = itemPrice * itemQuantity;
                  const isUpdating = updatingItemId === itemId;
                  const isRemoving = removingItemId === itemId;

                  const imageUrl = getProductImage(item);

                  return (
                    <div
                      key={itemId || productId}
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-5 sm:p-5 lg:gap-6"
                    >
                      {/* Product Image */}
                      <Link
                        to={`/products/${productId}`}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50"
                      >
                        {imageUrl && (
                          <img
                            src={imageUrl}
                            alt={getProductName(item)}
                            className="h-full w-full object-cover"
                            onError={(event) => {
                              event.currentTarget.style.display = "none";
                            }}
                          />
                        )}
                      </Link>

                      {/* Product Info */}
                      <div className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] font-medium uppercase tracking-wider text-gray-400">
                          {getProductCategory(item)}
                        </span>

                        <Link
                          to={`/products/${productId}`}
                          className="mt-0.5 block truncate font-medium text-gray-900 transition hover:text-gray-600"
                        >
                          {getProductName(item)}
                        </Link>

                        <p className="mt-0.5 text-xs text-gray-500">
                          Rs. {itemPrice.toLocaleString()} per unit
                        </p>
                      </div>

                      {/* Quantity / Price / Remove */}
                      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end sm:gap-4 lg:gap-6">

                        {/* Quantity */}
                        <div className="flex shrink-0 items-center rounded-lg border border-gray-200 bg-gray-50">
                          <button
                            type="button"
                            onClick={() => handleDecrease(item)}
                            disabled={
                              itemQuantity <= 1 ||
                              isUpdating ||
                              isRemoving
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-l-lg text-gray-600 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
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
                            className="flex h-8 w-8 items-center justify-center rounded-r-lg text-gray-600 transition hover:bg-gray-100 hover:text-black disabled:cursor-not-allowed disabled:opacity-30"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="w-auto shrink-0 text-right sm:w-24">
                          <span className="text-sm font-semibold text-gray-900">
                            Rs. {itemTotal.toLocaleString()}
                          </span>
                        </div>

                        {/* Remove */}
                        <button
                          type="button"
                          onClick={() => handleRemove(item)}
                          disabled={isRemoving || isUpdating}
                          className="shrink-0 p-1.5 text-gray-400 transition hover:text-red-600 disabled:opacity-30"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Continue Shopping */}
              <div className="border-t border-gray-100 bg-gray-50/50 px-4 py-3.5 sm:px-5">
                <Link
                  to="/equipment"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 transition hover:text-black"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Continue shopping
                </Link>
              </div>
            </div>

            {/* Order Summary */}
            <aside className="lg:sticky lg:top-24 lg:col-span-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Order Summary
                </h2>

                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-4 text-gray-600">
                    <span>Items ({totalItems})</span>

                    <span className="shrink-0">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-gray-600">
                    <span>Delivery</span>

                    <span className="shrink-0 font-medium text-gray-900">
                      {deliveryFee > 0
                        ? `Rs. ${deliveryFee.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                    <span>Estimated Total</span>

                    <span className="shrink-0 text-right">
                      Rs. {estimatedTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <Link
                  to="/checkout"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800"
                >
                  Proceed to Checkout
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="mt-5 rounded-xl bg-gray-50 p-3.5 text-xs text-gray-500">
                  <p className="leading-relaxed">
                    Review delivery details and payment options on the next
                    step.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {message && (
        <div
          className={`fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-medium shadow-xl sm:bottom-6 sm:left-auto sm:right-6`}
        >
          {messageType === "error" && (
            <span className="h-2 w-2 rounded-full bg-red-500" />
          )}

          {messageType === "success" && (
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          )}

          <span>{message}</span>
        </div>
      )}
    </main>
  );
};

export default Cart;