import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bizkitLogo from "../../assets/screen.png";

const Footer = () => {
    const { isAuthenticated, isAdmin } = useAuth();

    const handleHomeClick = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    return (
        <footer className="border-t border-gray-200 bg-[#fafafa]">
            <div className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <Link to="/" onClick={handleHomeClick}>
                            <img
                                src={bizkitLogo}
                                alt="BizKit"
                                className="h-9 w-auto object-contain"
                            />
                        </Link>

                        <p className="mt-3 max-w-xs text-sm leading-6 text-gray-500">
                            Commercial equipment for growing businesses.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-gray-600">
                        <Link
                            to="/"
                            onClick={handleHomeClick}
                            className="transition-colors hover:text-black"
                        >
                            Home
                        </Link>

                        <Link
                            to="/equipment"
                            className="transition-colors hover:text-black"
                        >
                            Equipment
                        </Link>

                        <Link
                            to="/business-types"
                            className="transition-colors hover:text-black"
                        >
                            Business Types
                        </Link>

                        {!isAuthenticated && (
                            <>
                                <Link
                                    to="/login"
                                    className="transition-colors hover:text-black"
                                >
                                    Sign In
                                </Link>

                                <Link
                                    to="/register"
                                    className="transition-colors hover:text-black"
                                >
                                    Register
                                </Link>
                            </>
                        )}

                        {isAuthenticated && !isAdmin && (
                            <>
                                <Link
                                    to="/orders"
                                    className="transition-colors hover:text-black"
                                >
                                    Orders
                                </Link>

                                <Link
                                    to="/cart"
                                    className="transition-colors hover:text-black"
                                >
                                    Cart
                                </Link>
                            </>
                        )}

                        {isAdmin && (
                            <Link
                                to="/admin"
                                className="transition-colors hover:text-black"
                            >
                                Admin Dashboard
                            </Link>
                        )}
                    </div>
                </div>

                <div className="mt-8 border-t border-gray-200 pt-6 text-xs text-gray-500">
                    © 2026 BizKit
                </div>
            </div>
        </footer>
    );
};

export default Footer;
