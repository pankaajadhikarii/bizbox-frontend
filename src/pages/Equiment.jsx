import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import businessTypeService from "../services/businessTypeService";
import categoryService from "../services/categoryService";
import productService from "../services/productService";
import cartService from "../services/cartService";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/imageUrl";
import { ShoppingCart, CheckCircle2, ArrowDown, ArrowRight } from "lucide-react";

const Equipment = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("search") || "",
  );
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [stockOnly, setStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const [visibleCount, setVisibleCount] = useState(8);

  const [addingProductId, setAddingProductId] = useState(null);
  const [cartMessage, setCartMessage] = useState("");

  const businessTypeId = searchParams.get("businessTypeId");

  useEffect(() => {
    loadData();
  }, [businessTypeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (businessTypeId) {
        const [
          btProductsData,
          allProductsData,
          categoriesData,
          businessTypesData,
        ] = await Promise.all([
          businessTypeService.getProducts(businessTypeId),
          productService.getAll(),
          categoryService.getAll(),
          businessTypeService.getAll(),
        ]);

        const allProductsList = Array.isArray(allProductsData)
          ? allProductsData
          : allProductsData?.products ||
            allProductsData?.items ||
            allProductsData?.data ||
            [];

        const productMap = {};

        allProductsList.forEach((p) => {
          if (p?.id) {
            productMap[p.id] = p;
          }
        });

        const btList = Array.isArray(btProductsData)
          ? btProductsData
          : btProductsData?.products ||
            btProductsData?.items ||
            btProductsData?.data ||
            [];

        const normalized = btList.map((item) => {
          const fullProduct = productMap[item.productId] || {};

          return {
            id: item.productId ?? item.id ?? fullProduct.id,
            name: item.productName ?? item.name ?? fullProduct.name,
            imageUrl:
              item.imageUrl || fullProduct.imageUrl || fullProduct.image,
            description: fullProduct.description || item.description,
            price: item.price ?? fullProduct.price,
            stockQuantity:
              fullProduct.stockQuantity ?? fullProduct.stock ?? null,
            categoryId: fullProduct.categoryId,
            category: fullProduct.category,
            categoryName: fullProduct.categoryName,
            isRequired: item.isRequired,
            recommendedQuantity: item.recommendedQuantity,
            displayOrder: item.displayOrder,
          };
        });

        normalized.sort(
          (a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999),
        );

        setProducts(normalized);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setBusinessTypes(
          Array.isArray(businessTypesData) ? businessTypesData : [],
        );
      } else {
        const [productsData, categoriesData, businessTypesData] =
          await Promise.all([
            productService.getAll(),
            categoryService.getAll(),
            businessTypeService.getAll(),
          ]);

        const productList = Array.isArray(productsData)
          ? productsData
          : productsData?.products ||
            productsData?.items ||
            productsData?.data ||
            [];

        setProducts(
          productList.map((item) => item.product || item).filter(Boolean),
        );

        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        setBusinessTypes(
          Array.isArray(businessTypesData) ? businessTypesData : [],
        );
      }
    } catch (err) {
      setError(
        err.userMessage || "Unable to load equipment. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (product) => {
    return (
      product.category?.name ||
      product.categoryName ||
      categories.find((category) => category.id === product.categoryId)?.name ||
      "Equipment"
    );
  };

  const getProductImage = (product) => {
    const raw = product.imageUrl || product.image;
    return resolveImageUrl(raw);
  };

  const filteredProducts = useMemo(() => {
    let result = [...products];

    const query = searchQuery.trim().toLowerCase();

    if (query) {
      result = result.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const category = getCategoryName(product).toLowerCase();

        return (
          name.includes(query) ||
          description.includes(query) ||
          category.includes(query)
        );
      });
    }

    if (selectedCategory !== "all") {
      result = result.filter((product) => {
        const categoryName = getCategoryName(product).toLowerCase().trim();

        return categoryName === selectedCategory.toLowerCase();
      });
    }

    if (stockOnly) {
      result = result.filter(
        (product) =>
          product.stockQuantity === null ||
          product.stockQuantity === undefined ||
          Number(product.stockQuantity) > 0,
      );
    }

    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    }

    if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    }

    if (sortBy === "name") {
      result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    }

    return result;
  }, [products, searchQuery, selectedCategory, stockOnly, sortBy, categories]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const hasMoreProducts = visibleCount < filteredProducts.length;

  const categoryNames = useMemo(() => {
    return categories.map((category) => category.name).filter(Boolean);
  }, [categories]);

  const handleLoadMore = () => {
    setVisibleCount((current) => current + 8);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
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
        err.userMessage || "Unable to add this product to your cart.",
      );
    } finally {
      setAddingProductId(null);
    }
  };

  const selectedBusinessType = businessTypes.find(
    (businessType) => String(businessType.id) === String(businessTypeId),
  );

  return (
    <div className="min-h-screen bg-gray-50 text-[#1a1b1f]">
      {/* Header */}
      <header className="hidden fixed left-0 right-0 top-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex shrink-0 items-center gap-2.5 transition-opacity hover:opacity-75"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
              B
            </div>

            <span className="text-[17px] font-semibold tracking-tight">
              BizBox
            </span>
          </Link>

          <nav className="hidden items-center gap-5 xl:flex">
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

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            <Link
              to="/cart"
              className="flex h-9 items-center gap-2 rounded-full px-2 text-[#4c4546] transition-all hover:bg-[#eeedf3] hover:text-black sm:px-3"
            >
              <span className="text-[18px]">🛍</span>

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
      <main className="flex min-h-screen flex-1 flex-col">
        {/* Page Heading */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-5 pt-7 sm:px-6 sm:pb-6 sm:pt-8 lg:px-8">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                  Shop equipment
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600">
                  Find the right products for your business.
                </p>

                {businessTypeId && (
                  <div className="mt-4 inline-flex max-w-full items-center gap-2 rounded-full bg-white px-4 py-2 text-[12px] font-medium shadow-sm ring-1 ring-black/4">
                    <span className="truncate">
                      {selectedBusinessType?.name || "Selected Business"}
                    </span>
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className="mb-0 flex w-full flex-col gap-2.5 sm:flex-row sm:flex-wrap lg:w-auto lg:items-center">
                <button
                  type="button"
                  onClick={handleStockToggle}
                  className={`flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-[12px] font-medium sm:w-auto ${
                    stockOnly
                      ? "bg-black text-white"
                      : "bg-[#f4f3f8] text-[#4c4546] hover:bg-[#eeedf3] hover:text-black"
                  }`}
                >
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${
                      stockOnly ? "bg-white" : "bg-[#cfc4c5]"
                    }`}
                  />

                  In Stock Only
                </button>

                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="h-10 w-full cursor-pointer appearance-none rounded-lg border border-gray-300 bg-white px-4 text-[12px] font-medium text-[#1a1b1f] outline-none hover:bg-gray-50 sm:w-auto"
                >
                  <option value="featured">Sort: Featured</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="name">Name: A-Z</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto w-full max-w-7xl px-5 pb-8 sm:px-6 lg:px-12">
  <div className="flex items-center gap-3">
    <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto pb-1 scrollbar-hide lg:flex-wrap lg:overflow-visible">
      <button
        type="button"
        onClick={() => handleCategoryChange("all")}
        className={`h-9 shrink-0 rounded-lg px-4 text-[12px] font-medium ${
          selectedCategory === "all"
            ? "bg-black text-white shadow-sm"
            : "bg-[#f4f3f8] text-[#4c4546] hover:bg-[#eeedf3] hover:text-black"
        }`}
      >
        All Equipment ({products.length})
      </button>

      {categoryNames.map((category) => (
        <button
          key={category}
          type="button"
          onClick={() => handleCategoryChange(category)}
          className={`h-9 shrink-0 rounded-lg px-4 text-[12px] font-medium ${
            selectedCategory === category
              ? "bg-black text-white shadow-sm"
              : "bg-[#f4f3f8] text-[#4c4546] hover:bg-[#eeedf3] hover:text-black"
          }`}
        >
          {category}
        </button>
      ))}
    </div>
  </div>
</section>

        {/* Error */}
        {error && (
          <section className="mx-auto w-full max-w-7xl px-4 pb-7 sm:px-6 lg:px-8">
            <div className="rounded-2xl bg-[#ffdad6] px-4 py-4 text-sm text-[#93000a] sm:px-5">
              {error}
            </div>
          </section>
        )}

        {/* Cart Message Toast */}
        {cartMessage && (
          <div className="fixed bottom-4 left-4 right-4 z-50 flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-xs font-medium text-white shadow-xl animate-fade-in sm:bottom-6 sm:left-auto sm:right-6">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />

            <span className="text-center">{cartMessage}</span>
          </div>
        )}

        {/* Products */}
        <section className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 sm:pb-20 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
              {Array.from({
                length: 8,
              }).map((_, index) => (
                <div key={index} className="rounded-2xl bg-white p-3 sm:p-4">
                  <div className="aspect-square rounded-xl bg-[#eeedf3]" />

                  <div className="mt-5 h-3 w-24 rounded bg-[#eeedf3]" />

                  <div className="mt-3 h-5 w-4/5 rounded bg-[#eeedf3]" />

                  <div className="mt-3 h-4 w-3/5 rounded bg-[#eeedf3]" />

                  <div className="mt-7 h-10 rounded-full bg-[#eeedf3]" />
                </div>
              ))}
            </div>
          ) : visibleProducts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl bg-white px-5 py-12 text-center sm:min-h-75 sm:px-6">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#eeedf3] text-2xl">
                ⌕
              </div>

              <h2 className="text-xl font-semibold">No equipment found</h2>

              <p className="mt-2 max-w-md text-sm text-[#4c4546]">
                Try changing your search or selecting a different category.
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
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
                {visibleProducts.map((product) => {
                  const stockQuantityKnown =
                    product.stockQuantity !== null &&
                    product.stockQuantity !== undefined;

                  const stock = stockQuantityKnown
                    ? Number(product.stockQuantity)
                    : null;

                  const inStock = stock === null || stock > 0;

                  return (
                    <article
                      key={product.id}
                      className="relative flex min-w-0 flex-col justify-between rounded-lg border border-gray-200 bg-gray-50 p-2 hover:border-gray-300 hover:bg-gray-100"
                    >
                      <div className="min-w-0">
                        <Link to={`/products/${product.id}`} className="block">
                          <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-[#f4f3f8]">
                            {getProductImage(product) && (
                              <img
                                src={getProductImage(product)}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                  event.currentTarget.style.display = "none";
                                }}
                              />
                            )}
                          </div>

                          <div className="flex min-w-0 flex-col gap-1.5 pt-4">
                            <span className="truncate text-[10px] font-medium uppercase tracking-wider text-[#4c4546]">
                              {getCategoryName(product)}
                            </span>

                            <h3 className="line-clamp-2 break-words text-[17px] font-semibold leading-5.5 tracking-tight text-black">
                              {product.name}
                            </h3>

                            <p className="line-clamp-2 break-words text-[13px] leading-4.5 text-[#4c4546]">
                              {product.description ||
                                "Professional commercial equipment for your business."}
                            </p>
                          </div>
                        </Link>
                      </div>

                      <div className="flex flex-col gap-3 pt-6">
                        <div className="flex min-w-0 items-center justify-between gap-2">
                          <div className="flex min-w-0 flex-col">
                            <span className="truncate text-[16px] font-semibold text-black sm:text-[17px]">
                              Rs.
                              {Number(product.price || 0).toLocaleString()}
                            </span>
                          </div>

                          <div className="min-w-0 text-right">
                            <span className="text-[10px] font-medium text-[#4c4546]">
                              {!inStock
                                ? "Out of stock"
                                : stock === null
                                  ? "Available"
                                  : `${stock} in stock`}
                            </span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Link
                            to={`/products/${product.id}`}
                            className="flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-lg bg-black px-2 text-center text-[11px] font-medium text-white hover:bg-gray-800 sm:text-[12px]"
                          >
                            View Product
                          </Link>

                          {!isAdmin && (
                            <button
                              type="button"
                              disabled={
                                !inStock || addingProductId === product.id
                              }
                              onClick={() => handleAddToCart(product.id)}
                              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-base ${
                                !inStock
                                  ? "cursor-not-allowed bg-[#eeedf3] text-[#aaa]"
                                  : "bg-black text-white hover:bg-[#333]"
                              }`}
                              title={inStock ? "Add to cart" : "Out of stock"}
                              aria-label={
                                inStock ? "Add to cart" : "Out of stock"
                              }
                            >
                              {addingProductId === product.id ? (
                                "..."
                              ) : (
                                <ShoppingCart className="h-5 w-5" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>

              {/* Load More */}
              <div className="mt-12 flex flex-col items-center gap-4 sm:mt-14">
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-center text-[13px] text-[#4c4546]">
                  <span>Showing</span>

                  <span className="font-semibold text-black">
                    {visibleProducts.length}
                  </span>

                  <span>of {filteredProducts.length} equipment</span>
                </div>

                <div className="h-1 w-48 max-w-full overflow-hidden rounded-full bg-[#e3e2e7]">
                  <div
                    className="h-full rounded-full bg-black transition-all duration-300"
                    style={{
                      width: `${
                        filteredProducts.length
                          ? Math.min(
                              (visibleProducts.length /
                                filteredProducts.length) *
                                100,
                              100,
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
                    className="flex h-11 w-full max-w-xs items-center justify-center gap-2 rounded-full bg-[#f4f3f8] px-6 text-[12px] font-medium text-black transition-all hover:bg-[#eeedf3] sm:w-auto sm:max-w-none sm:px-8"
                  >
                    Load More Products

                    <ArrowDown className="h-4 w-4" />
                  </button>
                )}
              </div>
            </>
          )}
        </section>

        {/* Procurement Banner */}
        <section className="hidden mx-auto w-full max-w-7xl px-4 pb-12 sm:px-6 sm:pb-16 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-black p-6 text-white sm:p-8 md:p-12 lg:p-16">
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

                <h2 className="text-[28px] font-semibold leading-tight tracking-tight sm:text-[32px] md:text-[36px]">
                  Building a complete business setup?
                </h2>

                <p className="max-w-xl text-[15px] leading-7 text-white/70">
                  Start with a business type and explore equipment selected for
                  coffee shops, bakeries, restaurants, and salons.
                </p>
              </div>

              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Link
                  to="/"
                  className="flex h-12 items-center justify-center gap-2 rounded-full bg-white px-6 text-[12px] font-semibold text-black transition-all hover:bg-[#f4f3f8]"
                >
                  Explore Business Types

                  <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  to="/"
                  className="flex h-12 items-center justify-center rounded-full border border-white/20 px-6 text-[12px] font-medium text-white transition-all hover:bg-white/10"
                >
                  How BizBox Works
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="hidden mt-10 w-full bg-[#f4f3f8]">
        <div className="mx-auto max-w-7xl px-4 pb-12 pt-12 sm:px-6 sm:pt-16 lg:px-8">
          <div className="grid grid-cols-2 gap-8 pb-12 sm:gap-10 md:grid-cols-4 lg:gap-12 lg:pb-14">
            <div className="flex flex-col gap-3.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                Shop by Business
              </h4>

              <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                <Link to="/equipment" className="hover:text-black">
                  Coffee Shop
                </Link>

                <Link to="/equipment" className="hover:text-black">
                  Bakery
                </Link>

                <Link to="/equipment" className="hover:text-black">
                  Restaurant
                </Link>

                <Link to="/equipment" className="hover:text-black">
                  Salon
                </Link>

                <Link to="/equipment" className="hover:text-black">
                  All Equipment
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                Services
              </h4>

              <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                <Link to="/" className="hover:text-black">
                  Business Kits
                </Link>

                <Link to="/equipment" className="hover:text-black">
                  Equipment Purchase
                </Link>

                <Link to="/equipment" className="hover:text-black">
                  Equipment Catalog
                </Link>

                <Link to="/" className="hover:text-black">
                  Resale & Trade-in
                </Link>

                <Link to="/" className="hover:text-black">
                  Support
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                Account
              </h4>

              <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                <Link to="/login" className="hover:text-black">
                  Sign In
                </Link>

                <Link to="/register" className="hover:text-black">
                  Register
                </Link>

                <Link to="/cart" className="hover:text-black">
                  Cart
                </Link>

                <Link to="/orders" className="hover:text-black">
                  Orders
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3.5">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider">
                BizBox
              </h4>

              <div className="flex flex-col gap-2.5 text-[13px] text-[#4c4546]">
                <Link to="/" className="hover:text-black">
                  About BizBox
                </Link>

                <Link to="/" className="hover:text-black">
                  How It Works
                </Link>

                <Link to="/" className="hover:text-black">
                  Privacy
                </Link>

                <Link to="/" className="hover:text-black">
                  Terms
                </Link>

                <Link to="/" className="hover:text-black">
                  Support
                </Link>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-black/6 pt-8 md:flex-row">
            <p className="text-center text-[11px] text-[#4c4546] md:text-left">
              © 2026 BizBox. Commercial equipment for growing businesses.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#4c4546] sm:gap-6">
              <span>Nepal</span>

              <Link to="/" className="hover:text-black">
                Legal
              </Link>

              <Link to="/" className="hover:text-black">
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