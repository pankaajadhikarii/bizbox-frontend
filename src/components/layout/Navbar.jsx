import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import bizkitLogo from "../../assets/screen.png";
import defaultProfileImage from "../../assets/default-profile.png";
import businessTypeService from "../../services/businessTypeService";
import { resolveImageUrl } from "../../utils/imageUrl";
import { ShoppingCart, Store } from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount } = useCart();

    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);

    const searchContainerRef = useRef(null);

    const handleHomeClick = () => {
        navigate("/");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    useEffect(() => {
        const query = searchTerm.trim();

        if (!query) {
            setSuggestions([]);
            setShowSuggestions(false);
            setSearchLoading(false);
            return;
        }

        const timeoutId = setTimeout(async () => {
            try {
                setSearchLoading(true);

                const data = await businessTypeService.getAll(query);

                setSuggestions(
                    Array.isArray(data) ? data.slice(0, 5) : []
                );

                setShowSuggestions(true);
            } catch (error) {
                setSuggestions([]);
                setShowSuggestions(true);
            } finally {
                setSearchLoading(false);
            }
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleSearch = (event) => {
        event.preventDefault();

        const query = searchTerm.trim();

        setShowSuggestions(false);

        navigate(
            query
                ? `/business-types?search=${encodeURIComponent(query)}`
                : "/business-types"
        );
    };

    const handleSuggestionClick = (businessType) => {
        setSearchTerm(businessType.name);
        setShowSuggestions(false);

        navigate(
            `/business-types?search=${encodeURIComponent(
                businessType.name
            )}`
        );
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
                            className={`text-sm font-medium ${
                                location.pathname === "/"
                                    ? "text-black"
                                    : "text-gray-600 hover:text-black"
                            }`}
                        >
                            Home
                        </button>

                        <Link
                            to="/equipment"
                            className={`text-sm font-medium ${
                                location.pathname === "/equipment"
                                    ? "text-black"
                                    : "text-gray-600 hover:text-black"
                            }`}
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/business-types"
                            className={`text-sm font-medium ${
                                location.pathname === "/business-types"
                                    ? "text-black"
                                    : "text-gray-600 hover:text-black"
                            }`}
                        >
                            Business Types
                        </Link>
                    </nav>

                    <div
                        ref={searchContainerRef}
                        className="relative ml-auto w-full max-w-xs"
                    >
                        <form
                            onSubmit={handleSearch}
                            className="relative"
                        >
                            <label
                                className="sr-only"
                                htmlFor="navbar-search"
                            >
                                Search business
                            </label>

                            <input
                                id="navbar-search"
                                type="search"
                                value={searchTerm}
                                onChange={(event) => {
                                    setSearchTerm(event.target.value);
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => {
                                    if (searchTerm.trim()) {
                                        setShowSuggestions(true);
                                    }
                                }}
                                placeholder="Search business"
                                autoComplete="off"
                                className="h-10 w-full rounded-lg border border-gray-300 bg-gray-50 px-3 pr-20 text-sm text-black outline-none placeholder:text-gray-400 focus:border-black focus:bg-white"
                            />

                            <button
                                type="submit"
                                className="absolute right-1 top-1 h-8 rounded-md bg-black px-3 text-xs font-medium text-white transition-colors hover:bg-gray-800"
                            >
                                Search
                            </button>
                        </form>

                        {showSuggestions && searchTerm.trim() && (
                            <div className="absolute left-0 right-0 top-12 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                {searchLoading ? (
                                    <div className="px-4 py-3 text-sm text-gray-500">
                                        Searching...
                                    </div>
                                ) : suggestions.length > 0 ? (
                                    <div className="py-1">
                                        {suggestions.map((businessType) => {
                                            const imageUrl = resolveImageUrl(
                                                businessType.imageUrl
                                            );

                                            return (
                                                <button
                                                    key={businessType.id}
                                                    type="button"
                                                    onClick={() =>
                                                        handleSuggestionClick(
                                                            businessType
                                                        )
                                                    }
                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-gray-50"
                                                >
                                                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-gray-100">
                                                        {imageUrl && (
                                                            <img
                                                                src={imageUrl}
                                                                alt=""
                                                                className="h-full w-full object-cover"
                                                                onError={(
                                                                    event
                                                                ) => {
                                                                    event.currentTarget.style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <p className="truncate text-sm font-medium text-black">
                                                            {businessType.name}
                                                        </p>

                                                        {businessType.description && (
                                                            <p className="truncate text-xs text-gray-500">
                                                                {
                                                                    businessType.description
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="px-4 py-3 text-sm text-gray-500">
                                        No business types found.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isAdmin && (
                        <Link
                            to="/resale"
                            className={`relative flex items-center justify-center rounded-lg p-2 transition-colors hover:bg-gray-100 ${
                                location.pathname.startsWith("/resale")
                                    ? "text-black"
                                    : "text-gray-600 hover:text-black"
                            }`}
                            aria-label="Resale marketplace"
                            title="Resale Marketplace"
                        >
                            <Store className="h-5 w-5" />
                        </Link>
                    )}

                    {!isAdmin && (
                        <Link
                            to="/cart"
                            className="relative flex items-center justify-center rounded-lg p-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-black"
                            aria-label={`Shopping cart with ${cartCount} items`}
                        >
                            <ShoppingCart className="h-5 w-5" />

                            {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white shadow-xs">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
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