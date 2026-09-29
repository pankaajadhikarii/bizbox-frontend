import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import bizkitLogo from "../../assets/screen.png";
import defaultProfileImage from "../../assets/default-profile.png";
import businessTypeService from "../../services/businessTypeService";
import { resolveImageUrl } from "../../utils/imageUrl";
import { Menu, X, ShoppingCart, Store } from "lucide-react";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated, isAdmin, logout } = useAuth();
    const { cartCount } = useCart();

    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const searchContainerRef = useRef(null);
    const mobileMenuRef = useRef(null);

    const handleHomeClick = () => {
        navigate("/");
        setMobileMenuOpen(false);
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

            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target)
            ) {
                setMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        setMobileMenuOpen(false);
    }, [location.pathname, location.search]);

    const handleSearch = (event) => {
        event.preventDefault();

        const query = searchTerm.trim();

        setShowSuggestions(false);
        setMobileMenuOpen(false);

        navigate(
            query
                ? `/business-types?search=${encodeURIComponent(query)}`
                : "/business-types"
        );
    };

    const handleSuggestionClick = (businessType) => {
        setSearchTerm("");
        setShowSuggestions(false);
        setMobileMenuOpen(false);

        navigate(
            `/business-types?search=${encodeURIComponent(
                businessType.name
            )}`
        );
    };

    return (
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
            <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                {/* Logo */}
                <button
                    type="button"
                    onClick={handleHomeClick}
                    className="flex shrink-0 items-center"
                    aria-label="Go to Home"
                >
                    <img
                        src={bizkitLogo}
                        alt="BizBox"
                        className="h-10 w-auto object-contain"
                    />
                </button>

                {/* Desktop Navigation */}
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

                    {/* Desktop Search */}
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
                                            const imageUrl =
                                                resolveImageUrl(
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
                                                            {
                                                                businessType.name
                                                            }
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

                {/* Desktop Right Actions */}
                <div className="hidden items-center gap-2 md:flex">
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
                                <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white shadow-xs">
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

                {/* Mobile Actions */}
                <div
                    ref={mobileMenuRef}
                    className="relative flex items-center gap-1 md:hidden"
                >
                    {!isAdmin && (
                        <Link
                            to="/cart"
                            className="relative flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black"
                            aria-label={`Shopping cart with ${cartCount} items`}
                        >
                            <ShoppingCart className="h-5 w-5" />

                            {cartCount > 0 && (
                                <span className="absolute right-0.5 top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-black px-1 text-[10px] font-bold leading-none text-white">
                                    {cartCount > 99 ? "99+" : cartCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {isAuthenticated && (
                        <Link
                            to="/profile"
                            className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-gray-100"
                            aria-label="Open profile"
                        >
                            <img
                                src={defaultProfileImage}
                                alt="Open profile"
                                className="h-full w-full object-cover"
                            />
                        </Link>
                    )}

                    <button
                        type="button"
                        onClick={() =>
                            setMobileMenuOpen((current) => !current)
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 hover:text-black"
                        aria-label={
                            mobileMenuOpen
                                ? "Close menu"
                                : "Open menu"
                        }
                        aria-expanded={mobileMenuOpen}
                    >
                        {mobileMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>

                    {/* Mobile Menu */}
                    {mobileMenuOpen && (
                        <div className="absolute right-0 top-12 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
                            <div className="p-4">
                                {/* Mobile Search */}
                                <div
                                    ref={searchContainerRef}
                                    className="relative"
                                >
                                    <form
                                        onSubmit={handleSearch}
                                        className="relative"
                                    >
                                        <label
                                            className="sr-only"
                                            htmlFor="mobile-navbar-search"
                                        >
                                            Search business
                                        </label>

                                        <input
                                            id="mobile-navbar-search"
                                            type="search"
                                            value={searchTerm}
                                            onChange={(event) => {
                                                setSearchTerm(
                                                    event.target.value
                                                );
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => {
                                                if (
                                                    searchTerm.trim()
                                                ) {
                                                    setShowSuggestions(
                                                        true
                                                    );
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

                                    {showSuggestions &&
                                        searchTerm.trim() && (
                                            <div className="absolute left-0 right-0 top-12 z-10 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
                                                {searchLoading ? (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                        Searching...
                                                    </div>
                                                ) : suggestions.length >
                                                  0 ? (
                                                    <div className="py-1">
                                                        {suggestions.map(
                                                            (
                                                                businessType
                                                            ) => {
                                                                const imageUrl =
                                                                    resolveImageUrl(
                                                                        businessType.imageUrl
                                                                    );

                                                                return (
                                                                    <button
                                                                        key={
                                                                            businessType.id
                                                                        }
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
                                                                                    src={
                                                                                        imageUrl
                                                                                    }
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
                                                                                {
                                                                                    businessType.name
                                                                                }
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
                                                            }
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div className="px-4 py-3 text-sm text-gray-500">
                                                        No business types
                                                        found.
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                </div>

                                {/* Mobile Navigation */}
                                <nav className="mt-4 border-t border-gray-100 pt-3">
                                    <button
                                        type="button"
                                        onClick={handleHomeClick}
                                        className={`block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium ${
                                            location.pathname === "/"
                                                ? "bg-gray-100 text-black"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                        }`}
                                    >
                                        Home
                                    </button>

                                    <Link
                                        to="/equipment"
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                                            location.pathname ===
                                            "/equipment"
                                                ? "bg-gray-100 text-black"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                        }`}
                                    >
                                        Equipment
                                    </Link>

                                    <Link
                                        to="/business-types"
                                        onClick={() =>
                                            setMobileMenuOpen(false)
                                        }
                                        className={`block rounded-lg px-3 py-2.5 text-sm font-medium ${
                                            location.pathname ===
                                            "/business-types"
                                                ? "bg-gray-100 text-black"
                                                : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                        }`}
                                    >
                                        Business Types
                                    </Link>
                                </nav>

                                {/* Mobile User Actions */}
                                <div className="mt-3 border-t border-gray-100 pt-3">
                                    {!isAdmin && (
                                        <Link
                                            to="/resale"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${
                                                location.pathname.startsWith(
                                                    "/resale"
                                                )
                                                    ? "bg-gray-100 text-black"
                                                    : "text-gray-600 hover:bg-gray-50 hover:text-black"
                                            }`}
                                        >
                                            <Store className="h-5 w-5" />
                                            Resale Marketplace
                                        </Link>
                                    )}

                                    {!isAdmin && (
                                        <Link
                                            to="/cart"
                                            onClick={() =>
                                                setMobileMenuOpen(false)
                                            }
                                            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                                        >
                                            <ShoppingCart className="h-5 w-5" />
                                            Cart
                                            {cartCount > 0 && (
                                                <span className="ml-auto rounded-full bg-black px-2 py-0.5 text-[10px] font-bold text-white">
                                                    {cartCount > 99
                                                        ? "99+"
                                                        : cartCount}
                                                </span>
                                            )}
                                        </Link>
                                    )}

                                    {!isAuthenticated ? (
                                        <div className="mt-2 grid grid-cols-2 gap-2">
                                            <Link
                                                to="/login"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className="rounded-lg border border-gray-200 px-3 py-2.5 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
                                            >
                                                Sign In
                                            </Link>

                                            <Link
                                                to="/register"
                                                onClick={() =>
                                                    setMobileMenuOpen(false)
                                                }
                                                className="rounded-lg bg-black px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-800"
                                            >
                                                Register
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="mt-2">
                                            {isAdmin ? (
                                                <Link
                                                    to="/admin"
                                                    onClick={() =>
                                                        setMobileMenuOpen(
                                                            false
                                                        )
                                                    }
                                                    className="block rounded-lg bg-black px-3 py-2.5 text-center text-sm font-medium text-white hover:bg-gray-800"
                                                >
                                                    Dashboard
                                                </Link>
                                            ) : (
                                                <Link
                                                    to="/orders"
                                                    onClick={() =>
                                                        setMobileMenuOpen(
                                                            false
                                                        )
                                                    }
                                                    className="block rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                                                >
                                                    Orders
                                                </Link>
                                            )}

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setMobileMenuOpen(false);
                                                    logout();
                                                }}
                                                className="mt-1 block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-black"
                                            >
                                                Logout
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;