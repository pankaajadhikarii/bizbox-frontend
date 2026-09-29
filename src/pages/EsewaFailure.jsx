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
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:rounded-3xl sm:p-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 sm:h-14 sm:w-14">
            <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
          </div>

          <h1 className="mt-4 break-words text-lg font-semibold text-gray-900 sm:text-xl">
            Payment cancelled or failed
          </h1>

          <p className="mx-auto mt-2 max-w-sm break-words text-sm leading-6 text-gray-500">
            Your eSewa payment was not completed. If eSewa showed a login error,
            use a sandbox wallet (9806800001 / Nepal@123 / 123456), not a live
            eSewa or Bizkit account. A private window avoids autofill.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-left text-sm leading-6 text-red-700">
              {error}
            </div>
          )}

          <div className="mt-5 flex w-full flex-col items-center gap-3 sm:mt-6">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 sm:py-2.5"
            >
              <RotateCcw className="h-4 w-4 shrink-0" />
              <span className="break-words">
                {retrying ? "Redirecting to eSewa..." : "Retry eSewa payment"}
              </span>
            </button>

            <Link
              to="/orders"
              className="inline-flex items-center justify-center gap-1.5 py-1 text-sm font-medium text-gray-500 transition-colors hover:text-black"
            >
              <ArrowLeft className="h-4 w-4 shrink-0" />
              Back to orders
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default EsewaFailure;