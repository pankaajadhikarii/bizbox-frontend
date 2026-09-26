import { useEffect, useState } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";
import { resolveImageUrl } from "../../utils/imageUrl";
import { Upload } from "lucide-react";

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        stockQuantity: "",
        categoryId: "",
        isActive: true,
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [productsData, categoriesData] = await Promise.all([
                productService.getAll(),
                categoryService.getAll(),
            ]);

            setProducts(productsData);
            setCategories(categoriesData);
        } catch (err) {
            setError(err.userMessage || "Failed to load products.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            description: "",
            price: "",
            stockQuantity: "",
            categoryId: "",
            isActive: true,
        });

        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        setShowForm(false);
    };

    const openCreateForm = () => {
        setEditingId(null);

        setFormData({
            name: "",
            description: "",
            price: "",
            stockQuantity: "",
            categoryId: "",
            isActive: true,
        });

        setImageFile(null);
        setImagePreview(null);
        setError("");
        setSuccess("");
        setShowForm(true);
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

    const handleEdit = (product) => {
        setEditingId(product.id);

        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price ?? "",
            stockQuantity: product.stockQuantity ?? "",
            categoryId: product.categoryId ?? "",
            isActive: product.isActive ?? true,
        });

        setImageFile(null);
        setImagePreview(product.imageUrl ? resolveImageUrl(product.imageUrl) : null);

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name.trim()) {
            setError("Product name is required.");
            return;
        }

        if (!formData.categoryId) {
            setError("Please select a category.");
            return;
        }

        if (!formData.description.trim()) {
            setError("Description is required.");
            return;
        }

        if (formData.price === "" || Number(formData.price) < 0) {
            setError("Please enter a valid price.");
            return;
        }

        if (
            formData.stockQuantity === "" ||
            Number(formData.stockQuantity) < 0
        ) {
            setError("Please enter a valid stock quantity.");
            return;
        }

        if (!editingId && !imageFile) {
            setError("Please upload an image for this product.");
            return;
        }

        try {
            setSaving(true);

            if (editingId) {
                if (imageFile) {
                    const payload = new FormData();
                    payload.append("name", formData.name.trim());
                    payload.append("description", formData.description.trim());
                    payload.append("price", Number(formData.price));
                    payload.append("stockQuantity", Number(formData.stockQuantity));
                    payload.append("categoryId", Number(formData.categoryId));
                    payload.append("isActive", formData.isActive);
                    payload.append("image", imageFile);

                    await productService.update(editingId, payload);
                } else {
                    await productService.update(editingId, {
                        name: formData.name.trim(),
                        description: formData.description.trim(),
                        price: Number(formData.price),
                        stockQuantity: Number(formData.stockQuantity),
                        categoryId: Number(formData.categoryId),
                        isActive: formData.isActive,
                    });
                }

                setSuccess("Product updated successfully.");
            } else {
                const payload = new FormData();
                payload.append("name", formData.name.trim());
                payload.append("description", formData.description.trim());
                payload.append("price", Number(formData.price));
                payload.append("stockQuantity", Number(formData.stockQuantity));
                payload.append("categoryId", Number(formData.categoryId));
                if (imageFile) {
                    payload.append("image", imageFile);
                }

                await productService.create(payload);

                setSuccess("Product created successfully.");
            }

            await loadProductsOnly();
            resetForm();
        } catch (err) {
            setError(err.userMessage || "Failed to save product.");
        } finally {
            setSaving(false);
        }
    };

    const loadProductsOnly = async () => {
        const data = await productService.getAll();
        setProducts(data);
    };

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this product?"
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            await productService.delete(id);
            await loadProductsOnly();

            setSuccess("Product deleted successfully.");
        } catch (err) {
            setError(err.userMessage || "Failed to delete product.");
        }
    };

    const formatPrice = (price) => {
        return Number(price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    };

    return (
        <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-semibold tracking-tight">
                            Products
                        </h1>

                        <p className="mt-2 text-sm text-gray-600">
                            Manage equipment, pricing, inventory, and product status.
                        </p>
                    </div>

                    <button
                        onClick={openCreateForm}
                        className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
                    >
                        Add Product
                    </button>
                </div>

                {!showForm && error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {!showForm && success && (
                    <div className="mb-6 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        {success}
                    </div>
                )}

                {showForm && (
                    <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">
                                    {editingId ? "Edit Product" : "Add Product"}
                                </h2>

                                <p className="mt-1 text-sm text-gray-500">
                                    Enter the product information below.
                                </p>
                            </div>

                            <button
                                onClick={resetForm}
                                className="text-sm text-gray-500 transition hover:text-gray-900"
                            >
                                Cancel
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="grid gap-5 md:grid-cols-2">

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Product Name <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Commercial Coffee Machine"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Category <span className="text-red-500">*</span>
                                    </label>

                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
                                        required
                                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    >
                                        <option value="">
                                            Select category
                                        </option>

                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Description <span className="text-red-500">*</span>
                                    </label>

                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Describe the product..."
                                        required
                                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Price <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Stock Quantity <span className="text-red-500">*</span>
                                    </label>

                                    <input
                                        type="number"
                                        name="stockQuantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        required
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Product Image <span className="text-red-500">*</span>
                                    </label>

                                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                                        <label
                                            htmlFor="productImage"
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
                                                id="productImage"
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

                                {editingId && (
                                    <div className="md:col-span-2">
                                        <label className="flex cursor-pointer items-center gap-3">
                                            <input
                                                type="checkbox"
                                                name="isActive"
                                                checked={formData.isActive}
                                                onChange={handleChange}
                                                className="h-4 w-4 rounded border-gray-300"
                                            />

                                            <span className="text-sm font-medium text-gray-700">
                                                Product is active
                                            </span>
                                        </label>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 space-y-4">
                                {error && (
                                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                                        {success}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-lg bg-gray-900 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : editingId
                                                ? "Update Product"
                                                : "Create Product"}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}

                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-6 py-5">
                        <h2 className="font-semibold text-gray-900">
                            All Products
                        </h2>

                        <p className="mt-1 text-sm text-gray-500">
                            {products.length} product
                            {products.length !== 1 ? "s" : ""}
                        </p>
                    </div>

                    {loading ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            Loading products...
                        </div>
                    ) : products.length === 0 ? (
                        <div className="px-6 py-12 text-center text-sm text-gray-500">
                            No products found.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[900px]">
                                <thead className="bg-gray-50">
                                    <tr className="border-b border-gray-200 text-left">
                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Product
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Category
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Price
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Stock
                                        </th>

                                        <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Status
                                        </th>

                                        <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-gray-100">
                                    {products.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-gray-100">
                                                        {product.imageUrl ? (
                                                            <img
                                                                src={resolveImageUrl(product.imageUrl)}
                                                                alt={product.name}
                                                                className="h-full w-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                                                                No Image
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-900">
                                                            {product.name}
                                                        </p>

                                                        <p className="mt-1 max-w-xs truncate text-sm text-gray-500">
                                                            {product.description ||
                                                                "No description"}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {product.categoryName || "—"}
                                            </td>

                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                {formatPrice(product.price)}
                                            </td>

                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {product.stockQuantity}
                                            </td>

                                            <td className="px-6 py-4">
                                                {product.isActive ? (
                                                    <span className="inline-flex rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => handleEdit(product)}
                                                        className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(product.id)
                                                        }
                                                        className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
        </main>
    );
};

export default AdminProducts;