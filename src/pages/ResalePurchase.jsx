import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import resaleService from "../services/resaleService";
import { resolveImageUrl } from "../utils/imageUrl";
import { ArrowLeft, AlertCircle, ShoppingBag, ShieldCheck } from "lucide-react";

const CONDITION_LABELS = {
    0: "Like New",
    1: "Good",
    2: "Fair",
};

const ResalePurchase = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);
    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(2); // Default to Cash on Delivery

    const [loading, setLoading] = useState(true);
    const [purchasing, setPurchasing] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadListing = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await resaleService.getById(id);
                setListing(data);
            } catch (err) {
                setError(
                    err.userMessage ||
                    err.response?.data?.message ||
                    "Unable to load this resale listing."
                );
            } finally {
                setLoading(false);
            }
        };

        loadListing();
    }, [id]);

    const getProduct = () =>
        listing?.product ||
        listing?.productDetails ||
        listing?.item ||
        {};

    const getProductName = () => {
        const product = getProduct();
        return (
            listing?.productName ||
            product.name ||
            listing?.name ||
            "Equipment"
        );
    };

    const getImage = () => {
        const product = getProduct();
        const raw =
            listing?.imageUrl ||
            listing?.productImageUrl ||
            product.imageUrl ||
            product.image;

        return resolveImageUrl(raw) || "";
    };

    const getPrice = () =>
        listing?.price ??
        listing?.resalePrice ??
        listing?.salePrice ??
        listing?.amount ??
        0;

    const getSellerName = () => {
        const seller =
            listing?.seller ||
            listing?.owner ||
            listing?.user ||
            {};

        return (
            listing?.sellerName ||
            seller.fullName ||
            seller.name ||
            seller.userName ||
            "BizBox User"
        );
    };

    const formatCurrency = (amount) => {
        const value = Number(amount) || 0;
        return `Rs. ${value.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const handlePurchase = async (event) => {
        event.preventDefault();

        if (!shippingAddress.trim()) {
            setError("Please enter your delivery address.");
            return;
        }

        try {
            setPurchasing(true);
            setError("");

            const response = await resaleService.purchase(id, {
                shippingAddress: shippingAddress.trim(),
                paymentMethod: Number(paymentMethod),
            });

            const orderId =
                response?.id ||
                response?.orderId ||
                response?.order?.id;

            if (orderId) {
                try {
                    sessionStorage.setItem(`resale_order_${orderId}`, "true");
                } catch {}
                navigate(`/orders/${orderId}?type=resale`, {
                    state: { isResale: true },
                });
                return;
            }

            navigate("/orders");
        } catch (err) {
            setError(
                err.userMessage ||
                err.response?.data?.message ||
                "Unable to complete the purchase. Please try again."
            );
        } finally {
            setPurchasing(false);
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
        {
            id: 1,
            name: "Khalti",
            description: "Pay online with your Khalti digital wallet",
            badge: "K",
            badgeBg: "bg-purple-100 text-purple-800",
        },
        {
            id: 2,
            name: "Cash on Delivery",
            description: "Pay in cash when your equipment is delivered",
            badge: "COD",
            badgeBg: "bg-gray-100 text-gray-800",
        },
    ];

    if (loading) {
        return (
            <main className="min-h-screen bg-gray-50 py-8 sm:py-10">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start animate-pulse">
                        <div className="lg:col-span-8 space-y-6">
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                                <div className="h-5 w-40 rounded bg-gray-100" />
                                <div className="h-24 w-full rounded-xl bg-gray-100" />
                            </div>
                            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm space-y-4">
                                <div className="h-5 w-40 rounded bg-gray-100" />
                                <div className="h-16 w-full rounded-xl bg-gray-100" />
                                <div className="h-16 w-full rounded-xl bg-gray-100" />
                            </div>
                        </div>
                        <div className="lg:col-span-4 h-96 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" />
                    </div>
                </div>
            </main>
        );
    }

    if (error && !listing) {
        return (
            <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-16">
                <div className="w-full rounded-2xl border border-gray-200 bg-white p-8 text-center sm:p-12">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <ShoppingBag className="h-7 w-7" />
                    </div>
                    <h1 className="mt-5 text-2xl font-semibold text-gray-900">
                        Listing Unavailable
                    </h1>
                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        {error || "This resale item could not be loaded."}
                    </p>
                    <Link
                        to="/resale"
                        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-black px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Resale Marketplace
                    </Link>
                </div>
            </main>
        );
    }

    const price = getPrice();
    const conditionText = listing ? CONDITION_LABELS[listing.condition] || "Good" : "Good";

    return (
        <main className="min-h-screen bg-gray-50 py-8 sm:py-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                {/* Heading */}
                <div className="mb-6">
                    <Link
                        to={`/resale/${id}`}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-black mb-3"
                    >
                        <ArrowLeft className="h-3.5 w-3.5" />
                        Back to listing
                    </Link>
                    <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                        Resale Checkout
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Confirm your delivery address and payment method to complete your purchase.
                    </p>
                </div>

                {/* Error Banner */}
                {error && (
                    <div className="mb-6 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                        <span>{error}</span>
                    </div>
                )}

                {/* Purchase Form */}
                <form
                    onSubmit={handlePurchase}
                    className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start"
                >
                    {/* Left Column: Delivery Address & Payment Method */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Step 1: Delivery Address */}
                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-1">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                                    1
                                </span>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Delivery Address
                                </h2>
                            </div>
                            <p className="text-xs text-gray-500 ml-8.5">
                                Where should the seller deliver your equipment?
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
                                    onChange={(event) =>
                                        setShippingAddress(event.target.value)
                                    }
                                    placeholder="Enter your complete delivery address (Street, Area, City, Landmarks)"
                                    rows={3}
                                    className="w-full rounded-xl border border-gray-300 p-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-black focus:ring-1 focus:ring-black"
                                />
                                <p className="mt-1.5 text-xs text-gray-400">
                                    Include your city, street, and any specific delivery instructions.
                                </p>
                            </div>
                        </section>

                        {/* Step 2: Payment Method */}
                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <div className="flex items-center gap-2.5 mb-1">
                                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black text-xs font-semibold text-white">
                                    2
                                </span>
                                <h2 className="text-base font-semibold text-gray-900">
                                    Payment Method
                                </h2>
                            </div>
                            <p className="text-xs text-gray-500 ml-8.5">
                                Select how you would like to pay for this resale purchase.
                            </p>

                            <div className="mt-5 space-y-3">
                                {paymentOptions.map((option) => {
                                    const isSelected = Number(paymentMethod) === option.id;

                                    return (
                                        <label
                                            key={option.id}
                                            className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition ${
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
                                                className="h-4 w-4 accent-black text-black"
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
                                                <p className="text-xs text-gray-500">
                                                    {option.description}
                                                </p>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-4 sticky top-24 space-y-4">
                        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                            <h2 className="text-base font-semibold text-gray-900">
                                Order Summary
                            </h2>

                            {/* Resale Item Details */}
                            <div className="mt-4 flex gap-3.5 border-b border-gray-100 pb-4">
                                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-100 flex items-center justify-center">
                                    {getImage() ? (
                                        <img
                                            src={getImage()}
                                            alt={getProductName()}
                                            className="h-full w-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = "none";
                                            }}
                                        />
                                    ) : (
                                        <ShoppingBag className="h-6 w-6 text-gray-300 stroke-[1.5]" />
                                    )}
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h3 className="truncate text-sm font-semibold text-gray-900">
                                        {getProductName()}
                                    </h3>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        {conditionText} • Pre-owned
                                    </p>
                                    <p className="mt-0.5 text-xs text-gray-400">
                                        Seller: {getSellerName()}
                                    </p>
                                    <p className="mt-1 text-sm font-bold text-gray-900">
                                        {formatCurrency(price)}
                                    </p>
                                </div>
                            </div>

                            {/* Price Breakdown */}
                            <div className="mt-4 space-y-2.5 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span>Item Subtotal</span>
                                    <span className="font-medium text-gray-900">
                                        {formatCurrency(price)}
                                    </span>
                                </div>

                                <div className="flex justify-between">
                                    <span>Delivery</span>
                                    <span className="font-medium text-emerald-600">
                                        Free
                                    </span>
                                </div>
                            </div>

                            <div className="my-4 h-px w-full bg-gray-100" />

                            <div className="flex items-center justify-between text-base font-bold text-gray-900">
                                <span>Total</span>
                                <span>{formatCurrency(price)}</span>
                            </div>

                            {/* Place Order CTA */}
                            <button
                                type="submit"
                                disabled={purchasing}
                                className="mt-6 flex w-full items-center justify-center rounded-full bg-black py-3.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {purchasing ? "Processing Purchase..." : "Place Resale Order"}
                            </button>

                            <Link
                                to={`/resale/${id}`}
                                className="mt-2.5 flex w-full items-center justify-center rounded-full border border-gray-200 py-3 text-xs font-medium text-gray-700 transition hover:border-gray-400 hover:text-black"
                            >
                                Back to Listing
                            </Link>

                            <div className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
                                <ShieldCheck className="h-3.5 w-3.5 text-gray-500" />
                                <span>Secure transaction for verified resale equipment</span>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </main>
    );
};

export default ResalePurchase;