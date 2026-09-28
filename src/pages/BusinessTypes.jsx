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
      <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
            {search ? `Search results for "${search}"` : "Business types"}
          </h1>

          <p className="mt-2 text-sm text-gray-600">
            {search
              ? "Business types matching your search."
              : "Choose a business to find the equipment you need."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="h-80 rounded-lg border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : businessTypes.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <p className="text-sm text-gray-500">
              {search
                ? `No business types found for "${search}".`
                : "No business types available."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {businessTypes.map((businessType) => {
              const imageUrl = resolveImageUrl(businessType.imageUrl);

              return (
                <Link
                  key={businessType.id}
                  to={`/equipment?businessTypeId=${businessType.id}`}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-gray-100">
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

                  <div className="p-5">
                    <h2 className="text-lg font-semibold text-black">
                      {businessType.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-gray-600">
                      {businessType.description ||
                        businessDescriptions[businessType.name] ||
                        "View equipment for this business."}
                    </p>

                    <span className="mt-4 inline-block text-sm font-medium text-black underline hover:text-gray-800">
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