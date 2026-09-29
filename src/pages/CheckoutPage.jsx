import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Wallet,
  Truck,
} from "lucide-react";
import cartService from "../services/cartService";
import orderService from "../services/orderService";
import paymentService, { postToEsewa } from "../services/paymentService";
import { resolveImageUrl } from "../utils/imageUrl";

const PAYMENT_METHOD = {
  ESEWA: 0,
  COD: 1,
};

const persistEsewaOrder = (order) => {
  if (!order?.id) return;

  sessionStorage.setItem("esewaOrderId", String(order.id));

  if (order.orderNumber) {
    sessionStorage.setItem("esewaOrderNumber", String(order.orderNumber));
  }
};

const CheckoutPage = () => {
  const navigate = useNavigate();

  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [shippingAddress, setShippingAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState(PAYMENT_METHOD.COD);

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
  const grandTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async (event) => {
    event.preventDefault();

    setValidationError("");
    setError("");

    if (!shippingAddress.trim()) {
      setValidationError("Please enter your shipping address.");
      return;
    }

    if (items.length === 0) {
      setValidationError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);

      const method = Number(paymentMethod);

      const order = await orderService.create({
        shippingAddress: shippingAddress.trim(),
        paymentMethod: method,
      });

      if (!order?.id) {
        throw new Error("Order was created but no order id was returned.");
      }

      if (method === PAYMENT_METHOD.COD) {
        window.dispatchEvent(new Event("cart-updated"));
        navigate(`/orders/${order.id}`);
        return;
      }

      persistEsewaOrder(order);

      const { paymentUrl, fields } =
        await paymentService.initiateEsewa(order.id);
      postToEsewa(paymentUrl, fields);
    } catch (err) {
      setError(
        err.userMessage ||
          err.message ||
          "Unable to place your order. Please try again.",
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const paymentOptions = [
    {
      id: 0,
      name: "eSewa",
      description: "Pay online securely using your eSewa wallet",
      badge: "eS",
      badgeBg: "bg-emerald-100 text-emerald-800",
    },
    // {
    //   id: 1,
    //   name: "Khalti",
    //   description: "Pay online with your Khalti digital wallet",
    //   badge: "K",
    //   badgeBg: "bg-purple-100 text-purple-800",
    // },
    {
      id: PAYMENT_METHOD.COD,
      name: "Cash on Delivery",
      description: "Pay in cash when your equipment is delivered",
      badge: "COD",
      badgeBg: "bg-gray-100 text-gray-800",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link
            to="/cart"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-black"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to cart
          </Link>

          <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            Checkout
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
            Confirm your delivery details and payment method before placing your
            order.
          </p>
        </div>

        {(validationError || error) && (
          <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700 sm:items-center sm:p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600 sm:mt-0" />
            <span className="min-w-0 break-words">
              {validationError || error}
            </span>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 animate-pulse sm:gap-8 lg:grid-cols-12 lg:items-start">
            <div className="space-y-5 lg:col-span-8 sm:space-y-6">
              <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="h-5 w-40 max-w-full rounded bg-gray-100" />
                <div className="h-24 w-full rounded-xl bg-gray-100" />
              </div>

              <div className="space-y-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="h-5 w-40 max-w-full rounded bg-gray-100" />
                <div className="h-16 w-full rounded-xl bg-gray-100" />
                <div className="h-16 w-full rounded-xl bg-gray-100" />
              </div>
            </div>

            <div className="h-80 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:h-96 sm:p-6 lg:col-span-4" />
          </div>
        ) : items.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:min-h-[400px] sm:p-8">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
              <ShoppingBag className="h-8 w-8" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Your cart is empty
            </h2>

            <p className="mt-1.5 max-w-sm text-sm leading-6 text-gray-500">
              Add some equipment before continuing to checkout.
            </p>

            <Link
              to="/equipment"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
            >
              Browse Equipment
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <form
            onSubmit={handlePlaceOrder}
            className="grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-start"
          >
            <div className="space-y-5 lg:col-span-8 sm:space-y-6">
              <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-1 flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    1
                  </span>

                  <h2 className="text-base font-semibold text-gray-900">
                    Delivery Address
                  </h2>
                </div>

                <p className="ml-8.5 text-xs leading-5 text-gray-500">
                  Where should we deliver your equipment?
                </p>

                <div className="mt-5">
                  <label
                    htmlFor="shippingAddress"
                    className="mb-1.5 block text-xs font-medium text-gray-700"
                  >
                    Shipping Address <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(event) => setShippingAddress(event.target.value)}
                    placeholder="Enter your complete delivery address (Street, Area, City, Landmarks)"
                    rows={3}
                    className="w-full rounded-xl border border-gray-300 p-3.5 text-sm leading-6 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                  />

                  <p className="mt-1.5 text-xs leading-5 text-gray-400">
                    Include your city, street, and any specific delivery
                    instructions.
                  </p>
                </div>
              </section>

              <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="mb-1 flex items-center gap-2.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                    2
                  </span>

                  <h2 className="text-base font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>

                <p className="ml-8.5 text-xs leading-5 text-gray-500">
                  Select how you would like to pay for this order.
                </p>

                <div className="mt-5 space-y-3">
                  {paymentOptions.map((option) => {
                    const isSelected = Number(paymentMethod) === option.id;

                    return (
                      <label
                        key={option.id}
                        className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition sm:items-center sm:gap-4 sm:p-4 ${
                          isSelected
                            ? "border-black bg-gray-50/70 shadow-xs"
                            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/40"
                        }`}
                      >
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={option.id}
                          checked={isSelected}
                          onChange={(event) =>
                            setPaymentMethod(Number(event.target.value))
                          }
                          className="mt-1 h-4 w-4 shrink-0 accent-black text-black sm:mt-0"
                        />

                        <div
                          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${option.badgeBg}`}
                        >
                          {option.badge}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {option.name}
                          </p>

                          <p className="break-words text-xs leading-5 text-gray-500">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {Number(paymentMethod) === PAYMENT_METHOD.COD && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs leading-5 text-gray-600">
                    <Truck className="mt-0.5 h-4 w-4 shrink-0 text-gray-500" />
                    <span>
                      Payment will be collected upon delivery of your equipment.
                    </span>
                  </div>
                )}

                {/* {Number(paymentMethod) === PAYMENT_METHOD.ESEWA && (
                  <div className="mt-4 flex items-start gap-2 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs leading-5 text-emerald-800">
                    <Wallet className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
                    <div className="min-w-0 space-y-1">
                      <p>
                        You will leave this site and sign in on eSewa&apos;s
                        sandbox (rc-epay.esewa.com.np). Use a UAT test wallet,
                        not a real eSewa account or your BizBox login.
                      </p>
                      <p className="break-words">
                        Test ID: 9806800001 (or 0002–0005) · Password:
                        Nepal@123 · MPIN: 123456
                      </p>
                    </div>
                  </div>
                )} */}
              </section>
            </div>

            <aside className="lg:col-span-4 lg:sticky lg:top-24">
              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-gray-900">
                  Order Summary
                </h2>

                <div className="mt-4 max-h-60 overflow-y-auto divide-y divide-gray-100 pr-1">
                  {items.map((item, index) => {
                    const productId = getProductId(item);
                    const quantity = getQuantity(item);
                    const price = getPrice(item);
                    const imageUrl = getProductImage(item);

                    return (
                      <div
                        key={item.id || productId || index}
                        className="flex min-w-0 items-center gap-2.5 py-3 first:pt-0 last:pb-0 sm:gap-3"
                      >
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50 sm:h-12 sm:w-12">
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
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-gray-900">
                            {getProductName(item)}
                          </p>

                          <p className="text-[11px] text-gray-400">
                            Qty: {quantity} × Rs. {price.toLocaleString()}
                          </p>
                        </div>

                        <p className="shrink-0 text-right text-xs font-semibold text-gray-900">
                          Rs. {(price * quantity).toLocaleString()}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="my-5 border-t border-gray-100" />

                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-4 text-gray-600">
                    <span>Items ({totalItems})</span>

                    <span className="shrink-0">
                      Rs. {subtotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 text-gray-600">
                    <span>Delivery</span>

                    <span className="shrink-0 text-gray-600">
                      {deliveryFee > 0
                        ? `Rs. ${deliveryFee.toLocaleString()}`
                        : "Free"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                    <span>Total</span>

                    <span className="shrink-0">
                      Rs. {grandTotal.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={placingOrder}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-black py-3 text-sm font-medium text-white shadow-sm transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {placingOrder ? (
                    <>
                      <svg
                        className="h-4 w-4 shrink-0 animate-spin"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />

                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                        />
                      </svg>

                      <span className="truncate">
                        {Number(paymentMethod) === PAYMENT_METHOD.ESEWA
                          ? "Redirecting to eSewa..."
                          : "Placing Order..."}
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Place Order</span>

                      <ArrowRight className="h-4 w-4 shrink-0" />
                    </>
                  )}
                </button>

                <div className="mt-5 space-y-1.5 rounded-xl border border-gray-100 bg-gray-50 p-3.5 text-xs text-gray-500">
                  <p className="leading-relaxed">
                    By placing this order, you confirm your delivery address and
                    payment choice.
                  </p>
                </div>
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
};

export default CheckoutPage;