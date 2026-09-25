import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import businessTypeService from "../services/businessTypeService";
import productService from "../services/productService";

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
    "Coffee Shop": "Equipment for coffee preparation and service.",
    Bakery: "Professional equipment for baking and preparation.",
    Restaurant: "Essential equipment for commercial kitchens.",
    "Salon / Beauty Parlor": "Equipment for professional salon services.",
};

const Home = () => {
    const navigate = useNavigate();

    const [businessTypes, setBusinessTypes] = useState([]);
    const [products, setProducts] = useState([]);
    const [featuredProductIndex, setFeaturedProductIndex] = useState(0);
    const [loadingBusinessTypes, setLoadingBusinessTypes] = useState(true);
    const [loadingProducts, setLoadingProducts] = useState(true);

    useEffect(() => {
        const loadBusinessTypes = async () => {
            try {
                const data = await businessTypeService.getAll();
                setBusinessTypes(Array.isArray(data) ? data.slice(0, 4) : []);
            } catch (error) {
                console.error("Failed to load business types:", error);
            } finally {
                setLoadingBusinessTypes(false);
            }
        };

        const loadProducts = async () => {
            try {
                const data = await productService.getAll();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to load products:", error);
            } finally {
                setLoadingProducts(false);
            }
        };

        loadBusinessTypes();
        loadProducts();
    }, []);

    useEffect(() => {
        if (products.length < 2) {
            return undefined;
        }

        const intervalId = setInterval(() => {
            setFeaturedProductIndex((currentIndex) => {
                let nextIndex = Math.floor(Math.random() * products.length);

                if (nextIndex === currentIndex) {
                    nextIndex = (currentIndex + 1) % products.length;
                }

                return nextIndex;
            });
        }, 3000);

        return () => clearInterval(intervalId);
    }, [products.length]);

    const handleBusinessClick = (id) => {
        navigate(`/equipment?businessTypeId=${id}`);
    };

    const featuredProduct = products[featuredProductIndex] || products[0];

    return (
        <div className="min-h-screen bg-white text-[#171717]">
            <main>
                {/* Hero */}
                <section className="border-b border-gray-200 bg-[#eaf2f8]">
                    <div className="mx-auto grid max-w-7xl items-center gap-8 px-5 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
                        <div className="max-w-2xl">

                            <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl lg:text-5xl">
                                Shop equipment for your business.
                            </h1>

                            <p className="mt-3 max-w-lg text-base leading-7 text-gray-600">
                                Compare practical equipment for coffee shops,
                                bakeries, restaurants, and salons.
                            </p>

                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link
                                    to="/business-types"
                                    className="rounded-lg bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                                >
                                    Choose business
                                </Link>

                                <Link
                                    to="/equipment"
                                    className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-black"
                                >
                                    Shop all equipment
                                </Link>
                            </div>
                        </div>

                        <Link
                            to={
                                featuredProduct
                                    ? `/products/${featuredProduct.id}`
                                    : "/equipment"
                            }
                            className="hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:block"
                        >
                            <div className="flex items-center gap-5">
                                <div className="flex h-36 w-36 shrink-0 items-center justify-center rounded-lg bg-gray-50">
                                    <img
                                        src={
                                            featuredProduct?.imageUrl ||
                                            fallbackProductImages[0]
                                        }
                                        alt={
                                            featuredProduct?.name ||
                                            "Featured equipment"
                                        }
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Featured product
                                    </p>

                                    <h2 className="mt-2 line-clamp-2 text-lg font-semibold text-black">
                                        {featuredProduct?.name ||
                                            "Browse our equipment catalog"}
                                    </h2>

                                    <span className="mt-4 inline-block text-sm font-medium text-black underline hover:text-gray-800">
                                        View product
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </section>

                {/* Business Types */}
                <section className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
                    <div className="mb-6">
                        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                            Choose your business
                        </h2>

                        <p className="mt-2 text-sm text-gray-600">
                            Start with a business type to see relevant
                            equipment.
                        </p>
                    </div>

                    {loadingBusinessTypes ? (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {[1, 2, 3, 4].map((item) => (
                                <div
                                    key={item}
                                    className="h-72 rounded-xl border border-gray-200 bg-gray-100"
                                />
                            ))}
                        </div>
                    ) : businessTypes.length === 0 ? (
                        <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
                            No business types available.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                            {businessTypes.map((businessType, index) => (
                                <button
                                    key={businessType.id}
                                    type="button"
                                    onClick={() =>
                                        handleBusinessClick(businessType.id)
                                    }
                                    className="overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
                                >
                                    <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                        <img
                                            src={
                                                businessType.imageUrl ||
                                                fallbackBusinessImages[index]
                                            }
                                            alt={businessType.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="p-5">
                                        <h3 className="text-lg font-semibold text-black">
                                            {businessType.name}
                                        </h3>

                                        <p className="mt-2 text-sm leading-6 text-gray-600">
                                            {businessType.description ||
                                                businessDescriptions[
                                                businessType.name
                                                ] ||
                                                "View equipment for this business."}
                                        </p>

                                        <span className="mt-4 inline-block text-sm font-medium text-black underline hover:text-gray-800">
                                            View equipment
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </section>

                {/* Equipment */}
                <section className="border-y border-gray-200 bg-[#fafafa]">
                    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 lg:py-10">
                        <div className="mb-6 flex items-end justify-between gap-4">
                            <div>
                                <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                                    Shop equipment
                                </h2>

                                <p className="mt-2 text-sm text-gray-600">
                                    Popular products from our catalog.
                                </p>
                            </div>

                            <Link
                                to="/equipment"
                                className="hidden text-sm font-medium text-black transition-colors sm:block underline hover:text-gray-800"
                            >
                                View all
                            </Link>
                        </div>

                        {loadingProducts ? (
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                                    <div
                                        key={item}
                                        className="h-96 rounded-xl border border-gray-200 bg-white"
                                    />
                                ))}
                            </div>
                        ) : products.length === 0 ? (
                            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                                No equipment is available right now.
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                    {products.map((product, index) => (
                                        <div
                                            key={product.id}
                                            className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300"
                                        >
                                            <Link
                                                to={`/products/${product.id}`}
                                            >
                                                <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                                                    <img
                                                        src={
                                                            product.imageUrl ||
                                                            fallbackProductImages[
                                                            index %
                                                            fallbackProductImages.length
                                                            ]
                                                        }
                                                        alt={product.name}
                                                        className="h-full w-full object-cover"
                                                    />

                                                    <span
                                                        className={`absolute left-3 top-3 rounded-md px-2 py-1 text-xs font-medium ${product.stockQuantity >
                                                                0
                                                                ? "bg-white text-gray-700"
                                                                : "bg-gray-200 text-gray-500"
                                                            }`}
                                                    >
                                                        {product.stockQuantity >
                                                            0
                                                            ? "In stock"
                                                            : "Out of stock"}
                                                    </span>
                                                </div>
                                            </Link>

                                            <div className="flex flex-1 flex-col pt-4">
                                                <h3 className="line-clamp-2 text-base font-semibold text-black">
                                                    {product.name}
                                                </h3>

                                                <p className="mt-2 line-clamp-2 text-sm leading-5 text-gray-600">
                                                    {product.description ||
                                                        "Commercial equipment for your business."}
                                                </p>

                                                <div className="mt-auto pt-5">
                                                    <div className="flex items-center justify-between gap-3">
                                                        <span className="text-base font-semibold text-black">
                                                            $
                                                            {Number(
                                                                product.price ||
                                                                0
                                                            ).toLocaleString()}
                                                        </span>

                                                        <span className="text-xs text-gray-500">
                                                            {product.stockQuantity >
                                                                0
                                                                ? `${product.stockQuantity} available`
                                                                : "Unavailable"}
                                                        </span>
                                                    </div>

                                                    <Link
                                                        to={`/products/${product.id}`}
                                                        className="mt-4 flex h-10 items-center justify-center rounded-lg bg-black text-sm font-medium text-white transition-colors hover:bg-gray-800"
                                                    >
                                                        View product
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Link
                                    to="/equipment"
                                    className="mt-6 block text-center text-sm font-medium text-gray-700 transition-colors hover:text-black sm:hidden"
                                >
                                    View all equipment →
                                </Link>
                            </>
                        )}
                    </div>
                </section>

            </main>

        </div>
    );
};

export default Home;