import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 animate-pulse">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-6">
                    <div className="h-8 w-48 rounded-lg bg-gray-200" />
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                                <div className="h-40 w-full rounded-xl bg-gray-100" />
                                <div className="h-4 w-3/4 rounded bg-gray-100" />
                                <div className="h-3 w-1/2 rounded bg-gray-100" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <Navigate
                to="/login"
                replace
                state={{ from: location }}
            />
        );
    }

    return <Outlet />;
};

export default ProtectedRoute;