
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";

import { db } from "../firebase/config";
import { Header } from "../components/header";
import { Footer } from "../components/footer";
import { useCart } from "../context/cartContext";
import { type MenuItem } from "../types/menu";
import { CATEGORIES } from "../types/menu";

// ─── Item Card ────────────────────────────────────────────────────────────────

const ItemCard = ({
  item,
  index,
}: {
  item:  MenuItem;
  index: number;
}) => {
  const { addToCart, items } = useCart();
  const [added, setAdded]   = useState(false);

  // How many of this item are already in the cart
  const cartQty = items.find((i) => i.itemId === item.id)?.quantity ?? 0;

  const handleAddToCart = () => {
    addToCart(item);
    
    setAdded(true);
    toast.success(`${item.name} added to cart!`, {
      duration: 1800,
    });
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: "easeOut" }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col"
    >
      {/* Photo */}
      {item.imageUrl ? (
        <div className="w-full overflow-hidden bg-slate-100" style={{ height: 180 }}>
          <motion.img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.04 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      ) : (
        <div
          className="w-full bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center"
          style={{ height: 180 }}
        >
          <span className="text-5xl">🍽️</span>
        </div>
      )}

      {/* Card body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Name + price row */}
        <div className="flex items-start justify-between gap-2">
          <p className="font-playfair font-semibold text-ink text-base leading-tight">{item.name}</p>
          <span className="text-accent font-bold text-sm whitespace-nowrap shrink-0">
            KSh {item.price.toLocaleString()}
          </span>
        </div>

        {/* Description */}
        {item.description && (
          <p className="text-xs text-ink-muted line-clamp-2 flex-1">{item.description}</p>
        )}

        {/* Add to cart button */}
        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          {/* Cart quantity badge — only shown when item is already in cart */}
          {cartQty > 0 && (
            <span className="text-xs font-medium text-orange-600 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-full">
              {cartQty} in cart
            </span>
          )}

          <button
            onClick={handleAddToCart}
            className={`ml-auto inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 active:scale-95 ${
              added
                ? "bg-green-500 text-white shadow-md shadow-green-200"
                : "bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] text-white shadow-md shadow-orange-200 hover:brightness-105"
            }`}
          >
            {added ? "✓ Added!" : cartQty > 0 ? "Add more" : "+ Add to cart"}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Category Menu Page ───────────────────────────────────────────────────────

export const CategoryMenuPage = () => {
  const { categoryId }      = useParams<{ categoryId: string }>();
  const navigate            = useNavigate();
  const [items, setItems]   = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Look up the category label from CATEGORIES constant
  const category = CATEGORIES.find((c) => c.id === categoryId);

  // If the URL has an unknown categoryId, redirect back to menu
  useEffect(() => {
    if (!categoryId || !CATEGORIES.find((c) => c.id === categoryId)) {
      navigate("/menu", { replace: true });
    }
  }, [categoryId, navigate]);

  // ── Real-time listener — only available items ─────────────────────────────
  useEffect(() => {
    if (!categoryId) return;

    const q = query(
      collection(db, "menuItems", categoryId, "items"),
      where("available", "==", true),   // customers only see available items
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setItems(
        snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MenuItem, "id" | "categoryId" | "categoryLabel">),
          categoryId:    categoryId,
          categoryLabel: category?.label ?? categoryId,
        }))
      );
      setLoading(false);
    });

    return () => unsub();
  }, [categoryId, category?.label]);

  return (
    <div className="min-h-screen bg-canvas flex flex-col">
      <Header />

      {/* Toast — same styling as the rest of the app */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 1800,
          style: {
            fontFamily: "DM Sans, sans-serif",
            fontSize:   "14px",
            borderRadius: "12px",
            padding:    "10px 16px",
            boxShadow:  "0 4px 24px rgba(0,0,0,0.08)",
          },
          success: {
            iconTheme: { primary: "rgb(255 68 0)", secondary: "#fff" },
            style: { border: "1px solid #fed7aa" },
          },
        }}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 pt-28 sm:pt-32 pb-16">

        {/* Back button + heading */}
        <div className="mb-8 sm:mb-10">
          <button
            onClick={() => navigate("/menu")}
            className="flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink transition-colors mb-4"
          >
            <span className="text-xl leading-none">←</span> Back to menu
          </button>

          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="font-playfair text-3xl sm:text-4xl font-semibold text-ink">
              Our <span className="text-accent">{category?.label}</span>
            </h1>
            <p className="text-ink-muted mt-1 text-sm">
              {loading
                ? "Loading..."
                : items.length === 0
                ? "No items available right now — check back soon."
                : `${items.length} item${items.length === 1 ? "" : "s"} available`}
            </p>
          </motion.div>
        </div>

        {/* Items grid */}
        {loading ? (
          // Skeleton placeholders while loading
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-slate-100 animate-pulse">
                <div className="bg-slate-100" style={{ height: 180 }} />
                <div className="p-4 flex flex-col gap-3">
                  <div className="h-4 bg-slate-100 rounded w-3/4" />
                  <div className="h-3 bg-slate-100 rounded w-1/2" />
                  <div className="h-8 bg-slate-100 rounded-full w-1/3 mt-2 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🍽️</p>
            <p className="text-ink-muted text-sm">Nothing here yet — check back soon!</p>
            <button
              onClick={() => navigate("/menu")}
              className="mt-5 inline-flex items-center gap-1 rounded-full px-5 py-2.5 text-white text-sm font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md hover:brightness-105 transition-all"
            >
              ← Browse other categories
            </button>
          </div>
        ) : (
          <AnimatePresence>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {items.map((item, index) => (
                <ItemCard key={item.id} item={item} index={index} />
              ))}
            </div>
          </AnimatePresence>
        )}
      </main>

      <Footer />
    </div>
  );
};