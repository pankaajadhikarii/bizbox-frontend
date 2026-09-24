// src/pages/ResaleDetails.jsx

import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import resaleService from "../services/resaleService";
import { useAuth } from "../context/AuthContext";

const ResaleDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isAuthenticated } = useAuth();

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

        return (
            listing?.imageUrl ||
            listing?.productImageUrl ||
            product.imageUrl ||
            product.image ||
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80"
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

    const getCategory = () => {
        const product = getProduct();
        const category = product.category || listing?.category;

        return (
            listing?.categoryName ||
            category?.name ||
            "Business Equipment"
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

                        <div className="mt-8 grid gap-10 lg:grid-cols-2">
                            <div className="aspect-4/3 rounded-3xl bg-gray-200" />

                            <div className="space-y-6 py-4">
                                <div className="h-4 w-28 rounded bg-gray-200" />
                                <div className="h-10 w-3/4 rounded bg-gray-200" />
                                <div className="h-8 w-40 rounded bg-gray-200" />
                                <div className="space-y-3">
                                    <div className="h-4 w-full rounded bg-gray-200" />
                                    <div className="h-4 w-full rounded bg-gray-200" />
                                    <div className="h-4 w-2/3 rounded bg-gray-200" />
                                </div>
                                <div className="h-14 w-full rounded-full bg-gray-200" />
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !listing) {
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

                <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
                    <div className="w-full rounded-3xl border border-gray-200 px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <svg
                                className="h-7 w-7 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M12 9v3m0 4h.01M10.29 3.86l-8.04 14A2 2 0 004 21h16a2 2 0 001.75-3.14l-8.04-14a2 2 0 00-3.42 0z"
                                />
                            </svg>
                        </div>

                        <h1 className="mt-6 text-2xl font-semibold">
                            Listing unavailable
                        </h1>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                            {error ||
                                "This resale listing could not be found or is no longer available."}
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

    const imageUrl = getImage();

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
            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
                {/* Breadcrumb */}
                <div className="mb-8 flex items-center gap-2 text-sm text-gray-500">
                    <Link
                        to="/resale"
                        className="transition hover:text-black"
                    >
                        Resale
                    </Link>

                    <span>/</span>

                    <span className="truncate text-gray-900">
                        {getProductName()}
                    </span>
                </div>

                {/* Product */}
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
                    {/* Image */}
                    <div className="overflow-hidden rounded-3xl bg-gray-100">
                        <div className="aspect-4/3">
                            <img
                                src={
                                    imageError
                                        ? "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1400&q=80"
                                        : imageUrl
                                }
                                alt={getProductName()}
                                className="h-full w-full object-cover"
                                onError={() => setImageError(true)}
                            />
                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                                Pre-owned
                            </span>

                            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                {getCategory()}
                            </span>
                        </div>

                        <h1 className="mt-5 text-4xl font-semibold tracking-tight sm:text-5xl">
                            {getProductName()}
                        </h1>

                        <p className="mt-5 text-3xl font-semibold tracking-tight">
                            {formatCurrency(getPrice())}
                        </p>

                        <div className="mt-8 border-t border-gray-200 pt-8">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                                Description
                            </h2>

                            <p className="mt-4 text-base leading-7 text-gray-600">
                                {getDescription()}
                            </p>
                        </div>

                        <div className="mt-8 rounded-2xl border border-gray-200 p-5">
                            <p className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                Listed by
                            </p>

                            <p className="mt-2 text-base font-semibold">
                                {getSellerName()}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handlePurchase}
                            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Purchase Equipment

                            <svg
                                className="h-5 w-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="1.5"
                                    d="M5 12h14M13 6l6 6-6 6"
                                />
                            </svg>
                        </button>

                        <p className="mt-4 text-center text-xs leading-5 text-gray-500">
                            You will review the purchase details before the order
                            is placed.
                        </p>
                    </div>
                </div>

                {/* Back */}
                <div className="mt-16 border-t border-gray-200 pt-8">
                    <Link
                        to="/resale"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 transition hover:text-black"
                    >
                        <svg
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M19 12H5m7 7l-7-7 7-7"
                            />
                        </svg>

                        Back to Resale Marketplace
                    </Link>
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

export default ResaleDetails;