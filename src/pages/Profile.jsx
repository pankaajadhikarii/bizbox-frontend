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
        <main className="min-h-screen bg-[#fafafa] px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
            <div className="mx-auto w-full max-w-2xl min-w-0">
                <h1 className="mb-5 break-words text-2xl font-semibold tracking-tight text-black sm:mb-6 sm:text-3xl">
                    My profile
                </h1>

                <section className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                    <div className="flex min-w-0 flex-col gap-4 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
                        <img
                            src={defaultProfileImage}
                            alt="Default profile"
                            className="h-16 w-16 shrink-0 rounded-full object-cover ring-1 ring-gray-200"
                        />

                        <div className="min-w-0">
                            <h2 className="break-words text-xl font-semibold text-black">
                                {name}
                            </h2>

                            <p className="mt-1 break-all text-sm leading-5 text-gray-500">
                                {email}
                            </p>
                        </div>
                    </div>

                    <dl className="divide-y divide-gray-200">
                        <div className="grid gap-1 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6 sm:px-5">
                            <dt className="text-sm font-medium text-gray-500">
                                Name
                            </dt>

                            <dd className="min-w-0 break-words text-sm text-gray-900">
                                {name}
                            </dd>
                        </div>

                        <div className="grid gap-1 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6 sm:px-5">
                            <dt className="text-sm font-medium text-gray-500">
                                Email
                            </dt>

                            <dd className="min-w-0 break-all text-sm text-gray-900">
                                {email}
                            </dd>
                        </div>

                        {/* <div className="grid gap-1 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6 sm:px-5">
                            <dt className="text-sm font-medium text-gray-500">
                                Address
                            </dt>
                            <dd className="min-w-0 break-words text-sm text-gray-900">
                                {address}
                            </dd>
                        </div> */}

                        <div className="grid gap-1 px-4 py-4 sm:grid-cols-[120px_minmax(0,1fr)] sm:gap-6 sm:px-5">
                            <dt className="text-sm font-medium text-gray-500">
                                Role
                            </dt>

                            <dd className="min-w-0 break-words text-sm capitalize text-gray-900">
                                {roles}
                            </dd>
                        </div>
                    </dl>
                </section>

                <Link
                    to="/"
                    className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:border-gray-400 hover:text-black sm:mt-6 sm:w-auto"
                >
                    Continue shopping
                </Link>
            </div>
        </main>
    );
};

export default Profile;