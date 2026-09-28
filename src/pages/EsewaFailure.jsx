import { useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowLeft, RotateCcw } from "lucide-react";
import paymentService, { postToEsewa } from "../services/paymentService";

const EsewaFailure = () => {
  const [retrying, setRetrying] = useState(false);
  const [error, setError] = useState("");

  const handleRetry = async () => {
    const orderId = Number(sessionStorage.getItem("esewaOrderId"));

    if (!orderId) {
      setError("We could not find the order to retry. Please place a new order.");
      return;
    }

    try {
      setRetrying(true);
      setError("");

      const { paymentUrl, fields } = await paymentService.initiateEsewa(orderId);
      postToEsewa(paymentUrl, fields);
    } catch (err) {
      setRetrying(false);
      setError(
        err.userMessage ||
          err.response?.data?.message ||
          "Unable to restart eSewa payment. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-8 sm:py-10">
      <div className="mx-auto max-w-lg px-4 sm:px-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-600">
            <AlertCircle className="h-7 w-7" />
          </div>

          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Payment cancelled or failed
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Your eSewa payment was not completed. If eSewa showed a login error,
            use a sandbox wallet (9806800001 / Nepal@123 / 123456), not a live
            eSewa or Bizkit account. A private window avoids autofill.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="mt-6 flex flex-col items-center gap-3">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              {retrying ? "Redirecting to eSewa..." : "Retry eSewa payment"}
            </button>

            <Link
              to="/orders"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 transition hover:text-black"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EsewaFailure;
