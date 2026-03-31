
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useCart } from "../context/cartContext";
import { type CartItem } from "../types/cart";

// ─── Quantity Control ─────────────────────────────────────────────────────────
// The − number + stepper shown on each cart row.

const QuantityControl = ({
  quantity,
  onDecrement,
  onIncrement,
}: {
  quantity:    number;
  onDecrement: () => void;
  onIncrement: () => void;
}) => (
  <div className="flex items-center gap-1">
    <button
      onClick={onDecrement}
      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-ink-muted hover:border-accent hover:text-accent transition-all duration-150 active:scale-90 text-lg leading-none"
      aria-label="Decrease quantity"
    >
      −
    </button>
    <span className="w-7 text-center font-semibold text-ink text-sm tabular-nums">
      {quantity}
    </span>
    <button
      onClick={onIncrement}
      className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-ink-muted hover:border-accent hover:text-accent transition-all duration-150 active:scale-90 text-lg leading-none"
      aria-label="Increase quantity"
    >
      +
    </button>
  </div>
);

// ─── Cart Item Row ────────────────────────────────────────────────────────────
// Horizontal card — photo | name + price | quantity control | remove

const CartItemRow = ({
  item,
  index,
}: {
  item:  CartItem;
  index: number;
}) => {
  const { updateQuantity, removeFromCart } = useCart();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16, transition: { duration: 0.2 } }}
      transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
      className="flex items-center gap-3 sm:gap-4 bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-slate-100"
    >
      {/* Photo */}
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            🍽️
          </div>
        )}
      </div>

      {/* Name + unit price */}
      <div className="flex-1 min-w-0">
        <p className="font-playfair font-semibold text-ink text-sm sm:text-base truncate">
          {item.name}
        </p>
        <p className="text-xs text-ink-muted mt-0.5">
          KSh {item.price.toLocaleString()} each
        </p>
        {/* Line total — visible on all screen sizes */}
        <p className="text-sm font-bold text-accent mt-1">
          KSh {(item.price * item.quantity).toLocaleString()}
        </p>
      </div>

      {/* Right side: quantity control + remove */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <QuantityControl
          quantity={item.quantity}
          onDecrement={() => updateQuantity(item.itemId, item.quantity - 1)}
          onIncrement={() => updateQuantity(item.itemId, item.quantity + 1)}
        />

        {/* Remove button */}
        <button
          onClick={() => removeFromCart(item.itemId)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-slate-300 hover:text-red-400 hover:bg-red-50 transition-all duration-150 active:scale-90"
          aria-label={`Remove ${item.name} from cart`}
        >
          {/* Trash icon */}
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
};

// ─── Totals Card ──────────────────────────────────────────────────────────────

const TotalsCard = ({
  totalItems,
  totalPrice,
}: {
  totalItems: number;
  totalPrice: number;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.35, delay: 0.1 }}
    className="bg-white rounded-2xl p-5 shadow-sm border-2 border-dashed border-orange-200"
  >
    <h2 className="font-playfair text-lg font-semibold text-ink mb-4">Order Summary</h2>

    <div className="flex flex-col gap-2">
      {/* Item count row */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">
          {totalItems} item{totalItems !== 1 ? "s" : ""}
        </span>
        <span className="text-ink font-medium">KSh {totalPrice.toLocaleString()}</span>
      </div>

      {/* Delivery row — placeholder, can be dynamic later */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">Delivery fee</span>
        <span className="text-green-600 font-medium text-xs">Calculated at checkout</span>
      </div>

      {/* Divider */}
      <div className="border-t border-slate-100 my-1" />

      {/* Total row */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-ink">Total</span>
        <span className="font-playfair font-bold text-xl text-accent">
          KSh {totalPrice.toLocaleString()}
        </span>
      </div>
    </div>
  </motion.div>
);

// ─── Cart Page ────────────────────────────────────────────────────────────────

export const CartPage = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice } = useCart();

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-32 pb-16">

        {/* Page heading */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="font-playfair text-3xl sm:text-4xl font-semibold text-ink">
            Your <span className="text-accent">Cart</span>
          </h1>
          <p className="text-ink-muted mt-1 text-sm">
            {totalItems === 0
              ? "Your cart is empty."
              : `${totalItems} item${totalItems !== 1 ? "s" : ""} ready to order`}
          </p>
        </motion.div>

        {/* Empty state */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-6xl mb-4">🛒</p>
            <p className="text-ink-muted text-sm mb-6">
              Nothing here yet — head to the menu and add some items!
            </p>
            <button
              onClick={() => navigate("/menu")}
              className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-300/30 hover:brightness-105 active:scale-95 transition-all"
            >
              Browse Menu
            </button>
          </motion.div>
        ) : (
          <div className="flex flex-col gap-5">

            {/* Cart item rows */}
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {items.map((item, index) => (
                  <CartItemRow key={item.itemId} item={item} index={index} />
                ))}
              </AnimatePresence>
            </div>

            {/* Totals card */}
            <TotalsCard totalItems={totalItems} totalPrice={totalPrice} />

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 mt-1"
            >
              {/* Add more items — goes back to the menu */}
              <button
                onClick={() => navigate("/menu")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-ink font-medium border-2 border-slate-200 hover:border-accent hover:text-accent transition-all duration-200 active:scale-95"
              >
                ← Add more items
              </button>

              {/* Checkout — wired up in the next step */}
              <button
                onClick={() => navigate("/checkout")}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-300/30 hover:brightness-105 active:scale-95 transition-all"
              >
                Checkout →
              </button>
            </motion.div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};