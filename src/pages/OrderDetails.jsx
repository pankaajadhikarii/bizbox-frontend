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
  const isAdminView = searchParams.get("admin") === "true";

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
      items.some(
        (item) => item.isResale || item.resaleListingId != null,
      ) ||
      (id &&
        sessionStorage.getItem(`resale_order_${id}`) === "true"),
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

    return Number(
      item.unitPrice ?? item.price ?? product.price ?? 0,
    );
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
        items.reduce(
          (sum, item) => sum + getItemTotal(item),
          0,
        ),
    );
  };

  const getPaymentMethod = () => {
    const method =
      order?.paymentMethod ?? order?.payment?.paymentMethod;

    if (
      method === 0 ||
      method === "0" ||
      method === "Esewa" ||
      method === "eSewa"
    ) {
      return "eSewa";
    }

    if (
      method === 1 ||
      method === "1" ||
      method === "CashOnDelivery" ||
      method === "COD"
    ) {
      return "COD";
    }

    if (typeof method === "string" && method.trim()) {
      return method;
    }

    return "Not specified";
  };

  const getPaymentStatus = () => {
    const paymentMethod = getPaymentMethod();

    if (
      paymentMethod === "COD" &&
      (order?.status === 3 ||
        order?.status === "3" ||
        order?.status === "Delivered")
    ) {
      return "Paid";
    }

    const status =
      order?.paymentStatus ?? order?.payment?.status;

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
    const date =
      order?.createdAt ??
      order?.orderDate ??
      order?.createdDate;

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

  const getCustomerName = () =>
    order?.customerName?.trim() || "Customer";

  const getCustomerEmail = () =>
    order?.customerEmail?.trim() || "No email provided.";

  const getCustomerAddress = () =>
    order?.shippingAddress?.trim() ||
    "No shipping address provided.";

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
    <main className="min-h-screen bg-gray-50 py-6 sm:py-8 lg:py-10">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Back Link */}
        <Link
          to={isAdminView ? "/admin/orders" : "/orders"}
          className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-black"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to orders
        </Link>

        {/* Loading Skeleton */}
        {loading && (
          <div className="animate-pulse space-y-6">
            <div className="space-y-2">
              <div className="h-8 w-52 max-w-full rounded-xl bg-gray-200 sm:h-9 sm:w-64" />
              <div className="h-4 w-36 rounded bg-gray-200 sm:w-40" />
            </div>

            <div className="h-28 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
              <div className="h-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-8" />
              <div className="h-80 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm lg:col-span-4" />
            </div>
          </div>
        )}

        {/* Error Banner */}
        {!loading && error && (
          <div className="flex min-h-[360px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
              <AlertCircle className="h-7 w-7" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-gray-900 sm:text-xl">
              Unable to load order
            </h2>

            <p className="mt-1.5 max-w-md text-sm leading-6 text-gray-500">
              {error}
            </p>

            <div className="mt-6 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={loadOrder}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-black px-4 py-2.5 text-xs font-medium text-white transition hover:bg-gray-800"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Try Again
              </button>

              <Link
                to={isAdminView ? "/admin/orders" : "/orders"}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-center text-xs font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Back to Orders
              </Link>
            </div>
          </div>
        )}

        {/* Order Details Content */}
        {!loading && !error && order && (
          <div className="space-y-6 sm:space-y-8">

            {/* Page Heading */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="min-w-0">
                <h1 className="break-words text-2xl font-semibold tracking-tight text-black sm:text-3xl lg:text-4xl">
                  Order #{getOrderNumber()}
                </h1>

                <p className="mt-2 text-sm text-gray-600">
                  Placed on {getOrderDate()}
                </p>
              </div>

              <span
                className={`inline-flex w-fit shrink-0 rounded-full px-3.5 py-1 text-xs font-medium ${
                  isResale
                    ? "border border-emerald-200/60 bg-emerald-50 text-emerald-700"
                    : getStatusClass(currentStatus)
                }`}
              >
                {isResale ? "Placed" : currentStatus}
              </span>
            </div>

            {/* Status Timeline */}
            {!isResale && !isAdminView && (
              <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                <h2 className="mb-5 text-base font-semibold text-gray-900 sm:mb-6">
                  Order Progress
                </h2>

                {isCancelled ? (
                  <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />

                    <div className="min-w-0">
                      <p className="text-sm font-semibold">
                        Order Cancelled
                      </p>

                      <p className="mt-0.5 text-xs leading-5 text-red-600/80">
                        This order is no longer being processed.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Desktop Timeline */}
                    <div className="hidden sm:block">
                      <div className="relative">
                        <div className="absolute left-[12%] right-[12%] top-5 h-0.5 bg-gray-200" />

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

                        <div className="relative grid grid-cols-4">
                          {statusSteps.map((step, index) => {
                            const completed =
                              index <= currentStepIndex;

                            const active =
                              index === currentStepIndex;

                            const StepIcon = step.icon;

                            return (
                              <div
                                key={step.key}
                                className="flex min-w-0 flex-col items-center text-center"
                              >
                                <div
                                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-4 border-white shadow-xs transition-colors ${
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

                                <p className="mt-1 max-w-[120px] text-[11px] text-gray-500">
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
                        const completed =
                          index <= currentStepIndex;

                        const active =
                          index === currentStepIndex;

                        const StepIcon = step.icon;

                        return (
                          <div
                            key={step.key}
                            className="flex gap-3.5"
                          >
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

                            <div className="min-w-0 pt-0.5">
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

                              <p className="mt-0.5 text-[11px] leading-5 text-gray-500">
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
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">

              {/* Left Column */}
              <div className="space-y-6 lg:col-span-8">

                {/* Items Card */}
                <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
                    <h2 className="text-base font-semibold text-gray-900">
                      Ordered Items
                    </h2>

                    <span className="shrink-0 text-xs text-gray-500">
                      {items.length}{" "}
                      {items.length === 1 ? "item" : "items"}
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
                        const productId =
                          item.productId || item.product?.id;

                        return (
                          <div
                            key={
                              item.id ||
                              productId ||
                              index
                            }
                            className="flex items-center gap-3 p-4 sm:gap-5 sm:p-5 lg:gap-6"
                          >
                            {/* Thumbnail */}
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 sm:h-16 sm:w-16">
                              <img
                                src={getProductImage(item)}
                                alt={getProductName(item)}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.src =
                                    fallbackImage;
                                }}
                              />
                            </div>

                            {/* Info */}
                            <div className="min-w-0 flex-1">
                              <span className="block truncate text-[10px] font-medium uppercase tracking-wider text-gray-400">
                                {getCategoryName(item)}
                              </span>

                              {productId ? (
                                <Link
                                  to={`/products/${productId}`}
                                  className="mt-0.5 block truncate text-sm font-semibold text-gray-900 transition hover:text-black"
                                >
                                  {getProductName(item)}
                                </Link>
                              ) : (
                                <span className="mt-0.5 block truncate text-sm font-semibold text-gray-900">
                                  {getProductName(item)}
                                </span>
                              )}

                              <p className="mt-0.5 truncate text-xs text-gray-500">
                                Rs. {unitPrice.toLocaleString()} ×{" "}
                                {quantity}
                              </p>
                            </div>

                            {/* Total */}
                            <div className="shrink-0 text-right">
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
                <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                  <div className="mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4 shrink-0 text-gray-500" />

                    <h2 className="text-base font-semibold text-gray-900">
                      Delivery Information
                    </h2>
                  </div>

                  <div className="mb-3 rounded-xl border border-gray-100 bg-gray-50/75 p-3.5 text-sm">
                    <p className="font-semibold text-gray-900">
                      {getCustomerName()}
                    </p>

                    <p className="mt-1 break-words text-gray-600">
                      {getCustomerEmail()}
                    </p>
                  </div>

                  <div className="break-words rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                    {getCustomerAddress()}
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <aside className="space-y-6 lg:sticky lg:top-24 lg:col-span-4">

                {/* Summary Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
                  <h2 className="text-base font-semibold text-gray-900">
                    Order Summary
                  </h2>

                  <div className="mt-5 space-y-3 text-sm">
                    {!isAdminView && (
                      <>
                        <div className="flex items-center justify-between gap-4 text-gray-600">
                          <span>Products</span>
                          <span className="shrink-0">
                            {items.length}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-gray-600">
                          <span>Total Quantity</span>
                          <span className="shrink-0">
                            {items.reduce(
                              (sum, item) =>
                                sum + getQuantity(item),
                              0,
                            )}
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-4 text-gray-600">
                          <span>Payment Method</span>

                          <span className="max-w-[50%] truncate text-right font-medium text-gray-900">
                            {getPaymentMethod()}
                          </span>
                        </div>
                      </>
                    )}

                    <div className="flex items-center justify-between gap-4 border-t border-gray-100 pt-3 text-base font-semibold text-gray-900">
                      <span>Total Amount</span>

                      <span className="shrink-0 text-right">
                        Rs. {getOrderTotal().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-2.5">
                    <Link
                      to={isAdminView ? "/admin/orders" : "/orders"}
                      className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-black py-2.5 text-xs font-medium text-white transition hover:bg-gray-800 shadow-xs"
                    >
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to all orders
                    </Link>

                    {!isAdminView && (
                      <Link
                        to={isResale ? "/resale" : "/equipment"}
                        className="flex w-full items-center justify-center rounded-xl border border-gray-200 bg-white py-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50"
                      >
                        {isResale
                          ? "Continue to Resale"
                          : "Continue shopping"}
                      </Link>
                    )}
                  </div>
                </div>

                {/* Order Meta Info */}
                <div className="space-y-3 rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-600 shadow-sm sm:p-6">
                  {!isResale && (
                    <div className="flex items-center justify-between gap-4">
                      <span>Payment Status</span>

                      <span
                        className={`shrink-0 rounded-full px-2.5 py-0.5 font-medium ${
                          getPaymentStatus() === "Paid"
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : getPaymentStatus() === "Failed"
                              ? "border border-red-200 bg-red-50 text-red-700"
                              : "border border-amber-200 bg-amber-50 text-amber-700"
                        }`}
                      >
                        {getPaymentStatus()}
                      </span>
                    </div>
                  )}

                  <div
                    className={`flex items-center justify-between gap-4 ${
                      !isResale
                        ? "border-t border-gray-100 pt-3"
                        : ""
                    }`}
                  >
                    <span>Order Date</span>

                    <span className="shrink-0 font-medium text-gray-900">
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