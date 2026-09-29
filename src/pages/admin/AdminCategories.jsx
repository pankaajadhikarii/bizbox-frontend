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
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-semibold tracking-tight sm:text-3xl">
            Categories
          </h1>

          <p className="mt-2 max-w-2xl break-words text-sm leading-6 text-gray-600">
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
          className="w-full shrink-0 rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 sm:w-auto"
        >
          Add Category
        </button>
      </div>

      {!showForm && error && (
        <div className="mb-6 break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {showForm && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:mb-8 sm:p-6">
          <div className="mb-5 flex items-start justify-between gap-4 sm:mb-6">
            <div className="min-w-0">
              <h2 className="break-words text-lg font-semibold text-gray-900">
                {editingId ? "Edit Category" : "Add Category"}
              </h2>

              <p className="mt-1 break-words text-sm leading-5 text-gray-500">
                Enter the category information.
              </p>
            </div>

            <button
              onClick={resetForm}
              className="shrink-0 rounded-md px-2 py-1 text-sm text-gray-500 transition-colors hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid min-w-0 gap-5 md:grid-cols-2">
              <div className="min-w-0">
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Name <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Coffee Machines"
                  required
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900 sm:px-4"
                />
              </div>

              <div className="min-w-0">
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
                  className="w-full min-w-0 rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900 sm:px-4"
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {error && (
                <div className="break-words rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">
                  {error}
                </div>
              )}

              <div className="flex justify-stretch sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
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

      <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-5">
          <h2 className="break-words font-semibold text-gray-900">
            All Categories
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {categories.length} categor
            {categories.length === 1 ? "y" : "ies"}
          </p>
        </div>

        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-1/4 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </th>

                  <th className="w-36 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100 animate-pulse">
                {[...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td className="px-6 py-4">
                      <div className="h-4 w-32 rounded bg-gray-100" />
                    </td>

                    <td className="px-6 py-4">
                      <div className="h-4 w-3/4 max-w-md rounded bg-gray-100" />
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="h-8 w-14 rounded-lg bg-gray-100" />
                        <div className="h-8 w-16 rounded-lg bg-gray-100" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : categories.length === 0 ? (
          <div className="px-4 py-12 text-center text-sm text-gray-500 sm:px-6">
            No categories found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200 text-left">
                  <th className="w-1/4 px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Category
                  </th>

                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Description
                  </th>

                  <th className="w-36 px-6 py-4 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {categories.map((category) => (
                  <tr
                    key={category.id}
                    className="transition-colors hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 align-top font-medium text-gray-900">
                      <span className="break-words">
                        {category.name}
                      </span>
                    </td>

                    <td className="px-6 py-4 align-top text-sm text-gray-600">
                      <p
                        className="line-clamp-2 max-w-xl break-words"
                        title={category.description}
                      >
                        {category.description || "No description provided."}
                      </p>
                    </td>

                    <td className="px-6 py-4 align-top text-right">
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDelete(category.id)}
                          className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-offset-1"
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

export default AdminCategories;