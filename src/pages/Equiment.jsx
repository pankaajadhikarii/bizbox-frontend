import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import businessTypeService from "../services/businessTypeService";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import cartService from "../services/cartService";
import { useAuth } from "../context/AuthContext";

const fallbackImages = [
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1581579185169-4c9b3b3f2a4d?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=900&q=80",
];

const Equipment = () => {
    const { isAuthenticated } = useAuth();
    const [searchParams] = useSearchParams();

    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [businessTypes, setBusinessTypes] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [stockOnly, setStockOnly] = useState(false);
    const [sortBy, setSortBy] = useState("featured");

    const [visibleCount, setVisibleCount] = useState(8);

    const [addingProductId, setAddingProductId] = useState(null);
    const [cartMessage, setCartMessage] = useState("");

    const businessTypeId = searchParams.get("businessTypeId");

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        if (businessTypeId) {
            loadBusinessTypeProducts(businessTypeId);
        }
    }, [businessTypeId]);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [
                productsData,
                categoriesData,
                businessTypesData,
            ] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
                businessTypeService.getAll(),
            ]);

            setProducts(
                Array.isArray(productsData) ? productsData : []
            );

            setCategories(
                Array.isArray(categoriesData) ? categoriesData : []
            );

            setBusinessTypes(
                Array.isArray(businessTypesData)
                    ? businessTypesData
                    : []
            );
        } catch (err) {
            setError(
                err.userMessage ||
                "Unable to load equipment. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const loadBusinessTypeProducts = async (id) => {
        try {
            const data = await businessTypeService.getProducts(id);

            if (!Array.isArray(data)) {
                return;
            }

            const mappedProducts = data
                .map((item) => item.product || item)
                .filter(Boolean);

            if (mappedProducts.length > 0) {
                setProducts(mappedProducts);
            }
        } catch {
            // Keep the normal product catalog if this request fails.
        }
    };

    const getCategoryName = (product) => {
        return (
            product.category?.name ||
            product.categoryName ||
            categories.find(
                (category) =>
                    category.id === product.categoryId
            )?.name ||
            "Equipment"
        );
    };

    const getProductImage = (product, index) => {
        return (
            product.imageUrl ||
            product.image ||
            fallbackImages[index % fallbackImages.length]
        );
    };

    const filteredProducts = useMemo(() => {
        let result = [...products];

        const query = searchQuery.trim().toLowerCase();

        if (query) {
            result = result.filter((product) => {
                const name =
                    product.name?.toLowerCase() || "";

                const description =
                    product.description?.toLowerCase() || "";

                const category =
                    getCategoryName(product).toLowerCase();

                return (
                    name.includes(query) ||
                    description.includes(query) ||
                    category.includes(query)
                );
            });
        }

        if (selectedCategory !== "all") {
            result = result.filter((product) => {
                const categoryName = getCategoryName(product)
                    .toLowerCase()
                    .trim();

                return (
                    categoryName ===
                    selectedCategory.toLowerCase()
                );
            });
        }

        if (stockOnly) {
            result = result.filter(
                (product) =>
                    Number(product.stockQuantity) > 0
            );
        }

        if (sortBy === "price-low") {
            result.sort(
                (a, b) =>
                    Number(a.price || 0) -
                    Number(b.price || 0)
            );
        }

        if (sortBy === "price-high") {
            result.sort(
                (a, b) =>
                    Number(b.price || 0) -
                    Number(a.price || 0)
            );
        }

        if (sortBy === "name") {
            result.sort((a, b) =>
                (a.name || "").localeCompare(
                    b.name || ""
                )
            );
        }

        return result;
    }, [
        products,
        searchQuery,
        selectedCategory,
        stockOnly,
        sortBy,
        categories,
    ]);

    const visibleProducts = filteredProducts.slice(
        0,
        visibleCount
    );

    const hasMoreProducts =
        visibleCount < filteredProducts.length;

    const categoryNames = useMemo(() => {
        return categories
            .map((category) => category.name)
            .filter(Boolean);
    }, [categories]);

    const handleLoadMore = () => {
        setVisibleCount(
            (current) => current + 8
        );
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setVisibleCount(8);
    };

    const handleSearchChange = (event) => {
        setSearchQuery(event.target.value);
        setVisibleCount(8);
    };

    const handleStockToggle = () => {
        setStockOnly((current) => !current);
        setVisibleCount(8);
    };

    const handleSortChange = (event) => {
        setSortBy(event.target.value);
        setVisibleCount(8);
    };

    const handleClearFilters = () => {
        setSearchQuery("");
        setSelectedCategory("all");
        setStockOnly(false);
        setSortBy("featured");
        setVisibleCount(8);
    };

    const handleAddToCart = async (productId) => {
        if (!isAuthenticated) {
            window.location.href = "/login";
            return;
        }

        try {
            setAddingProductId(productId);
            setCartMessage("");

            await cartService.addItem(productId, 1);

            setCartMessage("Added to cart.");

            setTimeout(() => {
                setCartMessage("");
            }, 2500);
        } catch (err) {
            setCartMessage(
                err.userMessage ||
                "Unable to add this product to your cart."
            );
        } finally {
            setAddingProductId(null);
        }
    };

    const selectedBusinessType = businessTypes.find(
        (businessType) =>
            String(businessType.id) ===
            String(businessTypeId)
    );

    return (
        <div className="min-h-screen bg-[#faf8fe] text-[#1a1b1f]">
            {/* Header */}
            <header className="fixed left-0 right-0 top-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:px-12">
                    <Link
                        to="/"
                        className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75"
                    >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                            B
                        </div>

                        <span className="text-[17px] font-semibold tracking-tight">
                            BizKit
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-7 xl:flex">
                        <Link
                            to="/equipment"
                            className="text-[12px] font-semibold text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            Business Kits
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            Resale & Trade-in
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            How It Works
                        </Link>

                        <Link
                            to="/"
                            className="text-[12px] font-medium text-[#4c4546] transition-colors hover:text-black"
                        >
                            Support
                        </Link>
                    </nav>

                    <div className="flex shrink-0 items-center gap-2">
                        <Link
                            to="/cart"
                            className="flex h-9 items-center gap-2 rounded-full px-3 text-[#4c4546] transition-all hover:bg-[#eeedf3] hover:text-black"
                        >
                            <span className="text-[18px]">
                                🛍
                            </span>

                            <span className="rounded-full bg-[#e9e7ed] px-1.5 py-0.5 text-[10px] font-semibold text-black">
                                Cart
                            </span>
                        </Link>

                        {!isAuthenticated ? (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Link
                                    to="/login"
                                    className="flex h-9 items-center rounded-full px-4 text-[12px] font-medium text-[#4c4546] transition-all hover:bg-[#eeedf3] hover:text-black"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="flex h-9 items-center rounded-full bg-black px-4 text-[12px] font-medium text-white transition-all hover:bg-[#333]"
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <Link
                                to="/orders"
                                className="hidden h-9 items-center rounded-full bg-black px-4 text-[12px] font-medium text-white sm:flex"
                            >
                                Orders
                            </Link>
                        )}

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm text-white">
                            {isAuthenticated ? "U" : "•"}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main */}
            <main className="flex min-h-screen flex-1 flex-col pt-16">
                {/* Page Heading */}
                <section className="mx-auto w-full max-w-7xl px-6 pb-10 pt-12 lg:px-12">
                    <div className="flex flex-col gap-6">
                        <div className="flex items-center gap-3">
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e9e7ed] px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-black">
                                <span className="h-1.5 w-1.5 rounded-full bg-black" />
                                Commercial Equipment
                            </span>

                            <span className="text-[11px] text-[#cfc4c5]">
                                •
                            </span>

                            <span className="text-[11px] text-[#4c4546]">
                                BizKit Catalog
                            </span>
                        </div>

                        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                            <div>
                                <h1 className="text-[42px] font-semibold leading-[1.05] tracking-[-0.035em] sm:text-[52px]">
                                    Equipment.
                                </h1>

                                <p className="mt-3 max-w-2xl text-[17px] leading-7 text-[#4c4546]">
                                    Professional equipment for the
                                    business you're building.
                                </p>

                                {businessTypeId && (
                                    <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-medium shadow-sm ring-1 ring-black/4">
                                        <span className="h-1.5 w-1.5 rounded-full bg-black" />

                                        {selectedBusinessType?.name ||
                                            "Selected Business"}
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-[17px] font-semibold">
                                        {products.length}
                                    </span>

                                    <span className="text-[11px] text-[#4c4546]">
                                        Catalog Units
                                    </span>
                                </div>

                                <div className="h-8 w-px bg-[#e3e2e7]" />

                                <div className="flex flex-col">
                                    <span className="text-[17px] font-semibold">
                                        {categories.length}
                                    </span>

                                    <span className="text-[11px] text-[#4c4546]">
                                        Categories
                                    </span>
                                </div>

                                <div className="h-8 w-px bg-[#e3e2e7]" />

                                <div className="flex flex-col">
                                    <span className="text-[17px] font-semibold">
                                        {
                                            products.filter(
                                                (product) =>
                                                    Number(
                                                        product.stockQuantity
                                                    ) > 0
                                            ).length
                                        }
                                    </span>

                                    <span className="text-[11px] text-[#4c4546]">
                                        In Stock
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Filters */}
                <section className="mx-auto w-full max-w-7xl px-6 pb-12 lg:px-12">
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="relative w-full md:max-w-xl">
                                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[18px] text-[#4c4546]">
                                    ⌕
                                </span>

                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    placeholder="Search equipment by name, category, or description..."
                                    className="h-12 w-full rounded-full bg-[#eeedf3] pl-12 pr-4 text-[13px] text-[#1a1b1f] outline-none transition-all placeholder:text-[#4c4546] focus:bg-white focus:ring-2 focus:ring-black"
                                />
                            </div>

                            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
                                <button
                                    type="button"
                                    onClick={handleStockToggle}
                                    className={`flex h-10 items-center gap-2 rounded-full px-4 text-[12px] font-medium transition-all ${stockOnly
                                            ? "bg-black text-white"
                                            : "bg-[#f4f3f8] text-[#4c4546] hover:bg-[#eeedf3] hover:text-black"
                                        }`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${stockOnly
                                                ? "bg-white"
                                                : "bg-[#cfc4c5]"
                                            }`}
                                    />

                                    In Stock Only
                                </button>

                                <select
                                    value={sortBy}
                                    onChange={handleSortChange}
                                    className="h-10 cursor-pointer appearance-none rounded-full bg-[#f4f3f8] px-4 text-[12px] font-medium text-[#1a1b1f] outline-none hover:bg-[#eeedf3]"
                                >
                                    <option value="featured">
                                        Sort: Featured
                                    </option>

                                    <option value="price-low">
                                        Price: Low to High
                                    </option>

                                    <option value="price-high">
                                        Price: High to Low
                                    </option>

                                    <option value="name">
                                        Name: A-Z
                                    </option>
                                </select>
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="w-full overflow-x-auto py-1">
                            <div className="flex min-w-max items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() =>
                                        handleCategoryChange("all")
                                    }
                                    className={`h-9 rounded-full px-4 text-[12px] font-medium transition-all ${selectedCategory === "all"
                                            ? "bg-black text-white shadow-sm"
                                            : "bg-[#f4f3f8] text-[#4c4546] hover:bg-[#eeedf3] hover:text-black"
                                        }`}
                                >
                                    All Equipment ({products.length})
                                </button>

                                {categoryNames.map(
                                    (category) => (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() =>
                                                handleCategoryChange(
                                                    category
                                                )
                                            }
                                            className={`h-9 rounded-full px-4 text-[12px] font-medium transition-all ${selectedCategory ===
                                                    category
                                                    ? "bg-black text-white shadow-sm"
                                                    : "bg-[#f4f3f8] text-[#4c4546] hover:bg-[#eeedf3] hover:text-black"
                                                }`}
                                        >
                                            {category}
                                        </button>
                                    )
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Error */}
                {error && (
                    <section className="mx-auto w-full max-w-7xl px-6 pb-8 lg:px-12">
                        <div className="rounded-2xl bg-[#ffdad6] px-5 py-4 text-sm text-[#93000a]">
                            {error}
                        </div>
                    </section>
                )}

                {/* Cart Message */}
                {cartMessage && (
                    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-black px-5 py-3 text-[12px] font-medium text-white shadow-xl">
                        {cartMessage}
                    </div>
                )}

                {/* Products */}
                <section className="mx-auto w-full max-w-7xl px-6 pb-20 lg:px-12">
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {Array.from({
                                length: 8,
                            }).map((_, index) => (
                                <div
                                    key={index}
                                    className="animate-pulse rounded-2xl bg-white p-4"
                                >
                                    <div className="aspect-square rounded-xl bg-[#eeedf3]" />

                                    <div className="mt-5 h-3 w-24 rounded bg-[#eeedf3]" />

                                    <div className="mt-3 h-5 w-4/5 rounded bg-[#eeedf3]" />

                                    <div className="mt-3 h-4 w-3/5 rounded bg-[#eeedf3]" />

                                    <div className="mt-7 h-10 rounded-full bg-[#eeedf3]" />
                                </div>
                            ))}
                        </div>
                    ) : visibleProducts.length === 0 ? (
                            <div className="flex min-h-75 flex-col items-center justify-center rounded-3xl bg-white px-6 text-center">
                            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eeedf3] text-2xl">
                                ⌕
                            </div>

                            <h2 className="text-xl font-semibold">
                                No equipment found
                            </h2>

                            <p className="mt-2 max-w-md text-sm text-[#4c4546]">
                                Try changing your search or
                                selecting a different category.
                            </p>

                            <button
                                type="button"
                                onClick={handleClearFilters}
                                className="mt-5 rounded-full bg-black px-5 py-2.5 text-xs font-medium text-white"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                                {visibleProducts.map(
                                    (product, index) => {
                                        const stock =
                                            Number(
                                                product.stockQuantity
                                            ) || 0;

                                        const inStock = stock > 0;

                                        return (
                                            <article
                                                key={product.id}
                                                className="group relative flex flex-col justify-between rounded-2xl bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
                                            >
                                                <div>
                                                    <Link
                                                        to={`/products/${product.id}`}
                                                        className="block"
                                                    >
                                                        <div className="relative flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-[#f4f3f8] p-6">
                                                            <img
                                                                src={getProductImage(
                                                                    product,
                                                                    index
                                                                )}
                                                                alt={
                                                                    product.name
                                                                }
                                                                className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
                                                                onError={(
                                                                    event
                                                                ) => {
                                                                    event.currentTarget.src =
                                                                        fallbackImages[
                                                                        index %
                                                                        fallbackImages.length
                                                                        ];
                                                                }}
                                                            />

                                                            <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium text-black backdrop-blur-md">
                                                                {getCategoryName(
                                                                    product
                                                                )}
                                                            </span>
                                                        </div>

                                                        <div className="flex flex-col gap-1.5 pt-4">
                                                            <span className="text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                                                                {getCategoryName(
                                                                    product
                                                                )}
                                                            </span>

                                                            <h3 className="line-clamp-2 text-[17px] font-semibold leading-5.5 tracking-tight text-black">
                                                                {product.name}
                                                            </h3>

                                                            <p className="line-clamp-2 text-[13px] leading-4.5 text-[#4c4546]">
                                                                {product.description ||
                                                                    "Professional commercial equipment for your business."}
                                                            </p>
                                                        </div>
                                                    </Link>
                                                </div>

                                                <div className="flex flex-col gap-3 pt-6">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex flex-col">
                                                            <span className="text-[17px] font-semibold text-black">
                                                                $
                                                                {Number(
                                                                    product.price ||
                                                                    0
                                                                ).toLocaleString()}
                                                            </span>

                                                            <span className="text-[10px] text-[#4c4546]">
                                                                Available for
                                                                purchase
                                                            </span>
                                                        </div>

                                                        <div className="flex items-center gap-1.5">
                                                            <span
                                                                className={`h-2 w-2 rounded-full ${inStock
                                                                        ? "bg-[#1b873f]"
                                                                        : "bg-[#ba1a1a]"
                                                                    }`}
                                                            />

                                                            <span className="text-[10px] font-medium text-[#4c4546]">
                                                                {inStock
                                                                    ? `${stock} in stock`
                                                                    : "Out of stock"}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <Link
                                                            to={`/products/${product.id}`}
                                                            className="flex h-10 flex-1 items-center justify-center gap-1 rounded-full bg-[#f4f3f8] text-[12px] font-medium text-black transition-all hover:bg-black hover:text-white"
                                                        >
                                                            View Product

                                                            <span className="text-sm transition-transform group-hover:translate-x-0.5">
                                                                →
                                                            </span>
                                                        </Link>

                                                        <button
                                                            type="button"
                                                            disabled={
                                                                !inStock ||
                                                                addingProductId ===
                                                                product.id
                                                            }
                                                            onClick={() =>
                                                                handleAddToCart(
                                                                    product.id
                                                                )
                                                            }
                                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all ${!inStock
                                                                    ? "cursor-not-allowed bg-[#eeedf3] text-[#aaa]"
                                                                    : "bg-black text-white hover:bg-[#333]"
                                                                }`}
                                                            title={
                                                                inStock
                                                                    ? "Add to cart"
                                                                    : "Out of stock"
                                                            }
                                                        >
                                                            {addingProductId ===
                                                                product.id
                                                                ? "..."
                                                                : "+"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </article>
                                        );
                                    }
                                )}
                            </div>

                            {/* Load More */}
                            <div className="mt-14 flex flex-col items-center gap-4">
                                <div className="flex items-center gap-1.5 text-[13px] text-[#4c4546]">
                                    <span>Showing</span>

                                    <span className="font-semibold text-black">
                                        {visibleProducts.length}
                                    </span>

                                    <span>
                                        of {filteredProducts.length}{" "}
                                        equipment
                                    </span>
                                </div>

                                <div className="h-1 w-48 overflow-hidden rounded-full bg-[#e3e2e7]">
                                    <div
                                        className="h-full rounded-full bg-black transition-all duration-300"
                                        style={{
                                            width: `${filteredProducts.length
                                                    ? Math.min(
                                                        (visibleProducts.length /
                                                            filteredProducts.length) *
                                                        100,
                                                        100
                                                    )
                                                    : 0
                                                }%`,
                                        }}
                                    />
                                </div>

                                {hasMoreProducts && (
                                    <button
                                        type="button"
                                        onClick={handleLoadMore}
                                        className="flex h-11 items-center gap-2 rounded-full bg-[#f4f3f8] px-8 text-[12px] font-medium text-black transition-all hover:bg-[#eeedf3]"
                                    >
                                        Load More Products

                                        <span className="text-base">
                                            ↓
                                        </span>
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </section>

                {/* Procurement Banner */}
                <section className="mx-auto w-full max-w-7xl px-6 pb-16 lg:px-12">
                    <div className="relative overflow-hidden rounded-3xl bg-black p-8 text-white md:p-12 lg:p-16">
                        <div className="pointer-events-none absolute inset-0 opacity-[0.06]">
                            <div
                                className="h-full w-full"
                                style={{
                                    backgroundImage:
                                        "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
                                    backgroundSize: "40px 40px",
                                }}
                            />
                        </div>

                        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex max-w-2xl flex-col gap-3">
                                <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-wider text-white">
                                    Business Equipment Planning
                                </div>

                                <h2 className="text-[28px] font-semibold leading-tight tracking-tight md:text-[36px]">
                                    Building a complete business
                                    setup?
                                </h2>

                                <p className="max-w-xl text-[15px] leading-7 text-white/70">
                                    Start with a business type and
                                    explore equipment selected for
                                    coffee shops, bakeries,
                                    restaurants, and salons.
                                </p>
                            </div>

                            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                                <Link
                                    to="/"
                                    className="flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[12px] font-semibold text-black transition-all hover:bg-[#f4f3f8]"
                                >
                                    Explore Business Types

                                    <span>→</span>
                                </Link>

                                <Link
                                    to="/"
                                    className="flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-[12px] font-medium text-white transition-all hover:bg-white/10"
                                >
                                    How BizKit Works
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="mt-10 w-full bg-[#f4f3f8]">
                <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-12">
                    <div className="grid grid-cols-2 gap-8 pb-14 md:grid-cols-4 lg:gap-12">
                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                Shop by Business
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Coffee Shop
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Bakery
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Restaurant
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Salon
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    All Equipment
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                Services
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Business Kits
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Equipment Purchase
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="hover:text-black"
                                >
                                    Equipment Catalog
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Resale & Trade-in
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Support
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                Account
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/login"
                                    className="hover:text-black"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="hover:text-black"
                                >
                                    Register
                                </Link>

                                <Link
                                    to="/cart"
                                    className="hover:text-black"
                                >
                                    Cart
                                </Link>

                                <Link
                                    to="/orders"
                                    className="hover:text-black"
                                >
                                    Orders
                                </Link>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3.5">
                            <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                                BizKit
                            </h4>

                            <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    About BizKit
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    How It Works
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Privacy
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Terms
                                </Link>

                                <Link
                                    to="/"
                                    className="hover:text-black"
                                >
                                    Support
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-black/6 pt-8 md:flex-row">
                        <p className="text-center text-[11px] text-[#4c4546] md:text-left">
                            © 2026 BizKit. Commercial equipment
                            for growing businesses.
                        </p>

                        <div className="flex items-center gap-6 text-[11px] text-[#4c4546]">
                            <span>Nepal</span>

                            <Link
                                to="/"
                                className="hover:text-black"
                            >
                                Legal
                            </Link>

                            <Link
                                to="/"
                                className="hover:text-black"
                            >
                                Site Map
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Equipment;