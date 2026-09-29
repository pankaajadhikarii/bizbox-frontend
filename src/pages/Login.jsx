import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import bizkitLogo from "../assets/screen.png";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
    const { login, isAuthenticated, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState("");
    const [loading, setLoading] = useState(false);

    const fromLocation = location.state?.from;
    const from = fromLocation
        ? `${fromLocation.pathname || ""}${fromLocation.search || ""}`
        : null;

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

            const from = location.state?.from;
            const destination = from
                ? `${from.pathname || ""}${from.search || ""}`
                : isAdmin
                  ? "/admin"
                  : "/";

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
        <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-md items-center justify-center sm:min-h-[calc(100vh-6rem)]">
                <div className="w-full min-w-0">
                    <div className="mb-6 flex flex-col items-center text-center sm:mb-8">
                        <Link
                            to="/"
                            className="inline-flex items-center transition-opacity hover:opacity-80"
                            aria-label="BizBox Home"
                        >
                            <img
                                src={bizkitLogo}
                                alt="BizBox"
                                className="h-9 w-auto object-contain sm:h-10"
                            />
                        </Link>

                        <h1 className="mt-5 break-words text-2xl font-semibold tracking-tight text-gray-900 sm:mt-6 sm:text-3xl">
                            Welcome back
                        </h1>

                        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500 sm:max-w-none">
                            Sign in to continue to your account.
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
                        {serverError && (
                            <div
                                className="mb-5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm leading-6 text-red-700 sm:mb-6 sm:px-4"
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
                                    className={`w-full min-w-0 rounded-xl border px-3.5 py-3 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 sm:px-4 ${
                                        errors.email
                                            ? "border-red-400 focus:border-red-500"
                                            : "border-gray-300 focus:border-gray-900"
                                    }`}
                                />

                                {errors.email && (
                                    <p className="mt-2 break-words text-sm leading-5 text-red-600">
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

                                <div className="relative">
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={loading}
                                        placeholder="Enter your password"
                                        className={`w-full min-w-0 rounded-xl border px-3.5 py-3 pr-11 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 disabled:cursor-not-allowed disabled:bg-gray-100 sm:px-4 ${
                                            errors.password
                                                ? "border-red-400 focus:border-red-500"
                                                : "border-gray-300 focus:border-gray-900"
                                        }`}
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center text-gray-400 transition-colors hover:text-gray-600 focus:outline-none sm:right-3.5"
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>

                                {errors.password && (
                                    <p className="mt-2 break-words text-sm leading-5 text-red-600">
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="mt-6 flex w-full items-center justify-center rounded-xl bg-black px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-400 sm:mt-7"
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

                        <div className="mt-5 text-center text-sm leading-6 text-gray-500 sm:mt-6">
                            Don't have an account?{" "}
                            <Link
                                to="/register"
                                className="font-medium text-gray-900 underline underline-offset-4 hover:text-gray-600"
                            >
                                Create an account
                            </Link>
                        </div>
                    </div>

                    <p className="mx-auto mt-5 max-w-sm text-center text-xs leading-5 text-gray-400 sm:mt-6">
                        By signing in, you agree to the terms and conditions of BizBox.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;