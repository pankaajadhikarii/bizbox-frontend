import { useEffect, useState } from "react";
import {
  Link,
  useParams,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Truck,
  PackageCheck,
  XCircle,
  AlertCircle,
  RotateCcw,
  MapPin,
  CreditCard,
} from "lucide-react";
import orderService from "../services/orderService";
import productService from "../services/productService";
import { resolveImageUrl } from "../utils/imageUrl";

const statusSteps = [
  {
    key: "Pending",
    label: "Order Placed",
    description: "Your order has been received.",
    icon: Clock,
  },
  {
    key: "Processing",
    label: "Processing",
    description: "Your order is being prepared.",
    icon: PackageCheck,
  },
  {
    key: "Shipped",
    label: "Shipped",
    description: "Your order is on the way.",
    icon: Truck,
  },
  {
    key: "Delivered",
    label: "Delivered",
    description: "Your order has been delivered.",
    icon: CheckCircle2,
  },
];

const statusAliases = {
  0: "Pending",
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
  0: "Pending",
  1: "Processing",
  2: "Shipped",
  3: "Delivered",
  4: "Cancelled",
  pending: "Pending",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  Pending: "Pending",
  Processing: "Processing",
  Shipped: "Shipped",
  Delivered: "Delivered",
  Cancelled: "Cancelled",
};

const OrderDetails = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const [order, setOrder] = useState(null);
  const [productsMap, setProductsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (id) {
      loadOrder();
    }
  }, [id]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const [orderData, productsData] = await Promise.allSettled([
        orderService.getById(id),
        productService.getAll(),
      ]);

      if (orderData.status === "rejected") {
        throw orderData.reason;
      }

      setOrder(orderData.value);

      if (productsData.status === "fulfilled" && productsData.value) {
        const list = Array.isArray(productsData.value)
          ? productsData.value
          : productsData.value?.products ||
            productsData.value?.items ||
            productsData.value?.data ||
            [];

        const pMap = {};
        list.forEach((p) => {
          const pId = p.id || p.productId;
          if (pId != null) {
            pMap[pId] = p;
            pMap[String(pId)] = p;
          }
        });
        setProductsMap(pMap);
      }
    } catch (err) {
      setError(
        err.userMessage || "Unable to load this order. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const normalizeStatus = (status) => {
    if (status === null || status === undefined || status === "") {
      return "Pending";
    }

    if (statusAliases[status] !== undefined) {
      return statusAliases[status];
    }

    const value = String(status).toLowerCase();
    return statusAliases[value] || String(status);
  };

  const getItems = () => {
    if (Array.isArray(order?.items)) {
      return order.items;
    }

    if (Array.isArray(order?.orderItems)) {
      return order.orderItems;
    }

    if (Array.isArray(order?.order?.items)) {
      return order.order.items;
    }

    return [];
  };

  const items = getItems();

  const isResale = Boolean(
    searchParams.get("type") === "resale" ||
    location.state?.isResale ||
    order?.isResale ||
    order?.orderType === "Resale" ||
    order?.type === "Resale" ||
    order?.resaleListingId != null ||
    items.some((item) => item.isResale || item.resaleListingId != null) ||
    (id && sessionStorage.getItem(`resale_order_${id}`) === "true"),
  );

  const getProduct = (item) => {
    const productId = item.productId || item.product?.id || item.id;
    const catalogProduct = productId
      ? productsMap[productId] || productsMap[String(productId)]
      : null;

    return {
      ...(catalogProduct || {}),
      ...(item.product || item.productDetails || {}),
      ...item,
      ...(catalogProduct
        ? {
            imageUrl:
              item.product?.imageUrl ||
              item.imageUrl ||
              item.productImageUrl ||
              item.image ||
              catalogProduct.imageUrl ||
              catalogProduct.image,
            categoryName:
              item.categoryName ||
              item.product?.category?.name ||
              catalogProduct.category?.name ||
              catalogProduct.categoryName,
          }
        : {}),
    };
  };

  const getProductName = (item) => {
    const product = getProduct(item);
    return (
      product.name ||
      product.productName ||
      item.productName ||
      item.name ||
      "Equipment"
    );
  };

  const getProductImage = (item) => {
    const product = getProduct(item);
    const raw =
      item.imageUrl ||
      item.productImageUrl ||
      item.productImage ||
      item.image ||
      product?.imageUrl ||
      product?.productImageUrl ||
      product?.image ||
      product?.thumbnailUrl;

    return resolveImageUrl(raw) || fallbackImage;
  };

  const getCategoryName = (item) => {
    const product = getProduct(item);

    return (
      product.category?.name ||
      product.categoryName ||
      item.categoryName ||
      "Equipment"
    );
  };

  const getQuantity = (item) => {
    return Number(item.quantity) || 1;
  };

  const getUnitPrice = (item) => {
    const product = getProduct(item);

    return Number(item.unitPrice ?? item.price ?? product.price ?? 0);
  };

  const getItemTotal = (item) => {
    const quantity = getQuantity(item);

    if (item.totalPrice !== undefined && item.totalPrice !== null) {
      return Number(item.totalPrice);
    }

    if (item.subtotal !== undefined && item.subtotal !== null) {
      return Number(item.subtotal);
    }

    return getUnitPrice(item) * quantity;
  };

  const getOrderTotal = () => {
    if (!order) {
      return 0;
    }

    return Number(
      order.totalAmount ??
        order.total ??
        order.grandTotal ??
        order.orderTotal ??
        items.reduce((sum, item) => sum + getItemTotal(item), 0),
    );
  };

  const getPaymentMethod = () => {
    const method = order?.paymentMethod ?? order?.payment?.paymentMethod;

    if (
      method === 0 ||
      method === "0" ||
      method === "Esewa" ||
      method === "eSewa"
    ) {
      return "eSewa";
    }

    if (method === 1 || method === "1" || method === "Khalti") {
      return "Khalti";
    }

    if (
      method === 2 ||
      method === "2" ||
      method === 3 ||
      method === "3" ||
      method === "CashOnDelivery" ||
      method === "COD"
    ) {
      return "COD";
    }

    if (typeof method === "string") {
      return method;
    }

    return "Not specified";
  };

  const getPaymentStatus = () => {
    const rawStatus = order?.status;
    const orderStatus = statusAliases[rawStatus] ?? rawStatus;
    const paymentMethod = getPaymentMethod();

    if (orderStatus === "Delivered" && paymentMethod === "COD") {
      return "Paid";
    }

    const status = order?.paymentStatus ?? order?.payment?.status;

    // OrderPaymentStatus:
    // 0 = Unpaid
    // 1 = Pending
    // 2 = Paid
    // 3 = Failed
    // 4 = Refunded

    if (
      status === 2 ||
      status === "2" ||
      status === "Paid" ||
      status === "PAID"
    ) {
      return "Paid";
    }

    if (
      status === 0 ||
      status === "0" ||
      status === "Unpaid" ||
      status === "UNPAID"
    ) {
      return "Unpaid";
    }

    if (
      status === 1 ||
      status === "1" ||
      status === "Pending" ||
      status === "PENDING"
    ) {
      return "Pending";
    }

    if (
      status === 3 ||
      status === "3" ||
      status === "Failed" ||
      status === "FAILED"
    ) {
      return "Failed";
    }

    if (
      status === 4 ||
      status === "4" ||
      status === "Refunded" ||
      status === "REFUNDED"
    ) {
      return "Refunded";
    }

    if (typeof status === "string" && status.trim()) {
      return status;
    }

    return "Unpaid";
  };

  const getOrderDate = () => {
    const date = order?.createdAt ?? order?.orderDate ?? order?.createdDate;

    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return date;
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getOrderNumber = () => {
    return order?.orderNumber || order?.id || id;
  };

  const currentStatus = normalizeStatus(order?.status);

  const currentStepIndex = statusSteps.findIndex(
    (step) => step.key === currentStatus,
  );

  const isCancelled = currentStatus === "Cancelled";

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 border border-amber-200/60";
      case "Processing":
        return "bg-blue-50 text-blue-700 border border-blue-200/60";
      case "Shipped":
        return "bg-purple-50 text-purple-700 border border-purple-200/60";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 border border-emerald-200/60";
      case "Cancelled":
        return "bg-red-50 text-red-700 border border-red-200/60";
      default:
        return "bg-gray-100 text-gray-700 border border-gray-200";
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          to="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-black mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to orders
        </Link>

        {/* Loading Skeleton */}
        {loading && (
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-9 w-64 rounded-xl bg-gray-200" />
              <div className="h-4 w-40 rounded bg-gray-200" />
            </div>

            <div className="h-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" />

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
              <div className="lg:col-span-8 h-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" />
              <div className="lg:col-span-4 h-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {!loading && error && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              Unable to load order
            </h2>

            <p className="mt-1.5 max-w-md text-sm text-gray-500">{error}</p>

            <div className="mt-6 flex items-center gap-3">
              <button
                type="button"
                onClick={loadOrder}
                className="inline-flex items-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:bg-gray-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Try Again
              </button>

              <Link
                to="/orders"
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        )}

        {/* Order Details Content */}
        {!loading && !error && order && (
          <div className="space-y-8">
            {/* Page Heading */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-black sm:text-4xl">
                  Order #{getOrderNumber()}
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Placed on {getOrderDate()}
                </p>
              </div>

              <span
                className={`inline-flex self-start sm:self-auto rounded-full px-3.5 py-1 text-xs font-medium ${
                  isResale
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                    : getStatusClass(currentStatus)
                }`}
              >
                {isResale ? "Placed" : currentStatus}
              </span>
            </div>

            {/* Status Timeline - hidden for resale */}
            {!isResale && (
              <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-semibold text-gray-900 mb-6">
                  Order Progress
                </h2>

                {isCancelled ? (
                  <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <XCircle className="h-5 w-5 shrink-0 text-red-600" />
                    <div>
                      <p className="text-sm font-semibold">Order Cancelled</p>
                      <p className="text-xs text-red-600/80 mt-0.5">
                        This order is no longer being processed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Desktop Timeline */}
                    <div className="hidden sm:block">
                      <div className="relative">
                        {/* Track Background */}
                        <div className="absolute left-[12%] right-[12%] top-5 h-0.5 bg-gray-200" />

                        {/* Track Active Progress */}
                        <div
                          className="absolute left-[12%] top-5 h-0.5 bg-black transition-all duration-300"
                          style={{
                            width:
                              currentStepIndex <= 0
                                ? "0%"
                                : `${Math.min(
                                    (currentStepIndex /
                                      (statusSteps.length - 1)) *
                                      76,
                                    76,
                                  )}%`,
                          }}
                        />

                        {/* Steps */}
                        <div className="relative grid grid-cols-4">
                          {statusSteps.map((step, index) => {
                            const completed = index <= currentStepIndex;
                            const active = index === currentStepIndex;
                            const StepIcon = step.icon;

                            return (
                              <div
                                key={step.key}
                                className="flex flex-col items-center text-center"
                              >
                                <div
                                  className={`flex h-10 w-10 items-center justify-center rounded-full border-4 border-white shadow-xs transition-colors ${
                                    completed
                                      ? "bg-black text-white"
                                      : "bg-gray-100 text-gray-400"
                                  }`}
                                >
                                  <StepIcon className="h-4 w-4" />
                                </div>

                                <p
                                  className={`mt-3 text-xs font-semibold ${
                                    active
                                      ? "text-black"
                                      : completed
                                        ? "text-gray-700"
                                        : "text-gray-400"
                                  }`}
                                >
                                  {step.label}
                                </p>

                                <p className="mt-1 text-[11px] text-gray-500 max-w-[120px]">
                                  {step.description}
                                </p>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Mobile Vertical Timeline */}
                    <div className="space-y-4 sm:hidden">
                      {statusSteps.map((step, index) => {
                        const completed = index <= currentStepIndex;
                        const active = index === currentStepIndex;
                        const StepIcon = step.icon;

                        return (
                          <div key={step.key} className="flex gap-3.5">
                            <div className="flex flex-col items-center">
                              <div
                                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
                                  completed
                                    ? "bg-black text-white"
                                    : "bg-gray-100 text-gray-400"
                                }`}
                              >
                                <StepIcon className="h-3.5 w-3.5" />
                              </div>

                              {index !== statusSteps.length - 1 && (
                                <div
                                  className={`mt-1.5 h-6 w-0.5 ${
                                    index < currentStepIndex
                                      ? "bg-black"
                                      : "bg-gray-200"
                                  }`}
                                />
                              )}
                            </div>

                            <div className="pt-0.5">
                              <p
                                className={`text-xs font-semibold ${
                                  active
                                    ? "text-black"
                                    : completed
                                      ? "text-gray-800"
                                      : "text-gray-400"
                                }`}
                              >
                                {step.label}
                              </p>
                              <p className="text-[11px] text-gray-500 mt-0.5">
                                {step.description}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </section>
            )}

            {/* Order Content Grid */}
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-start">
              {/* Left Column: Items & Address */}
              <div className="lg:col-span-8 space-y-6">
                {/* Items Card */}
                <section className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">
                      Ordered Items
                    </h2>
                    <span className="text-xs text-gray-500">
                      {items.length} {items.length === 1 ? "item" : "items"}
                    </span>
                  </div>

                  {items.length === 0 ? (
                    <div className="p-8 text-center text-sm text-gray-500">
                      No items found for this order.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {items.map((item, index) => {
                        const quantity = getQuantity(item);
                        const unitPrice = getUnitPrice(item);
                        const itemTotal = getItemTotal(item);
                        const productId = item.productId || item.product?.id;

                        return (
                          <div
                            key={item.id || productId || index}
                            className="flex items-center gap-4 p-5 sm:gap-6"
                          >
                            {/* Thumbnail */}
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                              <img
                                src={getProductImage(item)}
                                alt={getProductName(item)}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src = fallbackImage;
                                }}
                              />
                            </div>

                            {/* Info */}
                            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                              <span className="text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                {getCategoryName(item)}
                              </span>

                              {productId ? (
                                <Link
                                  to={`/products/${productId}`}
                                  className="text-sm font-semibold text-gray-900 line-clamp-1 hover:text-black transition"
                                >
                                  {getProductName(item)}
                                </Link>
                              ) : (
                                <span className="text-sm font-semibold text-gray-900 line-clamp-1">
                                  {getProductName(item)}
                                </span>
                              )}

                              <p className="text-xs text-gray-500">
                                Rs. {unitPrice.toLocaleString()} × {quantity}
                              </p>
                            </div>

                            {/* Total */}
                            <div className="text-right shrink-0">
                              <span className="text-sm font-semibold text-gray-900">
                                Rs. {itemTotal.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Delivery Address Card */}
                <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <h2 className="text-base font-semibold text-gray-900">
                      Delivery Information
                    </h2>
                  </div>

                  {order.customerName && (
                    <div className="mb-3 rounded-xl bg-gray-50/75 p-3.5 border border-gray-100 text-sm">
                      <p className="font-semibold text-gray-900">
                        {order.customerName}
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 text-sm text-gray-700 leading-relaxed">
                    {order.shippingAddress ||
                      order.deliveryAddress ||
                      "No delivery address provided."}
                  </div>
                </section>
              </div>

              {/* Right Column: Order Summary & Info */}
              <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
                {/* Summary Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                  <h2 className="text-base font-semibold text-gray-900">
                    Order Summary
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between text-gray-600">
                      <span>Products</span>
                      <span>{items.length}</span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Total Quantity</span>
                      <span>
                        {items.reduce(
                          (sum, item) => sum + getQuantity(item),
                          0,
                        )}
                      </span>
                    </div>

                    <div className="flex justify-between text-gray-600">
                      <span>Payment Method</span>
                      <span className="font-medium text-gray-900">
                        {getPaymentMethod()}
                      </span>
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-between text-base font-semibold text-gray-900">
                      <span>Total Amount</span>
                      <span>Rs. {getOrderTotal().toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2.5">
                    <Link
                      to="/orders"
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-medium text-white transition hover:bg-gray-800 shadow-xs"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to all orders
                    </Link>

                    <Link
                      to={isResale ? "/resale" : "/equipment"}
                      className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                    >
                      {isResale ? "Continue to Resale" : "Continue shopping"}
                    </Link>
                  </div>
                </div>

                {/* Order Meta Info Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm text-xs space-y-3 text-gray-600">
                  {!isResale && (
                    <div className="flex justify-between items-center">
                      <span>Payment Status</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 font-medium ${
                          getPaymentStatus() === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : getPaymentStatus() === "Failed"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {getPaymentStatus()}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex justify-between items-center ${
                      !isResale ? "border-t border-gray-100 pt-3" : ""
                    }`}
                  >
                    <span>Order Date</span>
                    <span className="font-medium text-gray-900">
                      {getOrderDate()}
                    </span>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrderDetails;
