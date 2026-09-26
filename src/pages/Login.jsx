import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const { login, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const from = location.state?.from?.pathname || null;

    if (isAuthenticated) {
        if (from) {
            return <Navigate to={from} replace />;
        }

        return (
            <Navigate
                to={isAdmin ? "/admin" : "/"}
                replace
            />
        );
    }

    const validate = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = "Email is required.";
        } else if (
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())
        ) {
            newErrors.email = "Please enter a valid email address.";
        }

        if (!formData.password) {
            newErrors.password = "Password is required.";
        }

        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value,
        }));

        setErrors((previous) => ({
            ...previous,
            [name]: "",
        }));

        setServerError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setLoading(true);
            setServerError("");

            await login(
                formData.email.trim(),
                formData.password
            );

            const destination =
                location.state?.from?.pathname ||
                (isAdmin ? "/admin" : "/");

            navigate(destination, { replace: true });
        } catch (error) {
            setServerError(
                error.userMessage ||
                error.response?.data?.message ||
                error.response?.data?.title ||
                "Invalid email or password."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-md items-center justify-center">
                <div className="w-full">
                    <div className="mb-8 text-center">
                        <Link
                            to="/"
                            className="text-2xl font-semibold tracking-tight text-gray-900"
                        >
                            BizBox
                        </Link>

                        <h1 className="mt-8 text-3xl font-semibold tracking-tight text-gray-900">
                            Welcome back
                        </h1>

                        <p className="mt-2 text-sm text-gray-500">
                            Sign in to continue to your account.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                        {serverError && (
                            <div
                                className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                                role="alert"
                            >
                                {serverError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} noValidate>
                            <div>
                                <label
                                    htmlFor="email"
                                    className="mb-2 block text-sm font-medium text-gray-900"
                                >
                                    Email
                                </label>

                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="you@example.com"
                                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${errors.email
                                            ? "border-red-400 focus:border-red-500"
                                            : "border-gray-300 focus:border-gray-900"
                                        }`}
                                />

                                {errors.email && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div className="mt-5">
                                <label
                                    htmlFor="password"
                                    className="mb-2 block text-sm font-medium text-gray-900"
                                >
                                    Password
                                </label>

                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    disabled={loading}
                                    placeholder="Enter your password"
                                    className={`w-full rounded-xl border px-4 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 ${errors.password
                                            ? "border-red-400 focus:border-red-500"
                                            : "border-gray-300 focus:border-gray-900"
                                        }`}
                                />

                                {errors.password && (
                                    <p className="mt-2 text-sm text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-7 flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400"
                            >
                                {loading ? (
                                    <>
                                        <svg
                                            className="mr-2 h-4 w-4 animate-spin"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            />

                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            />
                                        </svg>

                                        Signing in...
                                    </>
                                ) : (
                                    "Sign In"
                                )}
                            </button>
                        </form>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-xs text-gray-400">
                        By signing in, you agree to the terms and conditions of BizBox.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;