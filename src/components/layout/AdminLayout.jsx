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
                <div className="mx-auto flex min-h-16 max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-3 sm:px-6 lg:px-8">
                    <Link to="/admin" aria-label="BizKit admin dashboard">
                        <img
                            src={bizkitLogo}
                            alt="BizBox"
                            className="h-9 w-auto object-contain"
                        />
                    </Link>

                    <nav className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                        {adminLinks.map((link) => {
                            const isActive = location.pathname === link.path;

                            return (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={isActive ? "font-medium text-black" : "text-gray-500 hover:text-black"}
                                >
                                    {link.label}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className="text-sm text-gray-500 hover:text-black"
                        >
                            View store
                        </Link>

                        <Link
                            to="/profile"
                            className="h-8 w-8 overflow-hidden rounded-full border border-gray-200"
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
                            className="text-sm text-gray-500 hover:text-black"
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
