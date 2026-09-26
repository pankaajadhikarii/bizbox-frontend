import { useEffect, useState } from "react";
import businessTypeService from "../../services/businessTypeService";
import productService from "../../services/productService";
import { Upload } from "lucide-react";
import { resolveImageUrl } from "../../utils/imageUrl";

const AdminBusinessTypes = () => {
    const [businessTypes, setBusinessTypes] = useState([]);
    const [products, setProducts] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const [selectedBusinessType, setSelectedBusinessType] = useState(null);
    const [businessProducts, setBusinessProducts] = useState([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    const [showProducts, setShowProducts] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState("");

    useEffect(() => {
        loadBusinessTypes();
        loadProducts();
    }, []);

    const loadBusinessTypes = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await businessTypeService.getAll();
            setBusinessTypes(data);
        } catch (err) {
            setError(err.userMessage || "Failed to load business types.");
        } finally {
            setLoading(false);
        }
    };

    const loadProducts = async () => {
        try {
            const data = await productService.getAll();
            setProducts(data);
        } catch (err) {
            setError(err.userMessage || "Failed to load products.");
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
        });

        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
    };

    const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/jpg"];
    const ALLOWED_EXTENSIONS = [".png", ".jpg", ".jpeg"];

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
        const isValidFormat =
            ALLOWED_IMAGE_TYPES.includes(file.type) ||
            ALLOWED_EXTENSIONS.includes(fileExtension);

        if (!isValidFormat) {
            setError("Unsupported file format. Please upload a PNG, JPG, or JPEG image.");
            e.target.value = "";
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError("Image must be 2MB or smaller.");
            e.target.value = "";
            return;
        }

        setError("");
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setError("Business type name is required.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Description is required.");
            return;
        }

        if (!editingId && !imageFile) {
            setError("Please upload an image for this business type.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            if (editingId) {
                await businessTypeService.update(editingId, {
                    name: formData.name.trim(),
                    description: formData.description.trim(),
                });
            } else {
                const payload = new FormData();
                payload.append("name", formData.name.trim());
                payload.append("description", formData.description.trim());
                payload.append("image", imageFile);

                await businessTypeService.create(payload);
            }

            await loadBusinessTypes();
            resetForm();
        } catch (err) {
            setError(err.userMessage || "Failed to save business type.");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (businessType) => {
        setEditingId(businessType.id);

        setFormData({
            name: businessType.name || "",
            description: businessType.description || "",
        });

        setImageFile(null);
        setImagePreview(businessType.imageUrl ? resolveImageUrl(businessType.imageUrl) : null);

        setShowForm(true);
        setError("");
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this business type?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await businessTypeService.delete(id);
            await loadBusinessTypes();

            if (selectedBusinessType?.id === id) {
                setSelectedBusinessType(null);
                setBusinessProducts([]);
                setShowProducts(false);
            }
        } catch (err) {
            setError(err.userMessage || "Failed to delete business type.");
        }
    };

    const handleManageProducts = async (businessType) => {
        try {
            setSelectedBusinessType(businessType);
            setShowProducts(true);
            setLoadingProducts(true);
            setSelectedProductId("");
            setError("");

            const data = await businessTypeService.getProducts(businessType.id);
            setBusinessProducts(data);
        } catch (err) {
            setError(err.userMessage || "Failed to load business type products.");
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleAddProduct = async () => {
        if (!selectedProductId) {
            setError("Please select a product.");
            return;
        }

        try {
            setError("");

            await businessTypeService.addProduct(selectedBusinessType.id, {
                productId: Number(selectedProductId),
            });

            const data = await businessTypeService.getProducts(
                selectedBusinessType.id
            );

            setBusinessProducts(data);
            setSelectedProductId("");
        } catch (err) {
            setError(err.userMessage || "Failed to add product.");
        }
    };

    const handleRemoveProduct = async (productId) => {
        const confirmed = window.confirm(
            "Remove this product from the business type?"
        );

        if (!confirmed) return;

        try {
            setError("");

            await businessTypeService.removeProduct(
                selectedBusinessType.id,
                productId
            );

            const data = await businessTypeService.getProducts(
                selectedBusinessType.id
            );

            setBusinessProducts(data);
        } catch (err) {
            setError(err.userMessage || "Failed to remove product.");
        }
    };

    const availableProducts = products.filter(
        (product) =>
            !businessProducts.some(
                (businessProduct) => businessProduct.id === product.id
            )
    );

    return (
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Business Types
                        </h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Manage the business categories and their curated equipment.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                name: "",
                                description: "",
                            });
                            setImageFile(null);
                            setImagePreview(null);
                            setShowForm(true);
                            setError("");
                        }}
                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Add Business Type
                    </button>
                </div>

                {!showForm && error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {showForm && (
                    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingId
                                        ? "Edit Business Type"
                                        : "Create Business Type"}
                                </h2>
                                <p className="mt-1 text-sm text-gray-500">
                                    Add the basic information for this business type.
                                </p>
                            </div>

                            <button
                                onClick={resetForm}
                                className="text-sm text-gray-500 hover:text-gray-900"
                            >
                                Cancel
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Name
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Coffee Shop"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Description
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        placeholder="Short description"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Business Type Image
                                        <span className="ml-1 text-red-500">*</span>
                                    </label>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                        <label
                                            htmlFor="businessTypeImage"
                                            className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-4 py-6 text-center transition hover:border-gray-400 hover:bg-gray-50"
                                        >

                                            <Upload size={24} />
                                            
                                            <span className="text-sm font-medium text-gray-600">
                                                {imageFile
                                                    ? imageFile.name
                                                    : "Click to upload image"}
                                            </span>
                                            <span className="mt-1 text-xs text-gray-400">
                                                PNG, JPG, JPEG - max 2MB
                                            </span>
                                            <input
                                                id="businessTypeImage"
                                                type="file"
                                                accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                                onChange={handleFileChange}
                                                className="hidden"
                                            />
                                        </label>

                                        {imagePreview && (
                                            <div className="relative h-36 w-36 shrink-0 overflow-hidden rounded-lg border border-gray-200">
                                                <img
                                                    src={imagePreview}
                                                    alt="Preview"
                                                    className="h-full w-full object-cover"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setImageFile(null);
                                                        setImagePreview(null);
                                                    }}
                                                    className="absolute right-1 top-1 rounded-full bg-white/80 p-1 text-gray-600 shadow hover:bg-white hover:text-red-600"
                                                    title="Remove image"
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-4 w-4"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingId
                                                ? "Update Business Type"
                                                : "Create Business Type"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-5">
                        <h2 className="font-semibold text-gray-900">
                            All Business Types
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">
                            {businessTypes.length} business type
                            {businessTypes.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {loading ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            Loading business types...
                        </div>
                    ) : businessTypes.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No business types found.
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100">
                            {businessTypes.map((businessType) => (
                                <div
                                    key={businessType.id}
                                    className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
                                >
                                    <div className="flex items-center gap-4 min-w-0">
                                        {businessType.imageUrl ? (
                                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                                <img
                                                    src={resolveImageUrl(businessType.imageUrl)}
                                                    alt={businessType.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        ) : (
                                            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-xs text-gray-400">
                                                No img
                                            </div>
                                        )}

                                        <div className="min-w-0">
                                            <h3 className="font-medium text-gray-900">
                                                {businessType.name}
                                            </h3>

                                            <p className="mt-1 text-sm text-gray-500">
                                                {businessType.description || "No description provided."}
                                            </p>

                                            <p className="mt-2 text-xs text-gray-400">
                                                ID: {businessType.id}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <button
                                            onClick={() =>
                                                handleManageProducts(businessType)
                                            }
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Manage Products
                                        </button>

                                        <button
                                            onClick={() => handleEdit(businessType)}
                                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                        >
                                            Edit
                                        </button>

                                        <button
                                            onClick={() => handleDelete(businessType.id)}
                                            className="rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {showProducts && selectedBusinessType && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
                        <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">
                                        {selectedBusinessType.name}
                                    </h2>
                                    <p className="mt-1 text-sm text-gray-500">
                                        Manage curated products for this business type.
                                    </p>
                                </div>

                                <button
                                    onClick={() => {
                                        setShowProducts(false);
                                        setSelectedBusinessType(null);
                                        setBusinessProducts([]);
                                    }}
                                    className="text-sm text-gray-500 hover:text-gray-900"
                                >
                                    Close
                                </button>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto p-6">
                                <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <select
                                            value={selectedProductId}
                                            onChange={(e) =>
                                                setSelectedProductId(e.target.value)
                                            }
                                            className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                                        >
                                            <option value="">Select a product</option>

                                            {availableProducts.map((product) => (
                                                <option key={product.id} value={product.id}>
                                                    {product.name}
                                                </option>
                                            ))}
                                        </select>

                                        <button
                                            onClick={handleAddProduct}
                                            disabled={!selectedProductId}
                                            className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Add Product
                                        </button>
                                    </div>
                                </div>

                                {loadingProducts ? (
                                    <div className="py-10 text-center text-sm text-gray-500">
                                        Loading products...
                                    </div>
                                ) : businessProducts.length === 0 ? (
                                    <div className="rounded-lg border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
                                        No products assigned to this business type.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {businessProducts.map((product) => (
                                            <div
                                                key={product.id}
                                                className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                                            >
                                                <div>
                                                    <p className="font-medium text-gray-900">
                                                        {product.name}
                                                    </p>

                                                    {product.price !== undefined && (
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            ${product.price}
                                                        </p>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() =>
                                                        handleRemoveProduct(product.id)
                                                    }
                                                    className="rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
        </main>
    );
};

export default AdminBusinessTypes;