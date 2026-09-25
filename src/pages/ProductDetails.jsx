import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import productService from "../services/productService";
import cartService from "../services/cartService";
import { useAuth } from "../context/AuthContext";

const fallbackImage =
    "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80";

const ProductDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const { isAuthenticated } = useAuth();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [addingToCart, setAddingToCart] = useState(false);
    const [cartMessage, setCartMessage] = useState("");

    useEffect(() => {
        loadProduct();
    }, [id]);

    const loadProduct = async () => {
        try {
            setLoading(true);
            setError("");
            setProduct(null);
            setShowFullDescription(false);

            const data = await productService.getById(id);

            setProduct(data);

            const stock = Number(data?.stockQuantity) || 0;

            if (stock > 0) {
                setQuantity(1);
            }
        } catch (err) {
            setError(
                err.userMessage ||
                "Unable to load this product. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const stock = Number(product?.stockQuantity) || 0;
    const inStock = stock > 0;

    const categoryName =
        product?.category?.name ||
        product?.categoryName ||
        "Equipment";

    const productImage =
        product?.imageUrl ||
        product?.image ||
        fallbackImage;

    const descriptionText =
        product?.description ||
        "Professional commercial equipment designed for growing businesses.";
    const canExpandDescription = descriptionText.length > 180;

    const handleQuantityDecrease = () => {
        setQuantity((current) => Math.max(1, current - 1));
    };

    const handleQuantityIncrease = () => {
        setQuantity((current) =>
            Math.min(stock, current + 1)
        );
    };

    const handleQuantityChange = (event) => {
        const value = Number(event.target.value);

        if (!Number.isFinite(value)) {
            return;
        }

        if (value < 1) {
            setQuantity(1);
            return;
        }

        if (value > stock) {
            setQuantity(stock);
            return;
        }

        setQuantity(value);
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `/products/${id}`,
                },
            });

            return;
        }

        if (!inStock) {
            return;
        }

        try {
            setAddingToCart(true);
            setCartMessage("");

            await cartService.addItem(
                product.id,
                quantity
            );

            setCartMessage(
                `${quantity} ${quantity === 1 ? "item" : "items"
                } added to cart.`
            );

            setTimeout(() => {
                setCartMessage("");
            }, 3000);
        } catch (err) {
            setCartMessage(
                err.userMessage ||
                "Unable to add this product to your cart."
            );
        } finally {
            setAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            navigate("/login", {
                state: {
                    from: `/products/${id}`,
                },
            });

            return;
        }

        if (!inStock) {
            return;
        }

        try {
            setAddingToCart(true);
            setCartMessage("");

            await cartService.addItem(
                product.id,
                quantity
            );

            navigate("/cart");
        } catch (err) {
            setCartMessage(
                err.userMessage ||
                "Unable to add this product to your cart."
            );

            setAddingToCart(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#faf8fe] text-[#1a1b1f]">
                <header className="hidden fixed left-0 right-0 top-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
                        <Link
                            to="/"
                            className="flex items-center gap-2.5"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                                B
                            </div>

                            <span className="text-[17px] font-semibold tracking-tight">
                                BizKit
                            </span>
                        </Link>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-6 pb-20 lg:px-12">
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                        <div className="aspect-square rounded-3xl bg-[#eeedf3]" />

                        <div className="flex flex-col justify-center">
                            <div className="h-5 w-24 rounded-full bg-[#eeedf3]" />

                            <div className="mt-5 h-12 w-4/5 rounded-xl bg-[#eeedf3]" />

                            <div className="mt-4 h-5 w-full rounded bg-[#eeedf3]" />

                            <div className="mt-2 h-5 w-3/4 rounded bg-[#eeedf3]" />

                            <div className="mt-10 h-8 w-32 rounded bg-[#eeedf3]" />

                            <div className="mt-8 h-14 w-full rounded-full bg-[#eeedf3]" />

                            <div className="mt-3 h-14 w-full rounded-full bg-[#eeedf3]" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-[#faf8fe] text-[#1a1b1f]">
                <header className="hidden fixed left-0 right-0 top-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
                    <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-12">
                        <Link
                            to="/"
                            className="flex items-center gap-2.5"
                        >
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-sm font-semibold text-white">
                                B
                            </div>

                            <span className="text-[17px] font-semibold tracking-tight">
                                BizKit
                            </span>
                        </Link>

                        <Link
                            to="/equipment"
                            className="rounded-full bg-[#f4f3f8] px-5 py-2.5 text-[12px] font-medium hover:bg-[#eeedf3]"
                        >
                            Back to Equipment
                        </Link>
                    </div>
                </header>

                <main className="flex min-h-screen items-center justify-center px-6">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eeedf3] text-2xl">
                            !
                        </div>

                        <h1 className="mt-6 text-2xl font-semibold">
                            Product unavailable
                        </h1>

                        <p className="mt-3 text-sm leading-6 text-[#4c4546]">
                            {error ||
                                "The product you are looking for could not be found."}
                        </p>

                        <Link
                            to="/equipment"
                            className="mt-7 inline-flex h-11 items-center justify-center rounded-full bg-black px-6 text-[12px] font-medium text-white transition hover:bg-[#333]"
                        >
                            Back to Equipment
                        </Link>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-[#1a1b1f]">
            {/* Header */}
            <header className="hidden fixed left-0 right-0 top-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
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
            <main className="mx-auto max-w-5xl px-5 py-6 sm:px-6 lg:px-8">
                {/* Breadcrumb */}
                <div className="mb-4 flex items-center gap-2 text-xs text-gray-500">
                    <Link
                        to="/"
                        className="transition-colors hover:text-black"
                    >
                        Home
                    </Link>

                    <span className="text-[#cfc4c5]">
                        /
                    </span>

                    <Link
                        to="/equipment"
                        className="transition-colors hover:text-black"
                    >
                        Equipment
                    </Link>

                    <span className="text-[#cfc4c5]">
                        /
                    </span>

                    <span className="font-medium text-black">
                        {product.name}
                    </span>
                </div>

                {/* Product */}
                <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2 lg:gap-8">
                    {/* Image */}
                    <div className="lg:max-w-md">
                        <div className="relative aspect-square overflow-hidden rounded-lg border border-gray-200 bg-white">
                            <img
                                src={productImage}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                onError={(event) => {
                                    event.currentTarget.src =
                                        fallbackImage;
                                }}
                            />

                            <div
                                className={`absolute right-4 top-4 rounded-md bg-white px-3 py-1.5 text-xs font-medium shadow-sm ${inStock
                                        ? "text-[#1b873f]"
                                        : "text-[#ba1a1a]"
                                    }`}
                            >
                                {inStock
                                    ? `${stock} in stock`
                                    : "Out of stock"}
                            </div>

                        </div>

                        <div className="mt-3 flex items-center justify-between px-1">
                            <Link
                                to="/equipment"
                                className="text-[12px] font-medium text-black transition-colors  underline hover:text-gray-800"
                            >
                                Back to Equipment
                            </Link>

                        </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-col justify-center">
                        <div>
                            <span className="inline-flex rounded-md bg-gray-200 px-3 py-1 text-xs font-medium text-black">
                                {categoryName}
                            </span>
                        </div>

                        <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                            {product.name}
                        </h1>

                        <div className="mt-6">
                            <span className="text-2xl font-semibold tracking-tight">
                                $
                                {Number(
                                    product.price || 0
                                ).toLocaleString()}
                            </span>
                        </div>

                        <div className="my-6 h-px w-full bg-gray-200" />

                        <div>
                            <h2 className="text-sm font-semibold text-black">
                                Description
                            </h2>

                            <p
                                className={`mt-2 max-w-xl text-sm leading-6 text-gray-600 ${!showFullDescription && canExpandDescription
                                        ? "line-clamp-3"
                                        : ""
                                    }`}
                            >
                                {descriptionText}
                            </p>

                            {canExpandDescription && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowFullDescription(
                                            (current) => !current
                                        )
                                    }
                                    className="mt-2 text-sm font-medium text-black underline underline-offset-2"
                                >
                                    {showFullDescription
                                        ? "See less"
                                        : "See more"}
                                </button>
                            )}
                        </div>

                        {/* Quantity */}
                        {inStock && (
                            <div className="mt-5">
                                <div className="mb-2 text-sm font-medium text-black">
                                    Quantity
                                </div>

                                <div className="flex h-11 w-fit items-center overflow-hidden rounded-lg border border-gray-300 bg-white">
                                    <button
                                        type="button"
                                        onClick={
                                            handleQuantityDecrease
                                        }
                                        disabled={quantity <= 1}
                                        className="flex h-12 w-12 items-center justify-center text-lg transition-colors hover:bg-[#eeedf3] disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        −
                                    </button>

                                    <input
                                        type="number"
                                        min="1"
                                        max={stock}
                                        value={quantity}
                                        onChange={
                                            handleQuantityChange
                                        }
                                        className="h-12 w-14 bg-transparent text-center text-[13px] font-semibold outline-none"
                                    />

                                    <button
                                        type="button"
                                        onClick={
                                            handleQuantityIncrease
                                        }
                                        disabled={
                                            quantity >= stock
                                        }
                                        className="flex h-12 w-12 items-center justify-center text-lg transition-colors hover:bg-[#eeedf3] disabled:cursor-not-allowed disabled:opacity-30"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                            <button
                                type="button"
                                onClick={handleAddToCart}
                                disabled={
                                    !inStock || addingToCart
                                }
                                className={`flex h-12 flex-1 items-center justify-center rounded-lg px-6 text-sm font-semibold ${!inStock
                                        ? "cursor-not-allowed bg-[#eeedf3] text-[#aaa]"
                                        : "bg-black text-white hover:bg-[#333]"
                                    }`}
                            >
                                {addingToCart
                                    ? "Adding..."
                                    : inStock
                                        ? "Add to Cart"
                                        : "Out of Stock"}
                            </button>

                            {inStock && (
                                <button
                                    type="button"
                                    onClick={handleBuyNow}
                                    disabled={addingToCart}
                                    className="flex h-12 flex-1 items-center justify-center rounded-lg bg-gray-200 px-6 text-sm font-semibold text-black hover:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Buy Now
                                </button>
                            )}
                        </div>

                        {!isAuthenticated && (
                            <div className="mt-4 rounded-2xl bg-[#f4f3f8] px-5 py-4">
                                <p className="text-[11px] leading-5 text-[#4c4546]">
                                    Sign in to add equipment to your
                                    cart and place an order.
                                </p>

                                <Link
                                    to="/login"
                                    state={{
                                        from: `/products/${id}`,
                                    }}
                                    className="mt-2 inline-block text-[11px] font-semibold text-black underline underline-offset-2"
                                >
                                    Sign in to continue →
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Product Information */}
                <section className="hidden mt-20 border-t border-black/6 pt-14">
                    <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4c4546]">
                                Category
                            </span>

                            <p className="mt-2 text-[15px] font-medium">
                                {categoryName}
                            </p>
                        </div>

                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4c4546]">
                                Availability
                            </span>

                            <p className="mt-2 text-[15px] font-medium">
                                {inStock
                                    ? `${stock} units available`
                                    : "Currently unavailable"}
                            </p>
                        </div>

                        <div>
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#4c4546]">
                                Purchase
                            </span>

                            <p className="mt-2 text-[15px] font-medium">
                                Available through BizKit
                            </p>
                        </div>
                    </div>
                </section>

                {/* Continue Shopping */}
                <section className="hidden mt-20">
                    <div className="relative overflow-hidden rounded-3xl bg-black p-8 text-white md:p-12">
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

                        <div className="relative z-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                            <div>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">
                                    BizKit Equipment
                                </span>

                                <h2 className="mt-2 text-[26px] font-semibold tracking-tight md:text-[32px]">
                                    Continue building your business.
                                </h2>

                                <p className="mt-2 max-w-xl text-[14px] leading-6 text-white/65">
                                    Explore more commercial equipment
                                    for your business setup.
                                </p>
                            </div>

                            <Link
                                to="/equipment"
                                className="flex h-11 shrink-0 items-center justify-center rounded-full bg-white px-6 text-[12px] font-semibold text-black transition hover:bg-[#f4f3f8]"
                            >
                                Browse Equipment →
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Cart Message */}
            {cartMessage && (
                <div className="fixed bottom-6 left-1/2 z-60 -translate-x-1/2 rounded-full bg-black px-5 py-3 text-[12px] font-medium text-white shadow-xl">
                    {cartMessage}
                </div>
            )}

            {/* Footer */}
            <footer className="hidden mt-10 w-full bg-[#f4f3f8]">
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

export default ProductDetails;