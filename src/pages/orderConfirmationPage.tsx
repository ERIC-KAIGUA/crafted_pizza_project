
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { subscribeToOrder } from "../services/orderServices";
import { type Order } from "../types/order";
import { Header } from "../components/header";



const AwaitingPayment = ({ order }: { order: Order }) => (
  <motion.div
    key="awaiting"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center text-center gap-5"
  >
    {/* Pulsing M-Pesa indicator */}
    <div className="relative w-20 h-20 flex items-center justify-center">
      <span className="absolute inline-flex w-full h-full rounded-full bg-green-300 opacity-60 animate-ping" />
      <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center">
        <span className="text-white font-bold text-xs leading-tight text-center">M-PESA</span>
      </div>
    </div>

    <div>
      <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-ink">
        Check Your Phone
      </h1>
      <p className="text-ink-muted mt-2 text-sm max-w-sm">
        We've sent an M-Pesa payment request to{" "}
        <span className="font-semibold text-ink">{order.delivery?.customerPhone}</span>.
        Enter your PIN to complete the payment.
      </p>
    </div>

    {/* Order reference */}
    <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-200">
      <p className="text-xs text-ink-muted">Order reference</p>
      <p className="font-mono font-semibold text-ink text-sm mt-0.5">
        #{order.id.slice(0, 8).toUpperCase()}
      </p>
    </div>

    {/* Amount */}
    <div className="text-center">
      <p className="text-xs text-ink-muted">Amount to pay</p>
      <p className="font-playfair font-bold text-3xl text-accent mt-0.5">
        KSh {order.total?.toLocaleString()}
      </p>
    </div>

    <p className="text-xs text-ink-subtle max-w-xs">
      This page will update automatically once your payment is confirmed. Do not close this tab.
    </p>

    {/* Spinner */}
    <div className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-accent animate-spin" />
  </motion.div>
);


const PaymentSuccess = ({
  order,
  onGoHome,
}: {
  order:     Order;
  onGoHome:  () => void;
}) => (
  <motion.div
    key="success"
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center text-center gap-5"
  >
    {/* Success checkmark */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20, delay: 0.1 }}
      className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-200"
    >
      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
      </svg>
    </motion.div>

    <div>
      <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-ink">
        Order Placed!
      </h1>
      <p className="text-ink-muted mt-2 text-sm">
        Payment confirmed. Your order is now with the kitchen.
      </p>
    </div>

    {/* M-Pesa receipt if available */}
    {order.mpesaReceiptNo && (
      <div className="bg-green-50 rounded-xl px-5 py-3 border border-green-200">
        <p className="text-xs text-green-700">M-Pesa Receipt No.</p>
        <p className="font-mono font-bold text-green-800 mt-0.5">{order.mpesaReceiptNo}</p>
      </div>
    )}

    {/* Order reference */}
    <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-200">
      <p className="text-xs text-ink-muted">Order reference</p>
      <p className="font-mono font-semibold text-ink text-sm mt-0.5">
        #{order.id.slice(0, 8).toUpperCase()}
      </p>
    </div>

    {/* Items recap */}
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-100 shadow-sm text-left">
      <p className="text-xs font-medium text-ink-muted mb-3">What you ordered</p>
      <div className="flex flex-col gap-2">
        {order.items?.map((item, i) => (
          <div key={i} className="flex items-center justify-between text-sm">
            <span className="text-ink">
              {item.quantity}× {item.name}
            </span>
            <span className="font-medium text-ink-muted">
              KSh {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
        <div className="border-t border-slate-100 mt-1 pt-2 flex justify-between font-semibold text-sm">
          <span className="text-ink">Total paid</span>
          <span className="text-accent">KSh {order.total?.toLocaleString()}</span>
        </div>
      </div>
    </div>

    {/* Estimated time */}
    <div className="flex items-center gap-2 text-sm text-ink-muted">
      <span className="text-lg">🕐</span>
      Estimated delivery: <span className="font-semibold text-ink">30 – 45 minutes</span>
    </div>

    <button
      onClick={onGoHome}
      className="mt-2 rounded-full px-8 py-3 text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-300/30 hover:brightness-105 active:scale-95 transition-all"
    >
      Back to Home
    </button>
  </motion.div>
);


const PaymentFailed = ({
  order,
  onRetry,
  onGoHome,
}: {
  order:     Order;
  onRetry:   () => void;
  onGoHome:  () => void;
}) => (
  <motion.div
    key="failed"
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0 }}
    className="flex flex-col items-center text-center gap-5"
  >
    {/* Failure icon */}
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      className="w-20 h-20 rounded-full bg-red-100 border-2 border-red-200 flex items-center justify-center"
    >
      <svg className="w-9 h-9 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </motion.div>

    <div>
      <h1 className="font-playfair text-2xl sm:text-3xl font-semibold text-ink">
        Payment Failed
      </h1>
      <p className="text-ink-muted mt-2 text-sm max-w-sm">
        The M-Pesa payment was not completed. Your cart has been saved — you can try again.
      </p>
    </div>

    <div className="bg-slate-50 rounded-xl px-5 py-3 border border-slate-200">
      <p className="text-xs text-ink-muted">Order reference</p>
      <p className="font-mono font-semibold text-ink text-sm mt-0.5">
        #{order.id.slice(0, 8).toUpperCase()}
      </p>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
      <button
        onClick={onRetry}
        className="flex-1 rounded-full py-3 text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md hover:brightness-105 active:scale-95 transition-all text-sm"
      >
        Try Again
      </button>
      <button
        onClick={onGoHome}
        className="flex-1 rounded-full py-3 text-ink-muted font-medium border-2 border-slate-200 hover:border-slate-400 active:scale-95 transition-all text-sm"
      >
        Go Home
      </button>
    </div>
  </motion.div>
);



export const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate    = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!orderId) { navigate("/", { replace: true }); return; }

    
    const unsub = subscribeToOrder(orderId, (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => unsub();
  }, [orderId, navigate]);

  // Still loading
  if (!order) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-4 border-slate-200 border-t-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      <main className="flex-1 flex items-center justify-center px-4 pt-28 pb-16">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {(order.status === "awaiting_payment") && (
              <AwaitingPayment key="awaiting" order={order} />
            )}
            {(order.status === "pending" || order.status === "preparing" ||
              order.status === "ready"   || order.status === "delivered") && (
              <PaymentSuccess
                key="success"
                order={order}
                onGoHome={() => navigate("/")}
              />
            )}
            {order.status === "payment_failed" && (
              <PaymentFailed
                key="failed"
                order={order}
                onRetry={() => navigate("/cart")}
                onGoHome={() => navigate("/")}
              />
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};