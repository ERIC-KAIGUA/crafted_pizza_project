
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../context/AuthContext";
import { subscribeToCustomerOrders } from "../services/orderServices";
import { type Order, type OrderStatus } from "../types/order";



const STATUS_STEPS: { key: OrderStatus; label: string; icon: string }[] = [
  { key: "pending",   label: "Order Received", icon: "✅" },
  { key: "preparing", label: "Being Prepared",  icon: "👨‍🍳" },
  { key: "ready",     label: "Ready",           icon: "🛵" },
  { key: "delivered", label: "Delivered",       icon: "🏠" },
];

const STATUS_ORDER: OrderStatus[] = ["pending", "preparing", "ready", "delivered"];

const getStepIndex = (status: OrderStatus): number =>
  STATUS_ORDER.indexOf(status);

// ─── Status Tracker ───────────────────────────────────────────────────────────

const StatusTracker = ({ status }: { status: OrderStatus }) => {
  // Special cases — not part of the progress pipeline
  if (status === "awaiting_payment") {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="w-4 h-4 rounded-full border-2 border-orange-400 border-t-transparent animate-spin shrink-0" />
        <span className="text-sm text-orange-600 font-medium">Awaiting M-Pesa payment...</span>
      </div>
    );
  }

  if (status === "payment_failed") {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-red-500 text-lg">✗</span>
        <span className="text-sm text-red-600 font-medium">Payment failed</span>
      </div>
    );
  }

  if (status === "cancelled") {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="text-slate-400 text-lg">✗</span>
        <span className="text-sm text-slate-500 font-medium">Order cancelled</span>
      </div>
    );
  }

  const currentIndex = getStepIndex(status);

  return (
    <div className="flex items-center gap-1 sm:gap-2 mt-1">
      {STATUS_STEPS.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isCurrent   = i === currentIndex;
      

        return (
          <div key={step.key} className="flex items-center gap-1 sm:gap-2 flex-1 min-w-0">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <motion.div
                animate={isCurrent ? { scale: [1, 1.15, 1] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                  isCompleted
                    ? "bg-green-500 border-green-500 text-white"
                    : isCurrent
                    ? "bg-accent border-accent text-white"
                    : "bg-white border-slate-200 text-slate-300"
                }`}
              >
                {isCompleted ? "✓" : step.icon}
              </motion.div>
              <span className={`text-[10px] text-center leading-tight hidden sm:block ${
                isCurrent ? "text-accent font-semibold" :
                isCompleted ? "text-green-600" : "text-slate-400"
              }`}>
                {step.label}
              </span>
            </div>

            {/* Connector line — not shown after last step */}
            {i < STATUS_STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 rounded-full transition-all ${
                isCompleted ? "bg-green-400" : "bg-slate-200"
              }`} />
            )}
          </div>
        );
      })}
    </div>
  );
};

// ─── Order Card ───────────────────────────────────────────────────────────────

const OrderCard = ({ order, index }: { order: Order; index: number }) => {
  const navigate    = useNavigate();
  const [open, setOpen] = useState(index === 0); // first order expanded by default

  const date = order.createdAt
    ? new Date(order.createdAt.seconds * 1000).toLocaleDateString("en-KE", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : "Just now";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.06 }}
      className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
    >
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left"
      >
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-semibold text-ink-muted">
              #{order.id.slice(0, 8).toUpperCase()}
            </span>
            <span className="text-xs text-ink-subtle">{date}</span>
          </div>
          <p className="text-sm font-semibold text-ink mt-0.5">
            {order.items?.length} item{order.items?.length !== 1 ? "s" : ""} ·{" "}
            <span className="text-accent">KSh {order.total?.toLocaleString()}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 ml-2">
          {/* Live status pill */}
          {order.status === "delivered" ? (
            <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2.5 py-1 rounded-full font-medium">
              Delivered ✓
            </span>
          ) : order.status === "payment_failed" ? (
            <span className="text-xs bg-red-100 text-red-600 border border-red-200 px-2.5 py-1 rounded-full font-medium">
              Failed
            </span>
          ) : order.status === "awaiting_payment" ? (
            <span className="text-xs bg-orange-100 text-orange-600 border border-orange-200 px-2.5 py-1 rounded-full font-medium animate-pulse">
              Awaiting payment
            </span>
          ) : (
            <span className="text-xs bg-blue-100 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full font-medium capitalize">
              {order.status?.replace("_", " ")}
            </span>
          )}

          {/* Expand chevron */}
          <span className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
            ▾
          </span>
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-5 flex flex-col gap-4 border-t border-slate-100 pt-4">

              {/* Status tracker */}
              <StatusTracker status={order.status} />

              {/* Items list */}
              <div className="flex flex-col gap-2">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                      )}
                      <span className="text-ink truncate">
                        {item.quantity}× {item.name}
                      </span>
                    </div>
                    <span className="text-ink-muted shrink-0">
                      KSh {(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}

                <div className="border-t border-slate-100 pt-2 flex justify-between font-semibold text-sm mt-1">
                  <span className="text-ink">Total</span>
                  <span className="text-accent">KSh {order.total?.toLocaleString()}</span>
                </div>
              </div>

              {/* Delivery info */}
              {order.delivery && (
                <div className="bg-slate-50 rounded-xl p-3 text-xs text-ink-muted flex flex-col gap-1">
                  <p><span className="font-medium text-ink">Delivering to:</span> {order.delivery.deliveryAddress}</p>
                  {order.delivery.deliveryNotes && (
                    <p><span className="font-medium text-ink">Notes:</span> {order.delivery.deliveryNotes}</p>
                  )}
                </div>
              )}

              {/* M-Pesa receipt */}
              {order.mpesaReceiptNo && (
                <p className="text-xs text-green-700 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                  M-Pesa Receipt: <span className="font-mono font-bold">{order.mpesaReceiptNo}</span>
                </p>
              )}

              {/* Retry button for failed payments */}
              {order.status === "payment_failed" && (
                <button
                  onClick={() => navigate("/cart")}
                  className="self-start rounded-full px-4 py-2 text-sm text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] hover:brightness-105 active:scale-95 transition-all"
                >
                  Try again →
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ─── Customer Orders Page ─────────────────────────────────────────────────────

export const CustomerOrdersPage = () => {
  const navigate          = useNavigate();
  const { user }          = useAuth();
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Redirect if not signed in
  useEffect(() => {
    if (!user) { navigate("/", { replace: true }); return; }
  }, [user, navigate]);

  // Real-time subscription to customer's orders
  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToCustomerOrders(user.uid, (updatedOrders) => {
      setOrders(updatedOrders);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const activeOrders    = orders.filter((o) =>
    !["delivered", "cancelled", "payment_failed"].includes(o.status)
  );
  const completedOrders = orders.filter((o) =>
    ["delivered", "cancelled", "payment_failed"].includes(o.status)
  );

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-32 pb-16">

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-playfair text-3xl sm:text-4xl font-semibold text-ink">
            My <span className="text-accent">Orders</span>
          </h1>
          <p className="text-ink-muted mt-1 text-sm">
            Track your orders in real-time — this page updates automatically.
          </p>
        </motion.div>

        {loading ? (
          <div className="flex flex-col gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-ink-muted text-sm mb-6">You haven't placed any orders yet.</p>
            <button
              onClick={() => navigate("/menu")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md hover:brightness-105 active:scale-95 transition-all"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-6">

            {/* Active orders */}
            {activeOrders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
                  Active Orders ({activeOrders.length})
                </p>
                <div className="flex flex-col gap-3">
                  {activeOrders.map((order, i) => (
                    <OrderCard key={order.id} order={order} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Past orders */}
            {completedOrders.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-ink-muted uppercase tracking-wide mb-3">
                  Past Orders ({completedOrders.length})
                </p>
                <div className="flex flex-col gap-3">
                  {completedOrders.map((order, i) => (
                    <OrderCard key={order.id} order={order} index={i} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};