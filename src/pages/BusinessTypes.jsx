import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import businessTypeService from "../services/businessTypeService";

const fallbackBusinessImages = [
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDIaOBOZ6WvxPs3fRgYuk_rEYxP_4yCXlYzLebC9P7RVlTM3j3O8OtmVoIW0W_0qqX6lswChJ23cUrvJcfoO75eU8uXABNUsgQeOCEpX4D6nikiAeVeHxk0_9A9vsUDjCI81F4QLvV7ZBhNO7W4D9TpeiqU60CVyJTJ6eBMC5LVjUs3cwvg76UnWar6Snu7I7wOItbFfm04oKahgcm4zeG5b-15Yl7Z5AQNsN7u7rg4Ms2PKLQ_SjaW",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDRL4iV4u79GPsQ0eR_Q_POMIKfNcgNsp83QaD8NQfl8-DjN5vWJJuH3eJGnvm3CI3lo0l-K0u4sK3uMSKc-y9PsuVelxE-fJAUZZ4CWVXjGg67m8o_8WVIbNHYqwpyjxiW9lYuS_RGCx_dLWne9k3Wh3mjISma2861yVqc-IQbQnC5PJk-0sg2jkUJqw4wf99K5fllBa1rwRHDcGs1Syuf1VhgvfvgA18Ew279RKi3jeJPioVAdan9",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAn2GA3gd5bbDqoHd-MRfUaarHewYBcnVKs6FZZcKgCLBJDlkPZFli4dsauWukHM7q3SVLNpbm2i5TzOWbWkUogqvUQCv1WKObkJBO81p57IO1b7IQPeSco-pZnJBM729Otf6uGUAXz1IrUnPtRIZpq6FfDm9jm3pyg2lNzVxiF13aKw0FprENVQFtqpS-P-ufo6hQsN06TMdFMPDH7dUaVfzKg2oN-H-B1ZSu8fQVHzqVFqH3U2aL8",
    "https://lh3.googleusercontent.com/aida-public/AB6AXuDwrYByz939s2GOUVtRvUbGLDl-NBZtxvpWvwF9Bb8-lXCYdBfRbDu92c9jYakgmK2Klp5--mLX5VxRJxEVKRUu_vH8I7d-mv2hAdbu3Gty5uyD9gcUOM0L8_od_MTNnIkzPmUUW5qqlw9QD_ESNSnVVyTIcEX_3RdOKFL5NUF9Ca7kY74O-7nLxmwrey68AWYDWCPQO1Qz8JlFNIuZbJRJwFh9VrYJrIxJnrZW_fvV0JrkzCJFaHqh",
];

const businessDescriptions = {
    "Coffee Shop": "Equipment for coffee preparation and service.",
    Bakery: "Professional equipment for baking and preparation.",
    Restaurant: "Essential equipment for commercial kitchens.",
    "Salon / Beauty Parlor": "Equipment for professional salon services.",
};

const BusinessTypes = () => {
    const [businessTypes, setBusinessTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadBusinessTypes = async () => {
            try {
                const data = await businessTypeService.getAll();
                setBusinessTypes(Array.isArray(data) ? data : []);
            } catch (requestError) {
                setError(
                    requestError.userMessage ||
                    "Unable to load business types. Please try again."
                );
            } finally {
                setLoading(false);
            }
        };

        loadBusinessTypes();
    }, []);

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                        Business types
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        Choose a business to find the equipment you need.
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
                    <div className="rounded-lg border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
                        No business types available.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                        {businessTypes.map((businessType, index) => (
                            <Link
                                key={businessType.id}
                                to={`/equipment?businessTypeId=${businessType.id}`}
                                className="overflow-hidden rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                            >
                                <div className="aspect-[4/3] overflow-hidden bg-gray-100">
                                    <img
                                        src={
                                            businessType.imageUrl ||
                                            fallbackBusinessImages[
                                                index % fallbackBusinessImages.length
                                            ]
                                        }
                                        alt={businessType.name}
                                        className="h-full w-full object-cover"
                                    />
                                </div>

                                <div className="p-5">
                                    <h2 className="text-lg font-semibold text-black">
                                        {businessType.name}
                                    </h2>
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
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
};

export default BusinessTypes;
