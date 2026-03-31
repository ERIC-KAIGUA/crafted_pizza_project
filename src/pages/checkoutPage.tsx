import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import toast, { Toaster } from "react-hot-toast";

import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/cartContext";
import { placeOrder } from "../services/orderServices";
import {
  type CheckoutFormData,
  EMPTY_CHECKOUT_FORM,
} from "../types/order";


const FormField = ({
  label,
  required,
  hint,
  children,
}: {
  label:     string;
  required?: boolean;
  hint?:     string;
  children:  React.ReactNode;
}) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs font-medium text-ink-muted">
      {label} {required && <span className="text-accent">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-ink-subtle">{hint}</p>}
  </div>
);



const OrderSummary = () => {
  const { items, totalItems, totalPrice } = useCart();

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 sticky top-28">
      <h2 className="font-playfair text-lg font-semibold text-ink mb-4">
        Order Summary
      </h2>

      {/* Item list */}
      <div className="flex flex-col gap-3 mb-4">
        {items.map((item) => (
          <div key={item.itemId} className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 shrink-0">
              {item.imageUrl ? (
                <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink truncate">{item.name}</p>
              <p className="text-xs text-ink-muted">× {item.quantity}</p>
            </div>
            <span className="text-sm font-semibold text-ink shrink-0">
              KSh {(item.price * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 pt-4 flex flex-col gap-2">
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">{totalItems} item{totalItems !== 1 ? "s" : ""}</span>
          <span className="text-ink">KSh {totalPrice.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-ink-muted">Delivery</span>
          <span className="text-xs text-green-600 font-medium">Calculated on delivery</span>
        </div>
        <div className="border-t border-slate-100 pt-2 flex justify-between items-center">
          <span className="font-semibold text-ink">Total</span>
          <span className="font-playfair font-bold text-xl text-accent">
            KSh {totalPrice.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};



export const CheckoutPage = () => {
  const navigate            = useNavigate();
  const { user }            = useAuth();
  const { items, totalPrice, clearCart } = useCart();

  const [formData, setFormData] = useState<CheckoutFormData>(EMPTY_CHECKOUT_FORM);
  const [placing, setPlacing]   = useState(false);

  // ── Guards ────────────────────────────────────────────────────────────────
  // Redirect if not signed in or cart is empty
  useEffect(() => {
    if (!user) { navigate("/", { replace: true }); return; }
    if (items.length === 0) { navigate("/orders", { replace: true }); return; }
  }, [user, items, navigate]);

  // Pre-fill name from Google account if available
  useEffect(() => {
    if (user?.displayName && !formData.customerName) {
      setFormData((prev) => ({ ...prev, customerName: user.displayName ?? "" }));
    }
  }, [user]);

  // ── Field helper ──────────────────────────────────────────────────────────
  const set = (field: keyof CheckoutFormData) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (): boolean => {
    if (!formData.customerName.trim()) {
      toast.error("Please enter your name."); return false;
    }
    const phone = formData.customerPhone.replace(/\s+/g, "");
    if (!phone || !/^(07|01|2547|2541|\+2547|\+2541)\d{8}$/.test(phone)) {
      toast.error("Please enter a valid Kenyan phone number (e.g. 0712345678)."); return false;
    }
    if (!formData.deliveryAddress.trim()) {
      toast.error("Please enter a delivery address."); return false;
    }
    return true;
  };

  // ── Place order ───────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!validate()) return;
    if (!user) return;

    setPlacing(true);
    try {
      const orderId = await placeOrder({
        customerId:    user.uid,
        customerEmail: user.email ?? "",
        cartItems:     items,
        total:         totalPrice,
        formData,
      });

      clearCart();
      navigate(`/order-confirmation/${orderId}`, { replace: true });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again.";
      toast.error(message);
    } finally {
      setPlacing(false);
    }
  };

  if (!user || items.length === 0) return null;

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "DM Sans, sans-serif", fontSize: "14px", borderRadius: "12px" },
          error: { style: { border: "1px solid #fecaca" } },
        }}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-32 pb-16">

        {/* Heading */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <button onClick={() => navigate("/cart")}
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-3">
            <span className="text-lg leading-none">←</span> Back to cart
          </button>
          <h1 className="font-playfair text-3xl sm:text-4xl font-semibold text-ink">
            Checkout
          </h1>
          <p className="text-ink-muted mt-1 text-sm">Fill in your delivery details to place your order.</p>
        </motion.div>

        {/* Two-column layout: form left, summary right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

          {/* ── Delivery form (2/3 width on desktop) ── */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 flex flex-col gap-5"
          >

            {/* Delivery details card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <h2 className="font-playfair text-lg font-semibold text-ink mb-5">
                Delivery Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Full Name" required>
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="John Kamau"
                    value={formData.customerName}
                    onChange={set("customerName")} />
                </FormField>

                <FormField
                  label="M-Pesa Phone Number" required
                  hint="The number that will receive the STK push"
                >
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300"
                    placeholder="0712 345 678"
                    type="tel"
                    value={formData.customerPhone}
                    onChange={set("customerPhone")} />
                </FormField>

                <FormField label="Delivery Address" required hint="Estate, street, building name">
                  <input
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300 sm:col-span-2"
                    placeholder="e.g. Nakuru CBD, Kenyatta Avenue, Fahari Plaza"
                    value={formData.deliveryAddress}
                    onChange={set("deliveryAddress")} />
                </FormField>

                <div className="col-span-1 sm:col-span-2">
                  <FormField label="Delivery Notes" hint="Gate number, landmark, or any helpful instructions">
                    <textarea
                      className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
                      placeholder="e.g. Blue gate, next to Equity Bank"
                      rows={2}
                      value={formData.deliveryNotes}
                      onChange={set("deliveryNotes")} />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Payment method card */}
            <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-100">
              <h2 className="font-playfair text-lg font-semibold text-ink mb-4">
                Payment Method
              </h2>

              {/* M-Pesa option — only option for now */}
              <div className="flex items-center gap-4 p-4 rounded-xl border-2 border-green-400 bg-green-50">
                {/* M-Pesa logo placeholder */}
                <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-xs leading-tight text-center">M-PESA</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-ink text-sm">M-Pesa (STK Push)</p>
                  <p className="text-xs text-ink-muted mt-0.5">
                    You'll receive a payment prompt on <span className="font-medium">{formData.customerPhone || "your phone"}</span>
                  </p>
                </div>
                {/* Selected indicator */}
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>

              <p className="text-xs text-ink-subtle mt-3">
                After placing your order, enter your M-Pesa PIN on the prompt sent to your phone to complete payment.
              </p>
            </div>

            {/* Place order button — full width on mobile, shown below form */}
            <motion.button
              onClick={handlePlaceOrder}
              disabled={placing}
              whileTap={{ scale: 0.97 }}
              className="lg:hidden w-full rounded-full py-3.5 text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-300/30 hover:brightness-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Placing order...
                </>
              ) : (
                <>Pay KSh {totalPrice.toLocaleString()} with M-Pesa</>
              )}
            </motion.button>
          </motion.div>

          {/* ── Order summary (1/3 width on desktop) ── */}
          <div className="hidden lg:block">
            <OrderSummary />

            {/* Place order button — desktop */}
            <motion.button
              onClick={handlePlaceOrder}
              disabled={placing}
              whileTap={{ scale: 0.97 }}
              className="mt-4 w-full rounded-full py-3.5 text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-300/30 hover:brightness-105 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {placing ? (
                <>
                  <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  Placing order...
                </>
              ) : (
                <>Pay KSh {totalPrice.toLocaleString()} with M-Pesa</>
              )}
            </motion.button>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
};