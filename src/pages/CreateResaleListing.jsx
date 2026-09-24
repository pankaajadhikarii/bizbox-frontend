import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import productService from "../services/productService";
import resaleService from "../services/resaleService";

const CreateResaleListing = () => {
    const navigate = useNavigate();

    const [products, setProducts] = useState([]);
    const [productId, setProductId] = useState("");
    const [price, setPrice] = useState("");
    const [description, setDescription] = useState("");

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setLoading(true);
                setError("");

                const response = await productService.getAll();

                const productList = Array.isArray(response)
                    ? response
                    : response?.products ||
                    response?.items ||
                    response?.data ||
                    [];

                setProducts(productList);
            } catch (err) {
                setError(
                    err.userMessage ||
                    err.response?.data?.message ||
                    "Unable to load equipment."
                );
            } finally {
                setLoading(false);
            }
        };

        loadProducts();
    }, []);

    const getProductName = (product) => {
        return (
            product?.name ||
            product?.productName ||
            "Unnamed Equipment"
        );
    };

    const getProductImage = (product) => {
        return (
            product?.imageUrl ||
            product?.image ||
            "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80"
        );
    };

    const getProductPrice = (product) => {
        return (
            product?.price ??
            product?.unitPrice ??
            0
        );
    };

    const selectedProduct = products.find(
        (product) =>
            String(product?.id) === String(productId)
    );

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");

        if (!productId) {
            setError("Please select the equipment you want to sell.");
            return;
        }

        if (!price || Number(price) <= 0) {
            setError("Please enter a valid resale price.");
            return;
        }

        if (!description.trim()) {
            setError("Please provide a description of the equipment.");
            return;
        }

        try {
            setSubmitting(true);

            const response = await resaleService.create({
                productId: Number(productId),
                price: Number(price),
                description: description.trim(),
            });

            const listingId =
                response?.id ||
                response?.listingId ||
                response?.resaleListingId;

            if (listingId) {
                navigate(`/resale/${listingId}`);
            } else {
                navigate("/resale");
            }
        } catch (err) {
            setError(
                err.userMessage ||
                err.response?.data?.message ||
                "Unable to create the resale listing."
            );
        } finally {
            setSubmitting(false);
        }
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
                        to="/resale"
                        className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-medium transition hover:border-black"
                    >
                        Back to Resale
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
                {/* Heading */}
                <div className="max-w-2xl">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                        Resale Marketplace
                    </p>

                    <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
                        Sell your equipment
                    </h1>

                    <p className="mt-5 text-base leading-7 text-gray-600">
                        Turn equipment you no longer need into value by
                        listing it on the BizKit resale marketplace.
                    </p>
                </div>

                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_420px]">
                    {/* Form */}
                    <section className="rounded-3xl border border-gray-200 p-6 sm:p-8">
                        <h2 className="text-xl font-semibold">
                            Listing Information
                        </h2>

                        <p className="mt-2 text-sm text-gray-500">
                            Provide the details buyers need to understand
                            your equipment.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-8 space-y-6"
                        >
                            {error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                                    <p className="text-sm leading-6 text-red-700">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Product */}
                            <div>
                                <label
                                    htmlFor="product"
                                    className="text-sm font-medium text-gray-900"
                                >
                                    Equipment
                                </label>

                                {loading ? (
                                    <div className="mt-2 h-12 animate-pulse rounded-2xl bg-gray-100" />
                                ) : (
                                    <select
                                        id="product"
                                        value={productId}
                                        onChange={(event) =>
                                            setProductId(
                                                event.target.value
                                            )
                                        }
                                        className="mt-2 w-full rounded-2xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-black"
                                    >
                                        <option value="">
                                            Select equipment
                                        </option>

                                        {products.map((product) => (
                                            <option
                                                key={product.id}
                                                value={product.id}
                                            >
                                                {getProductName(product)}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            {/* Price */}
                            <div>
                                <label
                                    htmlFor="price"
                                    className="text-sm font-medium text-gray-900"
                                >
                                    Resale Price
                                </label>

                                <div className="relative mt-2">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                                        NPR
                                    </span>

                                    <input
                                        id="price"
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={price}
                                        onChange={(event) =>
                                            setPrice(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Enter your asking price"
                                        className="w-full rounded-2xl border border-gray-300 py-3 pl-14 pr-4 text-sm outline-none transition placeholder:text-gray-400 focus:border-black"
                                    />
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label
                                    htmlFor="description"
                                    className="text-sm font-medium text-gray-900"
                                >
                                    Description
                                </label>

                                <textarea
                                    id="description"
                                    rows={6}
                                    value={description}
                                    onChange={(event) =>
                                        setDescription(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Describe the condition, usage, age, included accessories, and any other useful details..."
                                    className="mt-2 w-full resize-none rounded-2xl border border-gray-300 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-gray-400 focus:border-black"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting || loading}
                                className="w-full rounded-full bg-black px-6 py-4 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {submitting
                                    ? "Publishing Listing..."
                                    : "Publish Listing"}
                            </button>

                            <Link
                                to="/resale"
                                className="flex w-full items-center justify-center rounded-full border border-gray-300 px-6 py-4 text-sm font-medium transition hover:border-black"
                            >
                                Cancel
                            </Link>
                        </form>
                    </section>

                    {/* Preview */}
                    <aside className="h-fit lg:sticky lg:top-24">
                        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white">
                            <div className="border-b border-gray-200 px-6 py-5">
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
                                    Listing Preview
                                </p>
                            </div>

                            {selectedProduct ? (
                                <>
                                    <div className="aspect-[4/3] bg-gray-100">
                                        <img
                                            src={getProductImage(
                                                selectedProduct
                                            )}
                                            alt={getProductName(
                                                selectedProduct
                                            )}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.src =
                                                    "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=1000&q=80";
                                            }}
                                        />
                                    </div>

                                    <div className="p-6">
                                        <span className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                                            Pre-owned
                                        </span>

                                        <h3 className="mt-4 text-xl font-semibold">
                                            {getProductName(
                                                selectedProduct
                                            )}
                                        </h3>

                                        <p className="mt-2 text-sm text-gray-500">
                                            Previously owned business
                                            equipment.
                                        </p>

                                        <div className="mt-6 flex items-end justify-between border-t border-gray-200 pt-5">
                                            <span className="text-sm text-gray-500">
                                                Asking Price
                                            </span>

                                            <span className="text-xl font-semibold">
                                                NPR{" "}
                                                {price
                                                    ? Number(
                                                        price
                                                    ).toLocaleString(
                                                        "en-US"
                                                    )
                                                    : "0"}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="flex min-h-[420px] items-center justify-center px-8 text-center">
                                    <div>
                                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                                            <span className="text-2xl text-gray-400">
                                                +
                                            </span>
                                        </div>

                                        <h3 className="mt-5 text-lg font-semibold">
                                            Your listing preview
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                            Select your equipment to see
                                            how your resale listing will
                                            appear.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-5 rounded-3xl bg-gray-50 p-6">
                            <h3 className="font-semibold">
                                Before you list
                            </h3>

                            <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-600">
                                <li>
                                    • Make sure you own the equipment.
                                </li>

                                <li>
                                    • Set a realistic resale price.
                                </li>

                                <li>
                                    • Clearly describe the equipment's
                                    condition.
                                </li>

                                <li>
                                    • Include important accessories or
                                    limitations.
                                </li>
                            </ul>
                        </div>
                    </aside>
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-16 border-t border-gray-200">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-gray-500 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p>
                        © {new Date().getFullYear()} BizKit. All rights
                        reserved.
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
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default CreateResaleListing;