import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import businessTypeService from "../services/businessTypeService";
import productService from "../services/productService";
import { resolveImageUrl } from "../utils/imageUrl";

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

  const featuredProduct =
    products.length > 0 ? products[featuredProductIndex] || products[0] : null;

  return (
    <div className="min-h-screen bg-white text-[#171717]">
      <main>
        {/* Hero */}
        <section className="border-b border-gray-200 bg-[#eaf2f8]">
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-10">
            <div className="max-w-2xl min-w-0">
              <h1 className="break-words text-3xl font-semibold leading-[1.15] tracking-tight text-black sm:text-4xl lg:text-5xl">
                Shop equipment for you business.
              </h1>

              <p className="mt-3 max-w-lg text-base leading-7 text-gray-600">
                Compare practical equipment for coffee shops, bakeries,
                restaurants, and salons.
              </p>

              <div className="mt-5 flex flex-col gap-3 xs:flex-row sm:flex-row">
                <Link
                  to="/business-types"
                  className="rounded-lg bg-black px-5 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
                >
                  Choose business
                </Link>

                <Link
                  to="/equipment"
                  className="rounded-lg border border-gray-300 bg-white px-5 py-3 text-center text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 hover:text-black"
                >
                  Shop all equipment
                </Link>
              </div>
            </div>

            {loadingProducts ? (
              /* Hero Loading Skeleton */
              <div className="hidden animate-pulse rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:block">
                <div className="flex items-center gap-5">
                  <div className="h-28 w-28 shrink-0 rounded-lg bg-gray-200 sm:h-36 sm:w-36" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-20 rounded bg-gray-200" />
                  </div>
                </div>
              </div>
            ) : featuredProduct ? (
              <Link
                to={`/products/${featuredProduct.id}`}
                className="hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:block"
              >
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-gray-100 bg-gray-50 sm:h-36 sm:w-36">
                    {featuredProduct.imageUrl ? (
                      <img
                        src={resolveImageUrl(featuredProduct.imageUrl)}
                        alt={featuredProduct.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                      Featured product
                    </p>

                    <h2 className="mt-2 line-clamp-2 break-words text-lg font-semibold text-black">
                      {featuredProduct.name}
                    </h2>

                    <span className="mt-4 inline-block text-sm font-medium text-black underline hover:text-gray-800">
                      View product
                    </span>
                  </div>
                </div>
              </Link>
            ) : (
              /* No Products Available State with Skeleton Box */
              <div className="hidden rounded-xl border border-dashed border-gray-300 bg-white/70 p-4 sm:block">
                <div className="flex items-center gap-4 sm:gap-5">
                  <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-gray-400 sm:h-36 sm:w-36">
                    No Image
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                      Featured product
                    </p>

                    <h2 className="mt-2 break-words text-base font-medium text-gray-500">
                      No products to display
                    </h2>

                    <p className="mt-1 text-xs text-gray-400">
                      Check back later for new arrivals
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Business Types */}
        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mb-6">
            <h2 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
              Choose your business
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Start with a business type to see relevant equipment.
            </p>
          </div>

          {loadingBusinessTypes ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white"
                >
                  <div className="aspect-[4/3.3] bg-gray-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-5 w-3/4 rounded bg-gray-200" />
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-24 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : businessTypes.length === 0 ? (
            <div className="rounded-xl border border-gray-200 p-8 text-center text-sm text-gray-500">
              No business types available.
            </div>
          ) : (
            <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {businessTypes.map((businessType) => (
                <button
                  key={businessType.id}
                  type="button"
                  onClick={() => handleBusinessClick(businessType.id)}
                  className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white text-left transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="aspect-[4/3.3] w-full shrink-0 overflow-hidden bg-gray-100">
                    {businessType.imageUrl ? (
                      <img
                        src={resolveImageUrl(businessType.imageUrl)}
                        alt={businessType.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col p-5">
                    <h3 className="line-clamp-2 break-words text-lg font-semibold text-black">
                      {businessType.name}
                    </h3>

                    {businessType.description && (
                      <p className="mt-2 line-clamp-2 break-words text-sm leading-6 text-gray-600">
                        {businessType.description}
                      </p>
                    )}

                    <span className="mt-auto inline-block self-start pt-4 text-sm font-medium text-black underline hover:text-gray-800">
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
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                  Shop equipment
                </h2>

                <p className="mt-2 text-sm text-gray-600">
                  Popular products from our catalog.
                </p>
              </div>

              <Link
                to="/equipment"
                className="hidden shrink-0 text-sm font-medium text-black underline transition-colors hover:text-gray-800 sm:block"
              >
                View all
              </Link>
            </div>

            {loadingProducts ? (
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                  <div
                    key={item}
                    className="animate-pulse flex flex-col rounded-xl border border-gray-200 bg-white p-4"
                  >
                    <div className="aspect-square rounded-lg bg-gray-200" />
                    <div className="mt-4 space-y-2.5">
                      <div className="h-4 w-3/4 rounded bg-gray-200" />
                      <div className="h-3 w-full rounded bg-gray-200" />
                      <div className="h-4 w-1/3 rounded bg-gray-200 pt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
                No equipment is available right now.
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="flex min-w-0 flex-col rounded-xl border border-gray-200 bg-gray-50 p-3 transition-colors hover:border-gray-300"
                    >
                      <Link to={`/products/${product.id}`}>
                        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-50">
                          {product.imageUrl ? (
                            <img
                              src={resolveImageUrl(product.imageUrl)}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                      </Link>

                      <div className="flex min-w-0 flex-1 flex-col pt-4">
                        <h3 className="line-clamp-2 break-words text-base font-semibold text-black">
                          {product.name}
                        </h3>

                        {product.description && (
                          <p className="mt-2 line-clamp-2 break-words text-sm leading-5 text-gray-600">
                            {product.description}
                          </p>
                        )}

                        <div className="mt-auto pt-5">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <span className="text-base font-semibold text-black">
                              Rs.
                              {Number(product.price || 0).toLocaleString()}
                            </span>

                            <span className="text-xs text-gray-500">
                              {product.stockQuantity > 0
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
                  View all equipment
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