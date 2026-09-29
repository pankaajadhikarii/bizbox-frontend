import { Link, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import bizkitLogo from "../../assets/screen.png";
import defaultProfileImage from "../../assets/default-profile.png";

const adminLinks = [
    { label: "Dashboard", path: "/admin" },
    { label: "Products", path: "/admin/products" },
    { label: "Categories", path: "/admin/categories" },
    { label: "Business Types", path: "/admin/business-types" },
    { label: "Orders", path: "/admin/orders" },
];

const AdminLayout = () => {
    const location = useLocation();
    const { logout } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <header className="border-b border-gray-200 bg-white">
                <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
                    <Link
                        to="/admin"
                        aria-label="BizKit admin dashboard"
                        className="shrink-0"
                    >
                        <img
                            src={bizkitLogo}
                            alt="BizBox"
                            className="h-8 w-auto object-contain sm:h-9"
                        />
                    </Link>

                    <nav className="order-3 flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm sm:order-none sm:w-auto sm:justify-end sm:gap-x-5">
                        {adminLinks.map((link) => {
                            const isActive = location.pathname === link.path;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={`whitespace-nowrap ${
                                        isActive
                                            ? "font-medium text-black"
                                            : "text-gray-500 hover:text-black"
                                    }`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
                        <Link
                            to="/"
                            className="whitespace-nowrap text-xs text-gray-500 hover:text-black sm:text-sm"
                        >
                            View store
                        </Link>

                        <Link
                            to="/profile"
                            className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-gray-200"
                            aria-label="Open profile"
                        >
                            <img
                                src={defaultProfileImage}
                                alt="Profile"
                                className="h-full w-full object-cover"
                            />
                        </Link>

                        <button
                            type="button"
                            onClick={logout}
                            className="whitespace-nowrap text-xs text-gray-500 hover:text-black sm:text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            <Outlet />
        </div>
    );
};

export default AdminLayout;