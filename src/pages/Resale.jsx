import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Tag,
    PlusCircle,
    ListOrdered,
    Store,
    Pencil,
    Trash2,
    CheckCircle,
    XCircle,
    Clock,
    Upload,
    X,
    ArrowRight,
    ShoppingBag,
    User,
    Mail,
    MapPin,
} from "lucide-react";
import resaleService from "../services/resaleService";
import { useAuth } from "../context/AuthContext";
import { resolveImageUrl } from "../utils/imageUrl";

// ─── Enums ────────────────────────────────────────────────────────────────────
const ResaleCondition = { LikeNew: 0, Good: 1, Fair: 2 };
const ResaleListingStatus = { Active: 0, Sold: 1, Removed: 2 };

const CONDITION_LABELS = { 0: "Like New", 1: "Good", 2: "Fair" };
const STATUS_LABELS = { 0: "Active", 1: "Order Placed", 2: "Removed" };

// ─── Helpers ──────────────────────────────────────────────────────────────────
const formatCurrency = (amount) => {
    const value = Number(amount);
    if (Number.isNaN(value)) return "Rs. 0.00";
    return `Rs. ${value.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const resolveImg = (url) => resolveImageUrl(url) || "";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Skeleton card used while loading */
const SkeletonCard = () => (
    <div className="animate-pulse overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="aspect-[4/3] bg-gray-100" />
        <div className="space-y-2.5 p-3.5">
            <div className="h-3 w-16 rounded bg-gray-100" />
            <div className="h-4 w-32 rounded bg-gray-100" />
            <div className="h-3 w-full rounded bg-gray-100" />
            <div className="h-3 w-3/4 rounded bg-gray-100" />
            <div className="h-8 w-full rounded-lg bg-gray-100" />
        </div>
    </div>
);

/** Public listing card */
const ListingCard = ({ listing }) => {
    const id = listing.id;
    const name = listing.productName || "Equipment";
    const desc = listing.description || "Previously owned business equipment.";
    const img = resolveImg(listing.imageUrl);
    const seller = listing.sellerName || "BizBox User";
    const price = listing.price ?? 0;
    const condition = CONDITION_LABELS[listing.condition] ?? "Good";

    return (
        <article className="flex flex-col justify-between overflow-hidden rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors">
            <div>
                <Link to={`/resale/${id}`} className="block overflow-hidden">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                        {img ? (
                            <img
                                src={img}
                                alt={name}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                }}
                            />
                        ) : (
                            <ShoppingBag className="h-8 w-8 text-gray-300 stroke-[1.5]" />
                        )}
                    </div>
                </Link>

                <div className="p-3.5">
                    <div className="flex items-center justify-between gap-1.5">
                        <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-600">
                            {condition}
                        </span>
                        <span className="text-[10px] text-gray-400">Pre-owned</span>
                    </div>

                    <Link to={`/resale/${id}`} className="mt-2 block">
                        <h3 className="line-clamp-1 text-sm font-semibold tracking-tight text-gray-900 transition-colors hover:text-gray-600">
                            {name}
                        </h3>
                    </Link>

                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-gray-500">{desc}</p>

                    <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                            <p className="text-[10px] text-gray-400">Listed by</p>
                            <p className="truncate text-xs font-medium text-gray-700">{seller}</p>
                        </div>
                        <p className="shrink-0 text-sm font-bold text-gray-900">{formatCurrency(price)}</p>
                    </div>
                </div>
            </div>

            <div className="px-3.5 pb-3.5">
                <Link
                    to={`/resale/${id}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-gray-900 py-2 text-xs font-medium text-white transition hover:bg-black"
                >
                    View Listing <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </article>
    );
};

/** Status badge for My Listings */
const StatusBadge = ({ status }) => {
    const configs = {
        0: { icon: CheckCircle, label: "Active", cls: "bg-emerald-50 text-emerald-700" },
        1: { icon: ShoppingBag, label: "Order Placed", cls: "bg-blue-50 text-blue-700" },
        2: { icon: XCircle, label: "Removed", cls: "bg-red-50 text-red-700" },
    };
    const cfg = configs[status] ?? { icon: Clock, label: "Unknown", cls: "bg-gray-100 text-gray-600" };
    const Icon = cfg.icon;
    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${cfg.cls}`}>
            <Icon className="h-3.5 w-3.5" />
            {cfg.label}
        </span>
    );
};

/** My listing row card */
const MyListingCard = ({ listing, onEdit, onDelete }) => {
    const [showBuyerInfo, setShowBuyerInfo] = useState(false);
    const name = listing.productName || "Equipment";
    const img = resolveImg(listing.imageUrl);
    const price = listing.price ?? 0;
    const condition = CONDITION_LABELS[listing.condition] ?? "—";
    const isActive = listing.status === ResaleListingStatus.Active;
    const isSold = listing.status === ResaleListingStatus.Sold;

    const buyerName = listing.buyerName || listing.buyer?.name || listing.buyerFullName;
    const buyerEmail = listing.buyerEmail || listing.buyer?.email;
    const shippingAddress = listing.shippingAddress || listing.buyerAddress || listing.deliveryAddress;

    return (
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition hover:border-gray-300 hover:shadow-sm sm:p-5">
            <div className="flex gap-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100 flex items-center justify-center sm:h-24 sm:w-24">
                    {img ? (
                        <img
                            src={img}
                            alt={name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = "none";
                            }}
                        />
                    ) : (
                        <ShoppingBag className="h-6 w-6 text-gray-300 stroke-[1.5]" />
                    )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                            <h3 className="truncate font-semibold text-gray-900">{name}</h3>
                            <p className="mt-0.5 text-sm text-gray-500">Condition: {condition}</p>
                        </div>
                        <StatusBadge status={listing.status} />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-lg font-bold text-gray-900">{formatCurrency(price)}</p>

                        {isActive && (
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => onEdit(listing)}
                                    className="flex items-center gap-1.5 rounded-lg border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                                >
                                    <Pencil className="h-3.5 w-3.5" /> Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDelete(listing)}
                                    className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-medium text-red-600 transition hover:bg-red-50"
                                >
                                    <Trash2 className="h-3.5 w-3.5" /> Remove
                                </button>
                            </div>
                        )}

                        {isSold && (
                            <button
                                type="button"
                                onClick={() => setShowBuyerInfo((prev) => !prev)}
                                className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-medium text-blue-700 transition hover:bg-blue-100"
                            >
                                <User className="h-3.5 w-3.5" />
                                {showBuyerInfo ? "Hide Buyer Info" : "View Buyer Info"}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Buyer & Shipping Info Drawer for Sold Listings */}
            {isSold && showBuyerInfo && (
                <div className="border-t border-gray-100 pt-3 mt-1">
                    <div className="rounded-xl border border-blue-100 bg-blue-50/40 p-3.5 text-xs">
                        <p className="font-semibold text-blue-950 flex items-center gap-1.5 mb-2.5">
                            <User className="h-3.5 w-3.5 text-blue-700" /> Buyer & Delivery Details
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Buyer Name</span>
                                    <span className="font-medium text-gray-900">{buyerName || "Customer"}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Buyer Email</span>
                                    <span className="font-medium text-gray-900">{buyerEmail || "Not provided"}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 sm:col-span-2 border-t border-blue-100/60 pt-2.5">
                                <MapPin className="h-4 w-4 text-gray-400 shrink-0 mt-0.5" />
                                <div>
                                    <span className="text-gray-400 block text-[10px] uppercase font-semibold">Delivery Address</span>
                                    <span className="font-medium text-gray-900">{shippingAddress || "Not provided"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const TABS = [
    { id: "browse", label: "Browse", icon: Store },
    { id: "my-listings", label: "My Listings", icon: ListOrdered, authRequired: true },
    { id: "sell", label: "Sell an Item", icon: Tag, authRequired: true },
];

const Resale = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState("browse");

    // ── Browse state ──────────────────────────────────────────────────────────
    const [listings, setListings] = useState([]);
    const [listingsLoading, setListingsLoading] = useState(true);
    const [listingsError, setListingsError] = useState("");

    // ── My Listings state ─────────────────────────────────────────────────────
    const [myListings, setMyListings] = useState([]);
    const [myLoading, setMyLoading] = useState(false);
    const [myError, setMyError] = useState("");

    // ── Sell form state ───────────────────────────────────────────────────────
    const [eligibleProducts, setEligibleProducts] = useState([]);
    const [eligibleLoading, setEligibleLoading] = useState(false);
    const [eligibleError, setEligibleError] = useState("");

    const [sellProductId, setSellProductId] = useState("");
    const [sellPrice, setSellPrice] = useState("");
    const [sellCondition, setSellCondition] = useState(ResaleCondition.Good);
    const [sellDescription, setSellDescription] = useState("");
    const [sellImage, setSellImage] = useState(null);
    const [sellImagePreview, setSellImagePreview] = useState(null);
    const [sellSubmitting, setSellSubmitting] = useState(false);
    const [sellError, setSellError] = useState("");
    const [sellSuccess, setSellSuccess] = useState("");

    // ── Edit modal state ──────────────────────────────────────────────────────
    const [editListing, setEditListing] = useState(null);
    const [editPrice, setEditPrice] = useState("");
    const [editCondition, setEditCondition] = useState(ResaleCondition.Good);
    const [editDescription, setEditDescription] = useState("");
    const [editImage, setEditImage] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);
    const [editSubmitting, setEditSubmitting] = useState(false);
    const [editError, setEditError] = useState("");

    // ── Delete confirm state ──────────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleteSubmitting, setDeleteSubmitting] = useState(false);

    const sellImageRef = useRef();
    const editImageRef = useRef();

    // ── Load on mount ─────────────────────────────────────────────────────────
    useEffect(() => {
        loadListings();
    }, []);

    useEffect(() => {
        if (activeTab === "my-listings" && isAuthenticated) {
            loadMyListings();
        }
        if (activeTab === "sell" && isAuthenticated) {
            loadEligibleProducts();
        }
    }, [activeTab, isAuthenticated]);

    // ── Data loaders ──────────────────────────────────────────────────────────
    const loadListings = async () => {
        try {
            setListingsLoading(true);
            setListingsError("");
            const data = await resaleService.getAll();
            const list = Array.isArray(data) ? data : data?.listings || data?.items || data?.data || [];
            setListings(list);
        } catch (err) {
            setListingsError(err.userMessage || "Unable to load marketplace listings.");
        } finally {
            setListingsLoading(false);
        }
    };

    const loadMyListings = async () => {
        try {
            setMyLoading(true);
            setMyError("");
            const data = await resaleService.getMyListings();
            const list = Array.isArray(data) ? data : data?.listings || data?.items || data?.data || [];
            setMyListings(list);
        } catch (err) {
            setMyError(err.userMessage || "Unable to load your listings.");
        } finally {
            setMyLoading(false);
        }
    };

    const loadEligibleProducts = async () => {
        try {
            setEligibleLoading(true);
            setEligibleError("");
            const data = await resaleService.getEligibleProducts();
            const list = Array.isArray(data) ? data : data?.products || data?.items || data?.data || [];
            setEligibleProducts(list);
        } catch (err) {
            setEligibleError(err.userMessage || "Unable to load eligible products.");
        } finally {
            setEligibleLoading(false);
        }
    };

    // ── Tab click ──────────────────────────────────────────────────────────────
    const handleTabClick = (tabId, authRequired) => {
        if (authRequired && !isAuthenticated) {
            navigate("/login");
            return;
        }
        setActiveTab(tabId);
    };

    // ── Sell image pick ───────────────────────────────────────────────────────
    const handleSellImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setSellImage(file);
        setSellImagePreview(URL.createObjectURL(file));
    };

    // ── Sell submit ───────────────────────────────────────────────────────────
    const handleSellSubmit = async (e) => {
        e.preventDefault();
        setSellError("");
        setSellSuccess("");

        if (!sellProductId) { setSellError("Please select a product."); return; }
        if (!sellPrice || isNaN(Number(sellPrice)) || Number(sellPrice) <= 0) { setSellError("Please enter a valid price."); return; }
        if (!sellImage) { setSellError("Please upload an image of the item."); return; }

        try {
            setSellSubmitting(true);
            const fd = new FormData();
            fd.append("productId", Number(sellProductId));
            fd.append("price", Number(sellPrice));
            fd.append("condition", Number(sellCondition));
            fd.append("description", sellDescription.trim());
            fd.append("image", sellImage);

            await resaleService.create(fd);

            setSellSuccess("Your listing has been published successfully.");
            setSellProductId("");
            setSellPrice("");
            setSellCondition(ResaleCondition.Good);
            setSellDescription("");
            setSellImage(null);
            setSellImagePreview(null);

            // Refresh marketplace and my listings
            loadListings();
            setMyListings([]);
        } catch (err) {
            setSellError(err.userMessage || err.response?.data?.message || "Failed to create listing.");
        } finally {
            setSellSubmitting(false);
        }
    };

    // ── Edit handlers ─────────────────────────────────────────────────────────
    const openEdit = (listing) => {
        setEditListing(listing);
        setEditPrice(String(listing.price ?? ""));
        setEditCondition(listing.condition ?? ResaleCondition.Good);
        setEditDescription(listing.description ?? "");
        setEditImage(null);
        setEditImagePreview(resolveImg(listing.imageUrl));
        setEditError("");
    };

    const handleEditImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditImage(file);
        setEditImagePreview(URL.createObjectURL(file));
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setEditError("");
        if (!editPrice || isNaN(Number(editPrice)) || Number(editPrice) <= 0) {
            setEditError("Please enter a valid price.");
            return;
        }

        try {
            setEditSubmitting(true);
            const fd = new FormData();
            fd.append("price", Number(editPrice));
            fd.append("condition", Number(editCondition));
            fd.append("description", editDescription.trim());
            if (editImage) fd.append("image", editImage);

            await resaleService.update(editListing.id, fd);
            setEditListing(null);
            loadMyListings();
            loadListings();
        } catch (err) {
            setEditError(err.userMessage || err.response?.data?.message || "Failed to update listing.");
        } finally {
            setEditSubmitting(false);
        }
    };

    // ── Delete handlers ───────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            setDeleteSubmitting(true);
            await resaleService.delete(deleteTarget.id);
            setDeleteTarget(null);
            loadMyListings();
            loadListings();
        } catch (err) {
            console.error(err);
        } finally {
            setDeleteSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Hero ── */}
            <section className="border-b border-gray-200 bg-white">
                <div className="mx-auto max-w-7xl px-5 py-6 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
                        Resale Marketplace
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Buy and sell pre-owned business equipment from verified BizBox orders.
                    </p>
                </div>
            </section>

            {/* ── Tabs ── */}
            <div className="sticky top-16 z-30 border-b border-gray-200 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
                    <div className="flex gap-1">
                        {TABS.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => handleTabClick(tab.id, tab.authRequired)}
                                    className={`flex items-center gap-2 border-b-2 px-4 py-4 text-sm font-medium transition ${
                                        active
                                            ? "border-gray-900 text-gray-900"
                                            : "border-transparent text-gray-500 hover:text-gray-800"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                    {tab.authRequired && !isAuthenticated && (
                                        <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500">
                                            Login
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* ── Content ── */}
            <main className="mx-auto max-w-7xl px-5 py-10 sm:px-6 lg:px-8">

                {activeTab === "browse" && (
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Available Listings
                            </h2>
                            {!listingsLoading && listings.length > 0 && (
                                <span className="text-sm text-gray-500">
                                    {listings.length} {listings.length === 1 ? "listing" : "listings"}
                                </span>
                            )}
                        </div>

                        {listingsLoading && (
                            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <SkeletonCard key={i} />)}
                            </div>
                        )}

                        {!listingsLoading && listingsError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
                                <p className="text-sm text-red-700">{listingsError}</p>
                                <button
                                    type="button"
                                    onClick={loadListings}
                                    className="mt-4 rounded-xl bg-red-600 px-5 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!listingsLoading && !listingsError && listings.length === 0 && (
                            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-20 text-center">
                                <Store className="mx-auto h-12 w-12 text-gray-300" />
                                <h2 className="mt-5 text-xl font-semibold text-gray-900">
                                    No listings yet
                                </h2>
                                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                                    Be the first to list your pre-owned equipment on the marketplace.
                                </p>
                                {isAuthenticated ? (
                                    <button
                                        type="button"
                                        onClick={() => handleTabClick("sell", true)}
                                        className="mt-6 rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-black"
                                    >
                                        Sell an Item
                                    </button>
                                ) : (
                                    <Link
                                        to="/login"
                                        className="mt-6 inline-block rounded-xl bg-gray-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-black"
                                    >
                                        Sign In to Sell
                                    </Link>
                                )}
                            </div>
                        )}

                        {!listingsLoading && !listingsError && listings.length > 0 && (
                            <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {listings.map((listing) => (
                                    <ListingCard key={listing.id} listing={listing} />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "my-listings" && (
                    <div>
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">My Listings</h2>
                            <button
                                type="button"
                                onClick={() => handleTabClick("sell", true)}
                                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-black"
                            >
                                <PlusCircle className="h-4 w-4" />
                                New Listing
                            </button>
                        </div>

                        {myLoading && (
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex animate-pulse gap-4 rounded-2xl border border-gray-200 bg-white p-5">
                                        <div className="h-20 w-20 rounded-xl bg-gray-100" />
                                        <div className="flex-1 space-y-3">
                                            <div className="h-4 w-40 rounded bg-gray-100" />
                                            <div className="h-3 w-24 rounded bg-gray-100" />
                                            <div className="h-5 w-20 rounded bg-gray-100" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!myLoading && myError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
                                <p className="text-sm text-red-700">{myError}</p>
                                <button
                                    type="button"
                                    onClick={loadMyListings}
                                    className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {!myLoading && !myError && myListings.length === 0 && (
                            <div className="rounded-3xl border border-gray-200 bg-white px-6 py-16 text-center">
                                <ListOrdered className="mx-auto h-10 w-10 text-gray-300" />
                                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                                    No listings yet
                                </h3>
                                <p className="mt-2 text-sm text-gray-500">
                                    List equipment you own to sell it on the marketplace.
                                </p>
                                <button
                                    type="button"
                                    onClick={() => handleTabClick("sell", true)}
                                    className="mt-5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-black"
                                >
                                    Sell an Item
                                </button>
                            </div>
                        )}

                        {!myLoading && !myError && myListings.length > 0 && (
                            <div className="space-y-4">
                                {myListings.map((listing) => (
                                    <MyListingCard
                                        key={listing.id}
                                        listing={listing}
                                        onEdit={openEdit}
                                        onDelete={setDeleteTarget}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "sell" && (
                    <div className="mx-auto max-w-2xl">
                        <h2 className="mb-6 text-xl font-semibold text-gray-900">
                            List an Item for Sale
                        </h2>

                        {sellSuccess && (
                            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                                <p className="text-sm text-emerald-800">{sellSuccess}</p>
                            </div>
                        )}

                        {eligibleLoading && (
                            <div className="animate-pulse space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
                                <div className="h-4 w-32 rounded bg-gray-100" />
                                <div className="h-12 w-full rounded-xl bg-gray-100" />
                                <div className="h-4 w-24 rounded bg-gray-100" />
                                <div className="h-12 w-full rounded-xl bg-gray-100" />
                            </div>
                        )}

                        {!eligibleLoading && eligibleError && (
                            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-sm text-red-700">
                                {eligibleError}
                            </div>
                        )}

                        {!eligibleLoading && !eligibleError && (
                            <form
                                onSubmit={handleSellSubmit}
                                className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
                            >
                                {sellError && (
                                    <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                        {sellError}
                                    </div>
                                )}

                                {/* Product select */}
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900">
                                        Product <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={sellProductId}
                                        onChange={(e) => setSellProductId(e.target.value)}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition focus:border-gray-900"
                                    >
                                        <option value="">— Select a product —</option>
                                        {eligibleProducts.map((p) => (
                                            <option
                                                key={p.productId}
                                                value={p.productId}
                                                disabled={p.alreadyListed}
                                            >
                                                {p.productName}
                                                {p.alreadyListed ? " (already listed)" : ""}
                                            </option>
                                        ))}
                                    </select>
                                    {eligibleProducts.length === 0 && (
                                        <p className="text-xs text-gray-400">
                                            No eligible products found. Purchase equipment first to list it here.
                                        </p>
                                    )}
                                </div>

                                {/* Price */}
                                <div className="mt-4 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900">
                                        Asking Price (Rs.) <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        step="0.01"
                                        value={sellPrice}
                                        onChange={(e) => setSellPrice(e.target.value)}
                                        placeholder="e.g. 800"
                                        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                {/* Condition */}
                                <div className="mt-4 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900">
                                        Condition <span className="text-red-500">*</span>
                                    </label>
                                    <div className="flex gap-3">
                                        {Object.entries(ResaleCondition).map(([label, value]) => (
                                            <button
                                                key={value}
                                                type="button"
                                                onClick={() => setSellCondition(value)}
                                                className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition ${
                                                    sellCondition === value
                                                        ? "border-gray-900 bg-gray-900 text-white"
                                                        : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                                                }`}
                                            >
                                                {CONDITION_LABELS[value]}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-4 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900">
                                        Description
                                    </label>
                                    <textarea
                                        value={sellDescription}
                                        onChange={(e) => setSellDescription(e.target.value)}
                                        rows={3}
                                        placeholder="Describe the item's condition, usage, etc."
                                        className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-gray-900"
                                    />
                                </div>

                                {/* Image upload */}
                                <div className="mt-4 space-y-1.5">
                                    <label className="text-sm font-medium text-gray-900">
                                        Photo <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        ref={sellImageRef}
                                        type="file"
                                        accept="image/*"
                                        onChange={handleSellImageChange}
                                        className="hidden"
                                    />
                                    {sellImagePreview ? (
                                        <div className="relative overflow-hidden rounded-xl border border-gray-200">
                                            <img
                                                src={sellImagePreview}
                                                alt="Preview"
                                                className="h-48 w-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => { setSellImage(null); setSellImagePreview(null); }}
                                                className="absolute right-2 top-2 rounded-full bg-white p-1 shadow"
                                            >
                                                <X className="h-4 w-4 text-gray-700" />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => sellImageRef.current?.click()}
                                            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 py-10 text-sm text-gray-400 transition hover:border-gray-400 hover:text-gray-600"
                                        >
                                            <Upload className="h-6 w-6" />
                                            Click to upload a photo
                                        </button>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={sellSubmitting}
                                    className="mt-6 w-full rounded-xl bg-gray-900 py-3 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {sellSubmitting ? "Publishing..." : "Publish Listing"}
                                </button>
                            </form>
                        )}
                    </div>
                )}
            </main>

            {editListing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
                            <h3 className="font-semibold text-gray-900">Edit Listing</h3>
                            <button
                                type="button"
                                onClick={() => setEditListing(null)}
                                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <form onSubmit={handleEditSubmit} className="space-y-4 p-6">
                            {editError && (
                                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                    {editError}
                                </div>
                            )}

                            {/* Price */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-900">Price (Rs.)</label>
                                <input
                                    type="number"
                                    min="1"
                                    step="0.01"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(e.target.value)}
                                    className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                                />
                            </div>

                            {/* Condition */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-900">Condition</label>
                                <div className="flex gap-3">
                                    {Object.entries(ResaleCondition).map(([, value]) => (
                                        <button
                                            key={value}
                                            type="button"
                                            onClick={() => setEditCondition(value)}
                                            className={`flex-1 rounded-xl border py-2 text-sm font-medium transition ${
                                                editCondition === value
                                                    ? "border-gray-900 bg-gray-900 text-white"
                                                    : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                                            }`}
                                        >
                                            {CONDITION_LABELS[value]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-900">Description</label>
                                <textarea
                                    value={editDescription}
                                    onChange={(e) => setEditDescription(e.target.value)}
                                    rows={3}
                                    className="w-full resize-none rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-gray-900"
                                />
                            </div>

                            {/* Image */}
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-900">
                                    Photo (optional update)
                                </label>
                                <input
                                    ref={editImageRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditImageChange}
                                    className="hidden"
                                />
                                <div className="relative overflow-hidden rounded-xl border border-gray-200">
                                    <img
                                        src={editImagePreview}
                                        alt="Preview"
                                        className="h-36 w-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => editImageRef.current?.click()}
                                        className="absolute bottom-2 right-2 flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-gray-700 shadow hover:bg-gray-50"
                                    >
                                        <Upload className="h-3.5 w-3.5" /> Change
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setEditListing(null)}
                                    className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-900"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={editSubmitting}
                                    className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-medium text-white hover:bg-black disabled:opacity-60"
                                >
                                    {editSubmitting ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deleteTarget && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                            <Trash2 className="h-6 w-6 text-red-600" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-gray-900">Remove Listing?</h3>
                        <p className="mt-2 text-sm text-gray-500">
                            This will remove{" "}
                            <span className="font-medium text-gray-800">
                                {deleteTarget.productName}
                            </span>{" "}
                            from the marketplace. This action cannot be undone.
                        </p>
                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setDeleteTarget(null)}
                                className="flex-1 rounded-xl border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:border-gray-900"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleteSubmitting}
                                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleteSubmitting ? "Removing..." : "Remove"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Resale;