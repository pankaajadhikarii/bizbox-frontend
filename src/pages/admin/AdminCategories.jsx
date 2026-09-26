import { useEffect, useState } from "react";
import categoryService from "../../services/categoryService";

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.userMessage || "Failed to load categories.");
    } finally {
      setLoading(false);
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

    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Category name is required.");
      return;
    }

    if (!formData.description.trim()) {
      setError("Category description is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim(),
      };

      if (editingId) {
        await categoryService.update(editingId, data);
      } else {
        await categoryService.create(data);
      }

      await loadCategories();
      resetForm();
    } catch (err) {
      setError(err.userMessage || "Failed to save category.");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (category) => {
    setEditingId(category.id);

    setFormData({
      name: category.name || "",
      description: category.description || "",
    });

    setShowForm(true);
    setError("");
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this category?",
    );

    if (!confirmed) return;

    try {
      setError("");

      await categoryService.delete(id);
      await loadCategories();
    } catch (err) {
      setError(err.userMessage || "Failed to delete category.");
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>

          <p className="mt-2 text-sm text-gray-600">
            Manage equipment categories used across the platform.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingId(null);

            setFormData({
              name: "",
              description: "",
            });

            setShowForm(true);
            setError("");
          }}
          className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800"
        >
          Add Category
        </button>
      </div>

      {!showForm && error && (
        <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Enter the category information.
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
                  Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Coffee Machines"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Description <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Category description"
                  required
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-gray-900"
                />
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
                      ? "Update Category"
                      : "Create Category"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-6 py-5">
          <h2 className="font-semibold text-gray-900">All Categories</h2>

          <p className="mt-1 text-sm text-gray-500">
            {categories.length} categor
            {categories.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-gray-500">
            No categories found.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {categories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col gap-5 px-6 py-5 lg:flex-row lg:items-center lg:justify-between"
              >
                <div>
                  <h3 className="font-medium text-gray-900">{category.name}</h3>

                  <p className="mt-1 text-sm text-gray-500">
                    {category.description || "No description provided."}
                  </p>

                  <p className="mt-2 text-xs text-gray-400">
                    ID: {category.id}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(category.id)}
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
    </main>
  );
};

export default AdminCategories;
