import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bizkitLogo from "../../assets/screen.png";
import defaultProfileImage from "../../assets/default-profile.png";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const [searchTerm, setSearchTerm] = useState("");

    const handleHomeClick = () => {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleSearch = (event) => {
        event.preventDefault();

        const query = searchTerm.trim();
        navigate(query ? `/equipment?search=${encodeURIComponent(query)}` : "/equipment");
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={handleHomeClick}
                    className="flex items-center"
                    aria-label="Go to Home"
                >
                    <img
                        src={bizkitLogo}
                        alt="BizBox"
                        className="h-10 w-auto object-contain"
                    />
                </button>

                <div className="hidden flex-1 items-center gap-6 px-8 md:flex">
                    <nav className="flex items-center gap-6">
                        <button
                            type="button"
                            onClick={handleHomeClick}
                            className={`text-sm font-medium ${location.pathname === "/"
                                ? "text-black"
                                : "text-gray-600 hover:text-black"
                                }`}
                        >
                            Home
                        </button>

                        <Link
                            to="/equipment"
                            className={`text-sm font-medium ${location.pathname === "/equipment"
                                ? "text-black"
                                : "text-gray-600 hover:text-black"
                                }`}
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/business-types"
                            className={`text-sm font-medium ${location.pathname === "/business-types"
                                ? "text-black"
                                : "text-gray-600 hover:text-black"
                                }`}
                        >
                            Business Types
                        </Link>
                    </nav>

                    <form
                        onSubmit={handleSearch}
                        className="relative ml-auto w-full max-w-xs"
                    >
                        <label className="sr-only" htmlFor="navbar-search">
                            Search equipment
                        </label>

                        <input
                            id="navbar-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) =>
                                setSearchTerm(event.target.value)
                            }
                            placeholder="Search equipment"
                            className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 pr-20 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:bg-white"
                        />

                        <button
                            type="submit"
                            className="absolute right-1 top-1 h-8 rounded-md bg-black px-3 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                        >
                            Search
                        </button>
                    </form>
                </div>

                <div className="flex items-center gap-2">
                    {!isAdmin && (
                        <Link
                            to="/cart"
                            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
                        >
                            Cart
                        </Link>
                    )}

                    {!isAuthenticated ? (
                        <div className="hidden items-center gap-2 sm:flex">
                            <Link
                                to="/login"
                                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
                            >
                                Sign In
                            </Link>

                            <Link
                                to="/register"
                                className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                            >
                                Register
                            </Link>
                        </div>
                    ) : (
                        <div className="hidden items-center gap-2 sm:flex">
                            {isAdmin ? (
                                <Link
                                    to="/admin"
                                    className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <Link
                                    to="/orders"
                                    className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
                                >
                                    Orders
                                </Link>
                            )}

                            <button
                                type="button"
                                onClick={logout}
                                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
                            >
                                Logout
                            </button>
                        </div>
                    )}

                    {isAuthenticated && (
                        <Link
                            to="/profile"
                            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gray-100 transition-opacity hover:opacity-80"
                            aria-label="Open profile"
                        >
                            <img
                                src={defaultProfileImage}
                                alt="Open profile"
                                className="h-full w-full object-cover"
                            />
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
