import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import paymentService from "../services/paymentService";

// const PAYMENT_STATUS = {
//   SUCCESS: 1,
// };

const verifyRequests = new Map();

const clearEsewaSession = () => {
  sessionStorage.removeItem("esewaOrderId");
  sessionStorage.removeItem("esewaOrderNumber");
};

const EsewaSuccess = () => {
  const [status, setStatus] = useState("verifying");
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("data");

    if (!data) {
      setStatus("error");
      setError(
        "Missing payment data from eSewa. Please return to your orders and try again.",
      );
      return;
    }

    let request = verifyRequests.get(data);

    if (!request) {
      request = (async () => {
        const result = await paymentService.verifyEsewa(data);
        const paid =
          result?.status === "COMPLETE" ||
          result?.status === "SUCCESS" ||
          result?.status === 1;

        if (paid) {
          clearEsewaSession();
          window.dispatchEvent(new Event("cart-updated"));
        }

        return {
          payment: result,
          status: paid ? "paid" : "failed",
          error: paid
            ? ""
            : "Payment was not completed. You can retry from the failure page or your orders.",
        };
      })().catch((err) => ({
        payment: null,
        status: "error",
        error:
          err.userMessage ||
          err.response?.data?.message ||
          "Unable to verify this payment. Please try again.",
      }));

      verifyRequests.set(data, request);
    }

    let cancelled = false;

    request.then((next) => {
      if (cancelled) return;
      setPayment(next.payment);
      setStatus(next.status);
      setError(next.error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const orderId =
    payment?.orderId || Number(sessionStorage.getItem("esewaOrderId")) || null;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-10 lg:py-14">
      <div className="mx-auto w-full max-w-lg">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 text-center shadow-sm sm:rounded-3xl sm:p-8">
          {status === "verifying" && (
            <>
              <Loader2 className="mx-auto h-9 w-9 animate-spin text-gray-400 sm:h-10 sm:w-10" />

              <h1 className="mt-4 break-words text-lg font-semibold text-gray-900 sm:text-xl">
                Verifying payment
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Please wait while we confirm your eSewa payment.
              </p>
            </>
          )}

          {status === "paid" && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 sm:h-14 sm:w-14">
                <CheckCircle2 className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <h1 className="mt-4 break-words text-lg font-semibold text-gray-900 sm:text-xl">
                Payment successful
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Your eSewa payment has been confirmed. Your order is now paid.
              </p>

              {orderId ? (
                <Link
                  to={`/orders/${orderId}`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:mt-6 sm:w-auto sm:py-2.5"
                >
                  View order
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              ) : (
                <Link
                  to="/orders"
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:mt-6 sm:w-auto sm:py-2.5"
                >
                  View orders
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </Link>
              )}
            </>
          )}

          {(status === "failed" || status === "error") && (
            <>
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-50 text-red-600 sm:h-14 sm:w-14">
                <AlertCircle className="h-6 w-6 sm:h-7 sm:w-7" />
              </div>

              <h1 className="mt-4 break-words text-lg font-semibold text-gray-900 sm:text-xl">
                Could not confirm payment
              </h1>

              <p className="mx-auto mt-2 max-w-sm break-words text-sm leading-6 text-gray-500">
                {error}
              </p>

              <div className="mt-5 flex w-full flex-col gap-3 sm:mt-6 sm:flex-row sm:justify-center">
                <Link
                  to="/payment/esewa/failure"
                  className="inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:w-auto sm:py-2.5"
                >
                  Retry payment
                </Link>

                <Link
                  to="/orders"
                  className="inline-flex w-full items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:w-auto sm:py-2.5"
                >
                  Go to orders
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
};

export default EsewaSuccess;