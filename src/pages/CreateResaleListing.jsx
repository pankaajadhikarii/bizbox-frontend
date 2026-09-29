import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import productService from "../services/productService";
import resaleService from "../services/resaleService";
import { resolveImageUrl } from "../utils/imageUrl";

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
        const raw = product?.imageUrl || product?.image;
        return resolveImageUrl(raw) || "";
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
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
                    <Link
                        to="/"
                        className="shrink-0 text-xl font-bold tracking-tight sm:text-2xl"
                    >
                        BizBox
                    </Link>

                    <nav className="hidden items-center gap-6 md:flex lg:gap-8">
                        <Link
                            to="/"
                            className="text-sm text-gray-600 transition-colors hover:text-black"
                        >
                            Home
                        </Link>

                        <Link
                            to="/equipment"
                            className="text-sm text-gray-600 transition-colors hover:text-black"
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
                            className="text-sm text-gray-600 transition-colors hover:text-black"
                        >
                            Orders
                        </Link>

                        <Link
                            to="/cart"
                            className="text-sm text-gray-600 transition-colors hover:text-black"
                        >
                            Cart
                        </Link>
                    </nav>

                    <Link
                        to="/resale"
                        className="shrink-0 rounded-full border border-gray-300 px-3.5 py-2 text-xs font-medium transition-colors hover:border-black sm:px-5 sm:py-2.5 sm:text-sm"
                    >
                        <span className="sm:hidden">Back</span>
                        <span className="hidden sm:inline">Back to Resale</span>
                    </Link>
                </div>
            </header>

            {/* Main */}
            <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6 sm:py-10 lg:px-8 lg:py-16">
                {/* Heading */}
                <div className="max-w-2xl">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 sm:text-xs sm:tracking-[0.2em]">
                        Resale Marketplace
                    </p>

                    <h1 className="mt-2 break-words text-3xl font-semibold tracking-tight sm:mt-3 sm:text-4xl lg:text-5xl">
                        Sell your equipment
                    </h1>

                    <p className="mt-4 max-w-xl text-sm leading-6 text-gray-600 sm:mt-5 sm:text-base sm:leading-7">
                        Turn equipment you no longer need into value by
                        listing it on the BizBox resale marketplace.
                    </p>
                </div>

                <div className="mt-7 grid gap-7 sm:mt-10 sm:gap-10 lg:grid-cols-[minmax(0,1fr)_420px]">
                    {/* Form */}
                    <section className="min-w-0 rounded-2xl border border-gray-200 p-4 sm:rounded-3xl sm:p-6 lg:p-8">
                        <h2 className="text-lg font-semibold sm:text-xl">
                            Listing Information
                        </h2>

                        <p className="mt-2 text-sm leading-6 text-gray-500">
                            Provide the details buyers need to understand
                            your equipment.
                        </p>

                        <form
                            onSubmit={handleSubmit}
                            className="mt-6 space-y-5 sm:mt-8 sm:space-y-6"
                        >
                            {error && (
                                <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                                    <p className="break-words text-sm leading-6 text-red-700">
                                        {error}
                                    </p>
                                </div>
                            )}

                            {/* Product */}
                            <div className="min-w-0">
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
                                        className="mt-2 w-full min-w-0 rounded-2xl border border-gray-300 bg-white px-3.5 py-3 text-sm outline-none transition-colors focus:border-black sm:px-4"
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
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 sm:left-4">
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
                                        className="w-full rounded-2xl border border-gray-300 py-3 pl-12 pr-3.5 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-black sm:pl-14 sm:pr-4"
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
                                    className="mt-2 w-full resize-none rounded-2xl border border-gray-300 px-3.5 py-3 text-sm leading-6 outline-none transition-colors placeholder:text-gray-400 focus:border-black sm:px-4"
                                />
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={submitting || loading}
                                className="w-full rounded-full bg-black px-5 py-3.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 sm:px-6 sm:py-4"
                            >
                                {submitting
                                    ? "Publishing Listing..."
                                    : "Publish Listing"}
                            </button>

                            <Link
                                to="/resale"
                                className="flex w-full items-center justify-center rounded-full border border-gray-300 px-5 py-3.5 text-sm font-medium transition-colors hover:border-black sm:px-6 sm:py-4"
                            >
                                Cancel
                            </Link>
                        </form>
                    </section>

                    {/* Preview */}
                    <aside className="h-fit min-w-0 lg:sticky lg:top-24">
                        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white sm:rounded-3xl">
                            <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 sm:text-xs sm:tracking-[0.2em]">
                                    Listing Preview
                                </p>
                            </div>

                            {selectedProduct ? (
                                <>
                                    <div className="aspect-[4/3] w-full bg-gray-100">
                                        <img
                                            src={getProductImage(
                                                selectedProduct
                                            )}
                                            alt={getProductName(
                                                selectedProduct
                                            )}
                                            className="h-full w-full object-cover"
                                            onError={(event) => {
                                                event.currentTarget.style.display = "none";
                                            }}
                                        />
                                    </div>

                                    <div className="p-4 sm:p-6">
                                        <span className="inline-block rounded-full bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-600">
                                            Pre-owned
                                        </span>

                                        <h3 className="mt-3 break-words text-lg font-semibold sm:mt-4 sm:text-xl">
                                            {getProductName(
                                                selectedProduct
                                            )}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-500">
                                            Previously owned business
                                            equipment.
                                        </p>

                                        <div className="mt-5 flex flex-wrap items-end justify-between gap-3 border-t border-gray-200 pt-4 sm:mt-6 sm:pt-5">
                                            <span className="text-sm text-gray-500">
                                                Asking Price
                                            </span>

                                            <span className="break-words text-lg font-semibold sm:text-xl">
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
                                <div className="flex min-h-[320px] items-center justify-center px-6 py-10 text-center sm:min-h-[420px] sm:px-8">
                                    <div className="max-w-sm">
                                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 sm:h-16 sm:w-16">
                                            <span className="text-2xl text-gray-400">
                                                +
                                            </span>
                                        </div>

                                        <h3 className="mt-4 text-base font-semibold sm:mt-5 sm:text-lg">
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

                        <div className="mt-4 rounded-2xl bg-gray-50 p-5 sm:mt-5 sm:rounded-3xl sm:p-6">
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
            <footer className="mt-10 border-t border-gray-200 sm:mt-16">
                <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-7 text-sm text-gray-500 sm:px-6 sm:py-8 md:flex-row md:items-center md:justify-between lg:px-8">
                    <p className="text-center md:text-left">
                        © {new Date().getFullYear()} BizBox. All rights
                        reserved.
                    </p>

                    <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 sm:gap-x-6">
                        <Link
                            to="/equipment"
                            className="transition-colors hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/resale"
                            className="transition-colors hover:text-black"
                        >
                            Resale
                        </Link>

                        <Link
                            to="/orders"
                            className="transition-colors hover:text-black"
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