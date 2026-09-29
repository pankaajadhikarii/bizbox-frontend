import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import businessTypeService from "../services/businessTypeService";
import { resolveImageUrl } from "../utils/imageUrl";

const businessDescriptions = {
  "Coffee Shop": "Equipment for coffee preparation and service.",
  Bakery: "Professional equipment for baking and preparation.",
  Restaurant: "Essential equipment for commercial kitchens.",
  "Salon / Beauty Parlor": "Equipment for professional salon services.",
};

const BusinessTypes = () => {
  const [searchParams] = useSearchParams();
  const search = searchParams.get("search") || "";

  const [businessTypes, setBusinessTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadBusinessTypes = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await businessTypeService.getAll(search);
        setBusinessTypes(Array.isArray(data) ? data : []);
      } catch (requestError) {
        setError(
          requestError.userMessage ||
            "Unable to load business types. Please try again."
        );
        setBusinessTypes([]);
      } finally {
        setLoading(false);
      }
    };

    loadBusinessTypes();
  }, [search]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <div className="mb-6 sm:mb-8">
          <h1 className="break-words text-2xl font-semibold tracking-tight text-black sm:text-3xl lg:text-4xl">
            {search ? `Search results for "${search}"` : "Business types"}
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
            {search
              ? "Business types matching your search."
              : "Choose a business to find the equipment you need."}
          </p>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-5 text-red-700 sm:mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-72 animate-pulse rounded-lg border border-gray-200 bg-white sm:h-80"
              />
            ))}
          </div>
        ) : businessTypes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-6 text-center sm:p-8">
            <p className="break-words text-sm leading-6 text-gray-500">
              {search
                ? `No business types found for "${search}".`
                : "No business types available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-4">
            {businessTypes.map((businessType) => {
              const imageUrl = resolveImageUrl(businessType.imageUrl);

              return (
                <Link
                  key={businessType.id}
                  to={`/equipment?businessTypeId=${businessType.id}`}
                  className="flex min-w-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white transition-colors hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-100">
                    {imageUrl && (
                      <img
                        src={imageUrl}
                        alt={businessType.name}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                          event.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h2 className="break-words text-base font-semibold leading-6 text-black sm:text-lg">
                      {businessType.name}
                    </h2>

                    <p className="mt-2 line-clamp-3 break-words text-sm leading-6 text-gray-600">
                      {businessType.description ||
                        businessDescriptions[businessType.name] ||
                        "View equipment for this business."}
                    </p>

                    <span className="mt-auto inline-block self-start pt-4 text-sm font-medium text-black transition-colors hover:text-gray-800">
                      View equipment
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
};

export default BusinessTypes;