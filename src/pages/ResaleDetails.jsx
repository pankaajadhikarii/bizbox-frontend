import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import resaleService from "../services/resaleService";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/imageUrl";
import { ArrowLeft, CheckCircle2, ShoppingBag } from "lucide-react";

const CONDITION_INFO = {
    0: { label: "Like New", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    1: { label: "Good", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    2: { label: "Fair", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

const ResaleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated, user } = useAuth();

    const [listing, setListing] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [imageError, setImageError] = useState(false);

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
            "Previously owned business equipment available for resale."
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

    const getCategory = () => {
        const product = getProduct();
        const category = product.category || listing?.category;
        return (
            listing?.categoryName ||
            category?.name ||
            "Equipment"
        );
    };

    const formatCurrency = (amount) => {
        const value = Number(amount) || 0;
        return `Rs. ${value.toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        })}`;
    };

    const isSold = listing?.status === 1;
    const isRemoved = listing?.status === 2;
    const isOwnListing = Boolean(user?.id && listing?.sellerId && user.id === listing.sellerId);

    const handlePurchase = () => {
        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `/resale/${id}`,
                },
            });
            return;
        }

        navigate(`/resale/${id}/purchase`);
    };

    if (loading) {
        return (
            <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                <div className="animate-pulse">
                    <div className="h-4 w-32 rounded bg-gray-200 sm:w-40" />

                    <div className="mt-6 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-2 lg:gap-10">
                        <div className="aspect-square w-full rounded-2xl bg-gray-200" />

                        <div className="space-y-4 py-1 sm:py-2">
                            <div className="h-5 w-24 rounded bg-gray-200" />
                            <div className="h-8 w-3/4 rounded bg-gray-200 sm:h-9" />
                            <div className="h-7 w-32 rounded bg-gray-200 sm:w-36" />

                            <div className="my-5 h-px w-full bg-gray-200 sm:my-6" />

                            <div className="space-y-2">
                                <div className="h-4 w-full rounded bg-gray-200" />
                                <div className="h-4 w-5/6 rounded bg-gray-200" />
                            </div>

                            <div className="mt-6 h-12 w-full rounded-xl bg-gray-200 sm:mt-8" />
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    if (error || !listing) {
        return (
            <main className="mx-auto flex min-h-[60vh] max-w-2xl items-center justify-center px-4 py-12 sm:px-6 sm:py-16">
                <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 text-center sm:p-12">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                        <ShoppingBag className="h-7 w-7" />
                    </div>

                    <h1 className="mt-5 text-xl font-semibold text-gray-900 sm:text-2xl">
                        Listing Unavailable
                    </h1>

                    <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500">
                        {error || "This resale listing could not be found or is no longer available."}
                    </p>

                    <Link
                        to="/resale"
                        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 sm:w-auto sm:px-6"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Resale Marketplace
                    </Link>
                </div>
            </main>
        );
    }

    const cond = CONDITION_INFO[listing.condition] || {
        label: "Good",
        cls: "bg-gray-100 text-gray-700 border-gray-200",
    };

    return (
        <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
            {/* Breadcrumb */}
            <div className="mb-5 flex min-w-0 flex-wrap items-center gap-1.5 text-xs text-gray-500 sm:mb-6 sm:gap-2">
                <Link to="/" className="shrink-0 transition hover:text-black">
                    Home
                </Link>

                <span className="shrink-0">/</span>

                <Link to="/resale" className="shrink-0 transition hover:text-black">
                    Resale
                </Link>

                <span className="shrink-0">/</span>

                <span className="min-w-0 truncate font-medium text-black">
                    {getProductName()}
                </span>
            </div>

            {/* Product Section */}
            <div className="grid grid-cols-1 items-start gap-7 sm:gap-8 lg:grid-cols-2 lg:gap-10">
                {/* Image Column */}
                <div className="min-w-0">
                    <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 flex items-center justify-center">
                        {getImage() && !imageError ? (
                            <img
                                src={getImage()}
                                alt={getProductName()}
                                className="h-full w-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        ) : (
                            <div className="flex flex-col items-center justify-center text-gray-300">
                                <ShoppingBag className="h-14 w-14 stroke-[1.2] sm:h-16 sm:w-16" />
                            </div>
                        )}

                        {isSold && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 p-4">
                                <span className="rounded-lg bg-white px-4 py-1.5 text-center text-xs font-bold uppercase tracking-wider text-black sm:text-sm">
                                    Sold Out
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="mt-3 sm:mt-4">
                        <Link
                            to="/resale"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-black"
                        >
                            <ArrowLeft className="h-3.5 w-3.5" />
                            Back to Resale Marketplace
                        </Link>
                    </div>
                </div>

                {/* Details Column */}
                <div className="flex min-w-0 flex-col">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                        <span className={`inline-flex max-w-full rounded-md border px-2.5 py-1 text-xs font-medium ${cond.cls}`}>
                            Condition: {cond.label}
                        </span>

                        <span className="text-xs text-gray-400">
                            Pre-owned
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="mt-3 break-words text-2xl font-semibold tracking-tight text-gray-900 sm:text-3xl">
                        {getProductName()}
                    </h1>

                    {/* Price */}
                    <div className="mt-3 sm:mt-4">
                        <span className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                            {formatCurrency(getPrice())}
                        </span>
                    </div>

                    <div className="my-5 h-px w-full bg-gray-200 sm:my-6" />

                    {/* Description */}
                    <div>
                        <h2 className="text-sm font-semibold text-black">
                            Description
                        </h2>

                        <p className="mt-2 break-words text-sm leading-6 text-gray-600">
                            {getDescription()}
                        </p>
                    </div>

                    {/* Seller Box */}
                    <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50/70 p-4 sm:mt-6">
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                            Listed by
                        </p>

                        <div className="mt-1 flex min-w-0 items-center justify-between gap-3">
                            <span className="min-w-0 break-words text-sm font-semibold text-gray-900">
                                {getSellerName()}
                            </span>
                        </div>
                    </div>

                    {/* Purchase Action Button */}
                    <div className="mt-5 sm:mt-6">
                        {isSold ? (
                            <button
                                type="button"
                                disabled
                                className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-400"
                            >
                                This Item Has Been Sold
                            </button>
                        ) : isRemoved ? (
                            <button
                                type="button"
                                disabled
                                className="flex min-h-12 w-full cursor-not-allowed items-center justify-center rounded-xl bg-gray-100 px-4 py-3 text-center text-sm font-semibold text-gray-400"
                            >
                                Listing No Longer Available
                            </button>
                        ) : isOwnListing ? (
                            <Link
                                to="/resale"
                                className="flex min-h-12 w-full items-center justify-center rounded-xl border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold leading-5 text-gray-800 transition hover:border-black hover:text-black"
                            >
                                This Is Your Listing (Manage in Resale)
                            </Link>
                        ) : (
                            <button
                                type="button"
                                onClick={handlePurchase}
                                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-gray-800 sm:px-6"
                            >
                                Purchase Equipment
                            </button>
                        )}

                        <p className="mt-3 text-center text-xs leading-5 text-gray-400">
                            You will review delivery address and payment before completing your order.
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default ResaleDetails;