// src/pages/Resale.jsx

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import resaleService from "../services/resaleService";
import { resolveImageUrl } from "../utils/imageUrl";

const Resale = () => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadListings = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await resaleService.getAll();

            const listingData = Array.isArray(data)
                ? data
                : data?.listings ||
                data?.items ||
                data?.data ||
                [];

            setListings(listingData);
        } catch (err) {
            setError(
                err.userMessage ||
                err.response?.data?.message ||
                "Unable to load resale listings."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadListings();
    }, []);

    const getId = (listing) =>
        listing.id ||
        listing.resaleListingId ||
        listing.listingId ||
        listing._id;

    const getProduct = (listing) =>
        listing.product ||
        listing.productDetails ||
        listing.item ||
        {};

    const getProductName = (listing) => {
        const product = getProduct(listing);

        return (
            listing.productName ||
            product.name ||
            listing.name ||
            "Equipment"
        );
    };

    const getDescription = (listing) => {
        const product = getProduct(listing);

        return (
            listing.description ||
            product.description ||
            "Previously owned business equipment available for resale."
        );
    };

    const getImage = (listing) => {
        const product = getProduct(listing);
        const raw =
            listing.imageUrl ||
            listing.productImageUrl ||
            product.imageUrl ||
            product.image;

        return (
            resolveImageUrl(raw) ||
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80"
        );
    };

    const getPrice = (listing) =>
        listing.price ??
        listing.resalePrice ??
        listing.salePrice ??
        listing.amount ??
        0;

    const getSellerName = (listing) => {
        const seller =
            listing.seller ||
            listing.owner ||
            listing.user ||
            {};

        return (
            listing.sellerName ||
            seller.fullName ||
            seller.name ||
            seller.userName ||
            "BizBox User"
        );
    };

    const getCategory = (listing) => {
        const product = getProduct(listing);
        const category = product.category || listing.category;

        return (
            listing.categoryName ||
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

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="text-2xl font-bold tracking-tight"
                    >
                        BizBox
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

            {/* Hero */}
            <section className="border-b border-gray-200">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
                    <div className="max-w-3xl">
                        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Resale Marketplace
                        </p>

                        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                            Pre-owned equipment.
                            <br />
                            Ready for your business.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg">
                            Discover equipment from other BizBox users and give
                            quality business equipment a second life.
                        </p>
                    </div>
                </div>
            </section>

            {/* Listings */}
            <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                            Marketplace
                        </p>

                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                            Available Equipment
                        </h2>
                    </div>

                    {!loading && !error && listings.length > 0 && (
                        <p className="text-sm text-gray-500">
                            {listings.length}{" "}
                            {listings.length === 1 ? "listing" : "listings"}
                        </p>
                    )}
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3, 4, 5, 6].map((item) => (
                            <div
                                key={item}
                                className="animate-pulse overflow-hidden rounded-2xl border border-gray-200"
                            >
                                <div className="aspect-4/3 bg-gray-200" />

                                <div className="space-y-4 p-5">
                                    <div className="h-3 w-24 rounded bg-gray-200" />
                                    <div className="h-5 w-40 rounded bg-gray-200" />
                                    <div className="h-4 w-full rounded bg-gray-200" />
                                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                                    <div className="h-10 w-full rounded-full bg-gray-200" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                            !
                        </div>

                        <h2 className="text-lg font-semibold text-red-900">
                            Unable to load resale listings
                        </h2>

                        <p className="mt-2 text-sm text-red-700">
                            {error}
                        </p>

                        <button
                            type="button"
                            onClick={loadListings}
                            className="mt-6 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && listings.length === 0 && (
                    <div className="rounded-3xl border border-gray-200 px-6 py-20 text-center">
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
                                    d="M20 7l-8-4-8 4m16 0v10l-8 4-8-4V7m16 0l-8 4m-8-4l8 4m0 0v10"
                                />
                            </svg>
                        </div>

                        <h2 className="mt-6 text-2xl font-semibold">
                            No resale listings available
                        </h2>

                        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
                            There are currently no pre-owned equipment listings
                            available. Check back later or browse new equipment.
                        </p>

                        <Link
                            to="/equipment"
                            className="mt-7 inline-flex rounded-full bg-black px-7 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                        >
                            Browse Equipment
                        </Link>
                    </div>
                )}

                {/* Listing Grid */}
                {!loading && !error && listings.length > 0 && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {listings.map((listing) => {
                            const id = getId(listing);

                            return (
                                <article
                                    key={id}
                                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-gray-300 hover:shadow-lg"
                                >
                                    {/* Image */}
                                    <Link
                                        to={`/resale/${id}`}
                                        className="block overflow-hidden"
                                    >
                                        <div className="aspect-4/3 overflow-hidden bg-gray-100">
                                            <img
                                                src={getImage(listing)}
                                                alt={getProductName(listing)}
                                                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                onError={(event) => {
                                                    event.currentTarget.src =
                                                        "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1200&q=80";
                                                }}
                                            />
                                        </div>
                                    </Link>

                                    {/* Content */}
                                    <div className="p-5">
                                        <div className="flex items-center justify-between gap-3">
                                            <span className="text-xs font-medium uppercase tracking-wider text-gray-400">
                                                {getCategory(listing)}
                                            </span>

                                            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-600">
                                                Pre-owned
                                            </span>
                                        </div>

                                        <Link
                                            to={`/resale/${id}`}
                                            className="mt-3 block"
                                        >
                                            <h3 className="text-xl font-semibold tracking-tight transition group-hover:text-gray-600">
                                                {getProductName(listing)}
                                            </h3>
                                        </Link>

                                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600">
                                            {getDescription(listing)}
                                        </p>

                                        <div className="mt-5 flex items-end justify-between gap-4">
                                            <div>
                                                <p className="text-xs text-gray-400">
                                                    Listed by
                                                </p>

                                                <p className="mt-1 text-sm font-medium text-gray-700">
                                                    {getSellerName(listing)}
                                                </p>
                                            </div>

                                            <p className="text-lg font-semibold">
                                                {formatCurrency(getPrice(listing))}
                                            </p>
                                        </div>

                                        <Link
                                            to={`/resale/${id}`}
                                            className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800"
                                        >
                                            View Listing

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
                                                    d="M5 12h14M13 6l6 6-6 6"
                                                />
                                            </svg>
                                        </Link>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* Sell Banner */}
            <section className="bg-black text-white">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-2xl">
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
                                Have equipment you no longer need?
                            </p>

                            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                                Turn your unused equipment into value.
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-gray-400 sm:text-base">
                                List eligible equipment you own and connect with
                                businesses looking for pre-owned equipment.
                            </p>
                        </div>

                        <Link
                            to="/resale/create"
                            className="inline-flex shrink-0 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-medium text-black transition hover:bg-gray-200"
                        >
                            List Equipment
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-gray-200">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p>
                        © {new Date().getFullYear()} BizBox. All rights reserved.
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

export default Resale;