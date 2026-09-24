import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import businessTypeService from "../services/businessTypeService";
import productService from "../services/productService";
import { useAuth } from "../context/AuthContext";
import bizkitLogo from "../assets/screen.png";

const fallbackBusinessImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDIaOBOZ6WvxPs3fRgYuk_rEYxP_4yCXlYzLebC9P7RVlTM3j3O8OtmVoIW0W_0qqX6lswChJ23cUrvJcfoO75eU8uXABNUsgQeOCEpX4D6nikiAeVeHxk0_9A9vsUDjCI81F4QLvV7ZBhNO7W4D9TpeiqU60CVyJTJ6eBMC5LVjUs3cwvg76UnWar6Snu7I7wOItbFfm04oKahgcm4zeG5b-15Yl7Z5AQNsN7u7rg4Ms2PKLQ_SjaW",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRL4iV4u79GPsQ0eR_Q_POMIKfNcgNsp83QaD8NQfl8-DjN5vWJJuH3eJGnvm3CI3lo0l-K0u4sK3uMSKc-y9PsuVelxE-fJAUZZ4CWVXjGg67m8o_8WVIbNHYqwpyjxiW9lYuS_RGCx_dLWne9k3Wh3mjISma2861yVqc-IQbQnC5PJk-0sg2jkUJqw4wf99K5fllBa1rwRHDcGs1Syuf1VhgvfvgA18Ew279RKi3jeJPioVAdan9",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAn2GA3gd5bbDqoHd-MRfUaarHewYBcnVKs6FZZcKgCLBJDlkPZFli4dsauWukHM7q3SVLNpbm2i5TzOWbWkUogqvUQCv1WKObkJBO81p57IO1b7IQPeSco-pZnJBM729Otf6uGUAXz1IrUnPtRIZpq6FfDm9jm3pyg2lNzVxiF13aKw0FprENVQFtqpS-P-ufo6hQsN06TMdFMPDH7dUaVfzKg2oN-H-B1ZSu8fQVHzqVFqH3U2aL8",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwrYByz939s2GOUVtRvUbGLDl-NBZtxvpWvwF9Bb8-lXCYdBfRbDu92c9jYakgmK2Klp5--mLX5VxRJxEVKRUu_vH8I7d-mv2hAdbu3Gty5uyD9gcUOM0L8_od_MTNnIkzPmUUW5qqlw9QD_ESNSnVVyTIcEX_3RdOKFL5NUF9Ca7kY74O-7nLxmwrey68AWYDWCPQO1Qz8JlFNIuZbJRJwFh9VrYJrIxJnrZW_fVv0JrkzCJFaHqh",
];

const fallbackProductImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuC0m-WGMQaV3o3UTn3AyPHD2yax7QAakVRh_oeR9dTe9rBmWJkJhQRKJlkU99zjiJB3fASF6a4Vp64t_UtqlaUng0mQWc8gOEGmNyrWQWIulf99nWdo2IFK1rcxx_6L3wxTuJpV8iQL-EL24vZQxV5LFK_2uAt4iF7j5j7phjvMmicGr490OLP7nyT1zzwscO89z6XAfJggV_Wo8TLWf7XtvpS_vfQhh3wxjZp48X6toY4-GTZpa4gA",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAlm9dkjwML7-PavflqHa85zBllS6EDYy8EyFx2Iqhh7zbyhofBJ3RzGzIAv10mbhkyZhixtSdHln4ouqbGOwvL-9aoXYmzFZnoxFphafIzRT3CDLVaJfAPxd12gTLRJ0vkt5KsT8XKVKILhCtKrxGyD4MxfHoVkJE26zvx1snKzF1I62lA4qaP0l0D4iFn0KvnatPUMdSr4_DBim1g0Jtym_JCmUuy6nhdjlvLUGtK2s0do09omLx0",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuCBUl9M-TYe0qJwxKA1Qfug86foZ2oyKlj3Y84v0jediz0ir_wXAGJ0WPSEdUiAT31KyUALX8l-FihjuNfxkguLgZGDxZXDXNnEZ7NsMyeNCiWfOUvYcsIeJDn81vF128iJdnul75ZNVRfNpLpAMsrOld37X8OGC-YzIaopcTfXvqC0J-dNHb2-vnqGERBqeQg7nXoa-KDvdoUmNlBSFJ2jrGghsYLLX-r7xLwulVafAG2scYGYQs5Y",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAv5S-HA2NKZxd8GW59P8BjYgnLYLzxTIK1kFNbuP_KH44Ayreh2Y9_OrF4I_hgNCN2_BEdYQ6yy1bS5XyTp08KbKOu7yRz5idgJh9ktXhYvkASkhPJiJX1lKUoGfrSO46o-t3j0_A9w2ESZ4MsD9MzskpphI3XBxdSSCQCj_A5sAWqhAcy4cKPiM4PE9F6ai44kaMtkMySdPCAEdPRojfXL1oaNUhov0S2fM9ayj2yNC6dBsABZcTm",
];

const businessDescriptions = {
    "Coffee Shop":
        "Build a professional coffee operation with espresso machines, grinders, refrigeration and essential equipment.",
    Bakery:
        "Equip your bakery with professional ovens, preparation equipment and everything needed for daily production.",
    Restaurant:
        "Set up your commercial kitchen with reliable cooking, refrigeration and preparation equipment.",
    "Salon / Beauty Parlor":
        "Create a professional salon with styling chairs, fixtures and essential beauty equipment.",
};

const Home = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, isAdmin, logout } = useAuth();

    const [businessTypes, setBusinessTypes] = useState([]);
    const [products, setProducts] = useState([]);
    const [loadingBusinessTypes, setLoadingBusinessTypes] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const loadBusinessTypes = async () => {
            try {
                const data = await businessTypeService.getAll();
                setBusinessTypes(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load business types:", error);
            } finally {
                setLoadingBusinessTypes(false);
            }
        };

        const loadProducts = async () => {
            try {
                const data = await productService.getAll();
                setProducts(Array.isArray(data) ? data.slice(0, 4) : []);
            } catch (error) {
                console.error("Failed to load products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadBusinessTypes();
        loadProducts();
    }, []);

    const handleBusinessClick = (id) => {
        navigate(`/equipment?businessTypeId=${id}`);
    };

    return (
        <div className="min-h-screen bg-[#faf9fb] text-[#1a1b1f]">

            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 border-b border-black/4 bg-white/85 backdrop-blur-xl">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-6 lg:px-12">

                    <Link to="/" className="flex shrink-0 items-center gap-2.5">
                        <img
                            src={bizkitLogo}
                            alt="BizKit"
                            className="h-13 w-auto object-contain"
                        />
                    </Link>

                    <nav className="hidden items-center gap-7 xl:flex">
                        <Link
                            to="/equipment"
                            className="text-sm font-medium text-[#4c4546] transition hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/"
                            className="text-sm font-medium text-[#4c4546] transition hover:text-black"
                        >
                            Business Kits
                        </Link>

                        <Link
                            to="/"
                            className="text-sm font-medium text-[#4c4546] transition hover:text-black"
                        >
                            Resale & Trade-in
                        </Link>

                        <a
                            href="#how-it-works"
                            className="text-sm font-medium text-[#4c4546] transition hover:text-black"
                        >
                            How It Works
                        </a>

                        <a
                            href="#support"
                            className="text-sm font-medium text-[#4c4546] transition hover:text-black"
                        >
                            Support
                        </a>
                    </nav>

                    <div className="flex shrink-0 items-center gap-2">

                        <button
                            type="button"
                            onClick={() => navigate("/equipment")}
                            className="flex h-9 w-9 items-center justify-center rounded-full text-[#4c4546] transition hover:bg-[#f0eff3] hover:text-black"
                            aria-label="Search equipment"
                        >
                            <span className="text-lg">⌕</span>
                        </button>

                        <Link
                            to="/cart"
                            className="flex h-9 items-center gap-2 rounded-full px-3 text-sm text-[#4c4546] transition hover:bg-[#f0eff3]"
                        >
                            <span className="flex h-9 items-center rounded-full px-4 text-sm font-medium text-[#4c4546] transition hover:bg-[#f0eff3] hover:text-black">Cart</span>
                        </Link>

                        {!isAuthenticated ? (
                            <div className="hidden items-center gap-2 sm:flex">
                                <Link
                                    to="/login"
                                    className="flex h-9 items-center rounded-full px-4 text-sm font-medium text-[#4c4546] transition hover:bg-[#f0eff3] hover:text-black"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="flex h-9 items-center rounded-full bg-black px-4 text-sm font-medium text-white transition hover:bg-[#333]"
                                >
                                    Register
                                </Link>
                            </div>
                        ) : (
                            <div className="hidden items-center gap-2 sm:flex">
                                {isAdmin && (
                                    <Link
                                        to="/admin"
                                        className="rounded-full px-3 py-2 text-sm font-medium text-[#4c4546] hover:bg-[#f0eff3]"
                                    >
                                        Admin Dashboard
                                    </Link>
                                )}

                                <Link
                                    to="/orders"
                                    className="rounded-full px-3 py-2 text-sm font-medium text-[#4c4546] hover:bg-[#f0eff3]"
                                >
                                    Orders
                                </Link>

                                <button
                                    type="button"
                                    onClick={logout}
                                    className="rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:bg-[#333]"
                                >
                                    Logout
                                </button>
                            </div>
                        )}

                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white">
                            <span className="text-sm">
                                {isAuthenticated
                                    ? user?.fullName?.charAt(0)?.toUpperCase() || "U"
                                    : "U"}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="pt-16">

                {/* Hero */}
                <section className="overflow-hidden bg-white px-6 pb-24 pt-14 lg:px-12 lg:pt-20">
                    <div className="mx-auto flex max-w-4xl flex-col items-center text-center">

                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-[#f0eff3] px-4 py-2 text-xs font-medium text-[#4c4546]">
                            <span className="h-1.5 w-1.5 rounded-full bg-black" />
                            Commercial Equipment Marketplace
                        </div>

                        <h1 className="max-w-4xl text-4xl font-semibold leading-tight tracking-[-0.035em] sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
                            Build Your Business.
                            <br />
                            Equip It Right.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-7 text-[#5f5e60] sm:text-lg">
                            BizKit helps entrepreneurs discover the right commercial
                            equipment for their business, build their equipment setup,
                            purchase what they need and resell equipment when it's time
                            to upgrade.
                        </p>

                        <div className="mt-9 flex flex-wrap justify-center gap-4">
                            <a
                                href="#business-types"
                                className="flex h-12 items-center rounded-full bg-black px-8 text-sm font-medium text-white shadow-sm transition hover:bg-[#333]"
                            >
                                Choose Your Business
                            </a>

                            <Link
                                to="/equipment"
                                className="flex h-12 items-center rounded-full bg-[#eeedf3] px-8 text-sm font-medium text-[#1a1b1f] transition hover:bg-[#e3e2e7]"
                            >
                                Explore Equipment
                            </Link>
                        </div>

                        <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm text-[#5f5e60]">
                            <span>✓ Curated Equipment</span>
                            <span>✓ Transparent Pricing</span>
                            <span>✓ Resale Marketplace</span>
                        </div>
                    </div>

                    <div className="mx-auto mt-14 max-w-6xl rounded-2xl bg-[#f4f3f8] p-3 shadow-sm md:p-5">
                        <div className="relative aspect-video overflow-hidden rounded-xl bg-[#e9e7ed] md:aspect-21/9">
                            <img
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDblDXuKALYGgSkcp0SUCXVBjUBxtKtpmYJaI_aGc9mFOo8Xgb0PTO-J-x3g7DesE0zEFZnxAW0t1bm2i8gnNfMBL1crRn6sTx46C8ZIUAVqg3Vd-Sd8G2TY-eCDQ1PeFC4eUFYYQpeNd7fy39chLHCFz0SQqAbOSdqGB6lXZx_M2kFVqdwP0IMGuCenGZwAdWCTqmNDyORj3uHM4Uvmlukz9S8P7bnd44WI9vSJ21Iq9b1tC8LH06f"
                                alt="Commercial equipment"
                                className="h-full w-full object-cover"
                            />

                            <div className="absolute bottom-5 left-5 rounded-full bg-white/85 px-4 py-2.5 text-xs font-medium text-[#1a1b1f] shadow-sm backdrop-blur-md">
                                Curated commercial equipment for growing businesses
                            </div>
                        </div>
                    </div>
                </section>

                {/* Business Types */}
                <section
                    id="business-types"
                    className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28"
                >
                    <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                        <div className="max-w-xl">
                            <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#5f5e60]">
                                Choose Your Business
                            </span>

                            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Equipment built around your business.
                            </h2>
                        </div>

                        <p className="max-w-md text-sm leading-6 text-[#5f5e60]">
                            Start with your business type and discover the equipment
                            recommended for your operation.
                        </p>
                    </div>

                    {loadingBusinessTypes ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-107.5 animate-pulse rounded-2xl bg-[#eeedf3]"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {businessTypes.slice(0, 4).map((businessType, index) => (
                                <button
                                    key={businessType.id}
                                    type="button"
                                    onClick={() => handleBusinessClick(businessType.id)}
                                    className="group rounded-2xl bg-white p-5 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-md"
                                >
                                    <div className="relative mb-5 aspect-4/3 overflow-hidden rounded-xl bg-[#eeedf3]">
                                        <img
                                            src={
                                                businessType.imageUrl ||
                                                fallbackBusinessImages[index]
                                            }
                                            alt={businessType.name}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                        />

                                        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium backdrop-blur-sm">
                                            Kit {String(index + 1).padStart(2, "0")}
                                        </span>
                                    </div>

                                    <div className="mb-2 flex items-center justify-between">
                                        <h3 className="text-lg font-semibold tracking-tight">
                                            {businessType.name}
                                        </h3>

                                        <span className="text-lg transition-transform group-hover:translate-x-1">
                                            ↗
                                        </span>
                                    </div>

                                    <p className="mb-5 line-clamp-3 text-sm leading-6 text-[#5f5e60]">
                                        {businessType.description ||
                                            businessDescriptions[businessType.name] ||
                                            "Explore recommended commercial equipment for this business type."}
                                    </p>

                                    <span className="text-sm font-semibold text-black">
                                        Explore Equipment →
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Essential Equipment */}
                <section className="bg-[#f4f3f8] px-6 py-20 lg:px-12 lg:py-28">
                    <div className="mx-auto max-w-7xl">

                        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                            <div>
                                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-[#5f5e60]">
                                    Equipment Catalog
                                </span>

                                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                    Essential Equipment
                                </h2>

                                <p className="mt-2 text-sm text-[#5f5e60]">
                                    Explore commercial equipment available through BizKit.
                                </p>
                            </div>

                            <Link
                                to="/equipment"
                                className="text-sm font-semibold text-black"
                            >
                                View all equipment →
                            </Link>
                        </div>

                        {loadingProducts ? (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {[1, 2, 3, 4].map((item) => (
                                    <div
                                        key={item}
                                        className="h-120 animate-pulse rounded-2xl bg-white"
                                    />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="rounded-2xl bg-white p-12 text-center text-sm text-[#5f5e60]">
                                No equipment is available right now.
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                                {products.map((product, index) => (
                                    <div
                                        key={product.id}
                                        className="group flex flex-col justify-between rounded-2xl bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1"
                                    >
                                        <div>
                                            <Link to={`/products/${product.id}`}>
                                                <div className="relative mb-5 flex aspect-square items-center justify-center overflow-hidden rounded-xl bg-[#f4f3f8] p-6">
                                                    <img
                                                        src={
                                                            product.imageUrl ||
                                                            fallbackProductImages[index]
                                                        }
                                                        alt={product.name}
                                                        className="h-full w-full object-contain mix-blend-multiply transition duration-500 group-hover:scale-105"
                                                    />

                                                    <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[11px] font-medium shadow-sm">
                                                        {product.stockQuantity > 0
                                                            ? "In Stock"
                                                            : "Out of Stock"}
                                                    </span>
                                                </div>
                                            </Link>

                                            <span className="text-[11px] font-medium uppercase tracking-wider text-[#5f5e60]">
                                                Commercial Equipment
                                            </span>

                                            <h3 className="mt-1 line-clamp-2 text-lg font-semibold tracking-tight">
                                                {product.name}
                                            </h3>

                                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-[#5f5e60]">
                                                {product.description ||
                                                    "Professional commercial equipment for your business."}
                                            </p>
                                        </div>

                                        <div className="mt-6">
                                            <div className="mb-4 flex items-center justify-between">
                                                <span className="text-lg font-semibold">
                                                    ${Number(product.price || 0).toLocaleString()}
                                                </span>

                                                <span className="text-[11px] text-[#5f5e60]">
                                                    {product.stockQuantity > 0
                                                        ? `${product.stockQuantity} available`
                                                        : "Unavailable"}
                                                </span>
                                            </div>

                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/products/${product.id}`}
                                                    className="flex h-10 flex-1 items-center justify-center rounded-full bg-black text-xs font-medium text-white transition hover:bg-[#333]"
                                                >
                                                    View Product
                                                </Link>

                                                <button
                                                    type="button"
                                                    onClick={() => navigate(`/products/${product.id}`)}
                                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eeedf3] text-sm transition hover:bg-[#e3e2e7]"
                                                    aria-label="View product"
                                                >
                                                    ↗
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* How It Works */}
                <section
                    id="how-it-works"
                    className="mx-auto max-w-7xl px-6 py-20 lg:px-12 lg:py-28"
                >
                    <div className="mx-auto mb-16 max-w-3xl text-center">
                        <span className="mb-3 block text-xs font-medium uppercase tracking-[0.18em] text-[#5f5e60]">
                            How BizKit Works
                        </span>

                        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                            From business idea to fully equipped operation.
                        </h2>

                        <p className="mt-4 text-sm leading-6 text-[#5f5e60]">
                            Choose your business, discover the right equipment, build your
                            cart and manage your equipment throughout its lifecycle.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {[
                            {
                                number: "01",
                                title: "Choose Your Business",
                                text: "Select Coffee Shop, Bakery, Restaurant or Salon and discover equipment suited to your business.",
                                icon: "⌘",
                            },
                            {
                                number: "02",
                                title: "Build Your Setup",
                                text: "Browse recommended equipment, compare products and adjust quantities according to your requirements.",
                                icon: "＋",
                            },
                            {
                                number: "03",
                                title: "Order Equipment",
                                text: "Add equipment to your cart, review your order and complete checkout using the available payment methods.",
                                icon: "✓",
                            },
                            {
                                number: "04",
                                title: "Resell When Ready",
                                text: "When equipment is no longer needed, eligible owned equipment can enter the BizKit resale marketplace.",
                                icon: "↻",
                            },
                        ].map((step) => (
                            <div
                                key={step.number}
                                className="relative overflow-hidden rounded-2xl bg-white p-8 shadow-sm"
                            >
                                <span className="mb-6 block text-5xl font-bold tracking-tight text-[#e3e2e7]">
                                    {step.number}
                                </span>

                                <h3 className="mb-3 text-lg font-semibold">
                                    {step.title}
                                </h3>

                                <p className="text-sm leading-6 text-[#5f5e60]">
                                    {step.text}
                                </p>

                                <div className="mt-8 flex items-center gap-2 text-sm font-medium">
                                    <span>{step.icon}</span>
                                    <span>BizKit</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Resale */}
                <section className="px-6 pb-20 lg:px-12 lg:pb-24">
                    <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-12 rounded-2xl bg-[#eeedf3] p-8 md:p-12 lg:flex-row lg:p-16">

                        <div className="max-w-xl">
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#5f5e60]">
                                ↻ Circular Equipment Lifecycle
                            </div>

                            <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                                Have equipment you no longer need?
                            </h2>

                            <p className="mt-4 text-sm leading-6 text-[#5f5e60]">
                                BizKit's resale marketplace gives eligible equipment owners
                                a way to list equipment they no longer need and connect with
                                other businesses looking for commercial equipment.
                            </p>

                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link
                                    to="/"
                                    className="flex h-12 items-center rounded-full bg-black px-7 text-sm font-medium text-white transition hover:bg-[#333]"
                                >
                                    Explore Resale
                                </Link>

                                <Link
                                    to="/"
                                    className="text-sm font-medium text-black"
                                >
                                    Learn how resale works →
                                </Link>
                            </div>
                        </div>

                        <div className="grid w-full shrink-0 grid-cols-1 gap-4 sm:grid-cols-3 lg:w-95 lg:grid-cols-1">
                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <span className="block text-lg font-semibold">
                                    Owned Equipment
                                </span>
                                <p className="mt-1 text-xs uppercase tracking-wider text-[#5f5e60]">
                                    Resell eligible purchases
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <span className="block text-lg font-semibold">
                                    Marketplace
                                </span>
                                <p className="mt-1 text-xs uppercase tracking-wider text-[#5f5e60]">
                                    Discover pre-owned equipment
                                </p>
                            </div>

                            <div className="rounded-2xl bg-white p-5 shadow-sm">
                                <span className="block text-lg font-semibold">
                                    Business Lifecycle
                                </span>
                                <p className="mt-1 text-xs uppercase tracking-wider text-[#5f5e60]">
                                    Buy → Use → Resell
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer
                id="support"
                className="bg-[#f4f3f8]"
            >
                <div className="mx-auto max-w-7xl px-6 pb-12 pt-16 lg:px-12">

                    <div className="grid grid-cols-2 gap-8 pb-14 md:grid-cols-4 lg:gap-12">

                        <div>
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider">
                                Shop by Business
                            </h4>

                            <div className="flex flex-col gap-3 text-sm text-[#5f5e60]">
                                <Link to="/equipment">Coffee Shop</Link>
                                <Link to="/equipment">Bakery</Link>
                                <Link to="/equipment">Restaurant</Link>
                                <Link to="/equipment">Salon & Beauty</Link>
                                <Link to="/equipment">All Equipment</Link>
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider">
                                BizKit
                            </h4>

                            <div className="flex flex-col gap-3 text-sm text-[#5f5e60]">
                                <a href="#business-types">Business Kits</a>
                                <Link to="/equipment">Equipment Catalog</Link>
                                <a href="#how-it-works">How It Works</a>
                                <a href="#support">Support</a>
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider">
                                Account
                            </h4>

                            <div className="flex flex-col gap-3 text-sm text-[#5f5e60]">
                                {!isAuthenticated && (
                                    <>
                                        <Link to="/login">Sign In</Link>
                                        <Link to="/register">Create Account</Link>
                                    </>
                                )}

                                {isAuthenticated && (
                                    <>
                                        <Link to="/orders">My Orders</Link>
                                        <Link to="/cart">Shopping Cart</Link>
                                        <button
                                            type="button"
                                            onClick={logout}
                                            className="text-left"
                                        >
                                            Logout
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <div>
                            <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider">
                                Marketplace
                            </h4>

                            <div className="flex flex-col gap-3 text-sm text-[#5f5e60]">
                                <Link to="/">Resale & Trade-in</Link>
                                <Link to="/">Equipment Ownership</Link>
                                <Link to="/">Terms</Link>
                                <Link to="/">Privacy</Link>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center justify-between gap-4 border-t border-black/6 pt-8 text-xs text-[#5f5e60] md:flex-row">
                        <p>
                            © 2026 BizKit. Commercial equipment for growing businesses.
                        </p>

                        <div className="flex gap-6">
                            <span>Nepal</span>
                            <span>NPR</span>
                            <span>Legal</span>
                        </div>
                    </div>

                </div>
            </footer>
        </div>
    );
};

export default Home;