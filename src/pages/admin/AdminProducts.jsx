import { useEffect, useState } from "react";
import productService from "../../services/productService";
import categoryService from "../../services/categoryService";

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
        imageUrl: "",
        isActive: true,
    });

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
            imageUrl: "",
            isActive: true,
        });

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
            imageUrl: "",
            isActive: true,
        });

        setError("");
        setSuccess("");
        setShowForm(true);
    };

    const handleEdit = (product) => {
        setEditingId(product.id);

        setFormData({
            name: product.name || "",
            description: product.description || "",
            price: product.price ?? "",
            stockQuantity: product.stockQuantity ?? "",
            categoryId: product.categoryId ?? "",
            imageUrl: product.imageUrl || "",
            isActive: product.isActive ?? true,
        });

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

        try {
            setSaving(true);

            const productData = {
                name: formData.name.trim(),
                description: formData.description.trim() || null,
                price: Number(formData.price),
                stockQuantity: Number(formData.stockQuantity),
                categoryId: Number(formData.categoryId),
                imageUrl: formData.imageUrl.trim() || null,
            };

            if (editingId) {
                await productService.update(editingId, {
                    ...productData,
                    isActive: formData.isActive,
                });

                setSuccess("Product updated successfully.");
            } else {
                await productService.create(productData);

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
        <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">

                <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-500">
                            Admin
                        </p>

                        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">
                            Products
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
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

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        {error}
                    </div>
                )}

                {success && (
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
                                        Product Name
                                    </label>

                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Commercial Coffee Machine"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Category
                                    </label>

                                    <select
                                        name="categoryId"
                                        value={formData.categoryId}
                                        onChange={handleChange}
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
                                        Description
                                    </label>

                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows="4"
                                        placeholder="Describe the product..."
                                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Price
                                    </label>

                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Stock Quantity
                                    </label>

                                    <input
                                        type="number"
                                        name="stockQuantity"
                                        value={formData.stockQuantity}
                                        onChange={handleChange}
                                        min="0"
                                        step="1"
                                        placeholder="0"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Image URL
                                    </label>

                                    <input
                                        type="url"
                                        name="imageUrl"
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        placeholder="https://example.com/product.jpg"
                                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                                    />
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

                            <div className="mt-6 flex justify-end">
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
                                                                src={product.imageUrl}
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

            </div>
        </div>
    );
};

export default AdminProducts;