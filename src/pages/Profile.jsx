import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultProfileImage from "../assets/default-profile.png";

const Profile = () => {
    const { user } = useAuth();

    const name = user?.fullName || user?.name || "User";
    const email = user?.email || "Not provided";
    const address =
        user?.address ||
        user?.shippingAddress ||
        user?.location ||
        "Not provided";
    const roles = Array.isArray(user?.roles)
        ? user.roles.join(", ")
        : user?.role || "Customer";

    return (
        <main className="bg-[#fafafa] px-5 py-8 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl">
                <h1 className="mb-6 text-2xl font-semibold tracking-tight text-black">
                    My profile
                </h1>

                <section className="overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="flex items-center gap-4 border-b border-gray-200 p-5">
                        <img
                            src={defaultProfileImage}
                            alt="Default profile"
                            className="h-16 w-16 rounded-full object-cover ring-1 ring-gray-200"
                        />

                        <div>
                            <h2 className="text-xl font-semibold text-black">{name}</h2>
                            <p className="mt-1 text-sm text-gray-500">{email}</p>
                        </div>
                    </div>

                    <dl className="divide-y divide-gray-200">
                        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Name
                            </dt>
                            <dd className="text-sm text-gray-900">{name}</dd>
                        </div>

                        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Email
                            </dt>
                            <dd className="break-all text-sm text-gray-900">
                                {email}
                            </dd>
                        </div>

                        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Address
                            </dt>
                            <dd className="text-sm text-gray-900">{address}</dd>
                        </div>

                        <div className="grid gap-1 px-5 py-4 sm:grid-cols-[120px_1fr] sm:gap-6">
                            <dt className="text-sm font-medium text-gray-500">
                                Role
                            </dt>
                            <dd className="text-sm capitalize text-gray-900">
                                {roles}
                            </dd>
                        </div>
                    </dl>
                </section>

                <Link
                    to="/"
                    className="mt-6 inline-flex rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-black"
                >
                    Continue shopping
                </Link>
            </div>
        </main>
    );
};

export default Profile;
