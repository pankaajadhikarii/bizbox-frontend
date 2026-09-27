import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const AdminRoute = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 animate-pulse">
                {/* Top header skeleton matching AdminLayout */}
                <div className="border-b border-gray-200 bg-white">
                    <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
                        <div className="h-8 w-24 rounded bg-gray-100" />
                        <div className="hidden sm:flex gap-6">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 w-16 rounded bg-gray-100" />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-4 w-16 rounded bg-gray-100" />
                            <div className="h-8 w-8 rounded-full bg-gray-100" />
                        </div>
                    </div>
                </div>

                {/* Main content skeleton */}
                <div className="mx-auto max-w-7xl px-5 py-8 sm:px-6 lg:px-8 space-y-6">
                    <div className="h-8 w-48 rounded-lg bg-gray-200" />
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 bg-white p-5 space-y-3">
                                <div className="h-3 w-20 rounded bg-gray-100" />
                                <div className="h-7 w-12 rounded bg-gray-100" />
                            </div>
                        ))}
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="h-4 w-24 rounded bg-gray-100" />
                                <div className="h-4 w-32 rounded bg-gray-100" />
                                <div className="h-4 w-20 rounded bg-gray-100" />
                                <div className="ml-auto h-4 w-16 rounded bg-gray-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;