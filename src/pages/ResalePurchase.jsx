import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import resaleService from "../services/resaleService";

const ResalePurchase = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [listing, setListing] = useState(null);
    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState(2);

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

    const getDescription = () => {
        const product = getProduct();

        return (
            listing?.description ||
            product.description ||
            "Previously owned business equipment."
        );
    };

    const getImage = () => {
        const product = getProduct();

        return (
            listing?.imageUrl ||
            listing?.productImageUrl ||
            product.imageUrl ||
            product.image ||
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
        );
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
            "BizKit User"
        );
    };

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

    const handlePurchase = async (event) => {
        event.preventDefault();

        if (!shippingAddress.trim()) {
            setError("Please enter your shipping address.");
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
                navigate(`/orders/${orderId}`);
                return;
            }

            navigate("/orders");
        } catch (err) {
            setError(
                err.userMessage ||
                err.response?.data?.message ||
                "Unable to complete the purchase."
            );
        } finally {
            setPurchasing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white text-gray-900">
                <header className="border-b border-gray-200">
                    <div className="mx-auto flex h-16 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
                        <Link
                            to="/"
                            className="text-2xl font-bold tracking-tight"
                        >
                            BizKit
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-4 w-32 rounded bg-gray-200" />

                        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_420px]">
                            <div className="rounded-3xl border border-gray-200 p-6">
                                <div className="aspect-[4/3] rounded-2xl bg-gray-200" />

                                <div className="mt-6 space-y-4">
                                    <div className="h-6 w-48 rounded bg-gray-200" />
                                    <div className="h-4 w-32 rounded bg-gray-200" />
                                    <div className="h-4 w-full rounded bg-gray-200" />
                                </div>
                            </div>

                            <div className="space-y-5 rounded-3xl border border-gray-200 p-6">
                                <div className="h-7 w-40 rounded bg-gray-200" />
                                <div className="h-12 w-full rounded bg-gray-200" />
                                <div className="h-12 w-full rounded bg-gray-200" />
                                <div className="h-12 w-full rounded-full bg-gray-200" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error && !listing) {
        return (
            <div className="min-h-screen bg-white text-gray-900">
                <header className="border-b border-gray-200">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                        <Link
                            to="/"
                            className="text-2xl font-bold tracking-tight"
                        >
                            BizKit
                        </Link>

                        <Link
                            to="/resale"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Back to Resale
                        </Link>
                    </div>
                </header>

                <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16">
                    <div className="w-full rounded-3xl border border-gray-200 px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <span className="text-xl text-gray-500">!</span>
                        </div>

                        <h1 className="mt-6 text-2xl font-semibold">
                            Listing unavailable
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                            {error}
                        </p>

                        <Link
                            to="/resale"
                            className="mt-7 inline-flex rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Back to Resale
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="text-2xl font-bold tracking-tight"
                    >
                        BizKit
                    </Link>

                    <nav className="hidden items-center gap-8 md:flex">
                        <Link
                            to="/"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Home
                        </Link>

                        <Link
                            to="/equipment"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/resale"
                            className="text-sm font-medium text-black"
                        >
                            Resale
                        </Link>

                        <Link
                            to="/orders"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Orders
                        </Link>

                        <Link
                            to="/cart"
                            className="text-sm text-gray-600 transition hover:text-black"
                        >
                            Cart
                        </Link>
                    </nav>

                    <Link
                        to="/equipment"
                        className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Shop Equipment
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
                    <Link
                        to="/resale"
                        className="transition hover:text-black"
                    >
                        Resale
                    </Link>

                    <span>/</span>

                    <Link
                        to={`/resale/${id}`}
                        className="transition hover:text-black"
                    >
                        {getProductName()}
                    </Link>

                    <span>/</span>

                    <span className="text-gray-900">
                        Purchase
                    </span>
                </div>

                <div className="grid gap-10 lg:grid-cols-[1fr_420px]">
                    {/* Product Summary */}
                    <section className="rounded-3xl border border-gray-200 p-5 sm:p-7">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Purchase Equipment
                        </p>

                        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                            Review your purchase
                        </h1>

                        <div className="mt-8 overflow-hidden rounded-2xl bg-gray-100">
                            <div className="aspect-[4/3]">
                                <img
                                    src={getImage()}
                                    alt={getProductName()}
                                    className="h-full w-full object-cover"
                                    onError={(event) => {
                                        event.currentTarget.src =
                                            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80";
                                    }}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                                Pre-owned
                            </span>

                            <h2 className="mt-4 text-2xl font-semibold">
                                {getProductName()}
                            </h2>

                            <p className="mt-3 text-sm leading-6 text-gray-600">
                                {getDescription()}
                            </p>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-400">
                                        Seller
                                    </p>

                                    <p className="mt-2 text-sm font-semibold">
                                        {getSellerName()}
                                    </p>
                                </div>

                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <p className="text-xs uppercase tracking-wider text-gray-400">
                                        Price
                                    </p>

                                    <p className="mt-2 text-sm font-semibold">
                                        {formatCurrency(getPrice())}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Purchase Form */}
                    <section className="h-fit rounded-3xl border border-gray-200 p-6 sm:p-7">
                        <h2 className="text-xl font-semibold">
                            Order Details
                        </h2>

                        <form
                            onSubmit={handlePurchase}
                            className="mt-7 space-y-6"
                        >
                            {error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm leading-6 text-red-700">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Shipping Address */}
                            <div>
                                <label
                                    htmlFor="shippingAddress"
                                    className="text-sm font-medium text-gray-900"
                                >
                                    Shipping Address
                                </label>

                                <textarea
                                    id="shippingAddress"
                                    value={shippingAddress}
                                    onChange={(event) =>
                                        setShippingAddress(event.target.value)
                                    }
                                    placeholder="Enter your complete shipping address"
                                    rows={4}
                                    className="mt-2 w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none transition placeholder:text-gray-400 focus:border-black"
                                />
                            </div>

                            {/* Payment Method */}
                            <div>
                                <label className="text-sm font-medium text-gray-900">
                                    Payment Method
                                </label>

                                <div className="mt-3 space-y-3">
                                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-gray-400">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="0"
                                            checked={paymentMethod === 0}
                                            onChange={() => setPaymentMethod(0)}
                                            className="h-4 w-4"
                                        />

                                        <span className="text-sm font-medium">
                                            eSewa
                                        </span>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-gray-400">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="1"
                                            checked={paymentMethod === 1}
                                            onChange={() => setPaymentMethod(1)}
                                            className="h-4 w-4"
                                        />

                                        <span className="text-sm font-medium">
                                            Khalti
                                        </span>
                                    </label>

                                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-gray-400">
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="2"
                                            checked={paymentMethod === 2}
                                            onChange={() => setPaymentMethod(2)}
                                            className="h-4 w-4"
                                        />

                                        <span className="text-sm font-medium">
                                            Cash on Delivery
                                        </span>
                                    </label>
                                </div>
                            </div>

                            {/* Total */}
                            <div className="border-t border-gray-200 pt-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">
                                        Total
                                    </span>

                                    <span className="text-xl font-semibold">
                                        {formatCurrency(getPrice())}
                                    </span>
                                </div>
                            </div>

                            {/* Purchase */}
                            <button
                                type="submit"
                                disabled={purchasing}
                                className="flex w-full items-center justify-center rounded-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {purchasing
                                    ? "Processing Purchase..."
                                    : "Place Purchase"}
                            </button>

                            <Link
                                to={`/resale/${id}`}
                                className="flex w-full items-center justify-center rounded-full border border-gray-300 px-6 py-4 text-sm font-medium text-gray-900 transition hover:border-black"
                            >
                                Back to Listing
                            </Link>
                        </form>
                    </section>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-16 border-t border-gray-200">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p>
                        © {new Date().getFullYear()} BizKit. All rights reserved.
                    </p>

                    <div className="flex gap-6">
                        <Link
                            to="/equipment"
                            className="transition hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/resale"
                            className="transition hover:text-black"
                        >
                            Resale
                        </Link>

                        <Link
                            to="/orders"
                            className="transition hover:text-black"
                        >
                            Orders
                        </Link>

                        <Link
                            to="/cart"
                            className="transition hover:text-black"
                        >
                            Cart
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default ResalePurchase;