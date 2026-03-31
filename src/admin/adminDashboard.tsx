// src/admin/adminDashboard.tsx
import { useState, useEffect, useRef } from "react";
import { AdminHeader } from "../components/adminHeader";
import { db } from "../firebase/config";
import {
  collection,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from "firebase/firestore";
import { motion, AnimatePresence } from "motion/react";
import toast, { Toaster } from "react-hot-toast";

import { type MenuItem, type MenuItemFormData, CATEGORIES, EMPTY_FORM } from "../types/menu";
import { type Order, type OrderStatus } from "../types/order";
import {
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuItemAvailability,
} from "../services/menuServices";
import { simulatePaymentSuccess } from "../services/orderServices";

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub 
}: {
  label: string; value: string | number; sub?: string; 
}) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className="relative flex flex-col gap-2 rounded-2xl p-4 sm:p-5 border-2 border-dashed border-orange-300/60 bg-white/60 backdrop-blur-sm shadow-sm hover:border-orange-400 hover:shadow-md transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-medium text-ink-muted bg-orange-50 px-2 py-0.5 rounded-full">Live</span>
    </div>
    <div>
      <p className="text-xl sm:text-3xl font-playfair font-bold text-ink break-words">{value}</p>
      <p className="text-xs sm:text-sm font-medium text-ink-muted mt-0.5">{label}</p>
      {sub && <p className="text-xs text-ink-subtle mt-1 hidden sm:block">{sub}</p>}
    </div>
  </motion.div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────

const statusColors: Record<string, string> = {
  awaiting_payment: "bg-orange-100 text-orange-600 border-orange-300",
  payment_failed:   "bg-red-100 text-red-500 border-red-300",
  pending:          "bg-yellow-100 text-yellow-700 border-yellow-300",
  preparing:        "bg-blue-100 text-blue-700 border-blue-300",
  ready:            "bg-green-100 text-green-700 border-green-300",
  delivered:        "bg-gray-100 text-gray-600 border-gray-300",
  cancelled:        "bg-red-100 text-red-600 border-red-300",
};

const StatusBadge = ({ status }: { status: string }) => (
  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize whitespace-nowrap ${statusColors[status] ?? "bg-slate-100 text-slate-600 border-slate-300"}`}>
    {status.replace("_", " ")}
  </span>
);

// ─── New Order Banner ─────────────────────────────────────────────────────────
// Shown at the top of the dashboard when a new paid order arrives.
// Auto-dismisses after 12 seconds. Admin can also dismiss manually
// or jump straight to the Orders tab.

const NewOrderBanner = ({
  order,
  onDismiss,
  onView,
}: {
  order:     Order;
  onDismiss: () => void;
  onView:    () => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: -60 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -60 }}
    transition={{ type: "spring", stiffness: 300, damping: 28 }}
    className="fixed top-20 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-lg"
  >
    <div className="bg-white rounded-2xl shadow-2xl shadow-orange-200/60 border-2 border-orange-300 p-4 flex items-start gap-4">
      {/* Pulsing bell */}
      <div className="relative shrink-0 w-11 h-11 rounded-full bg-orange-100 flex items-center justify-center">
        <motion.span
          animate={{ rotate: [0, -20, 20, -15, 15, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 2 }}
          className="text-xl"
        >
          🔔
        </motion.span>
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-white animate-ping" />
        <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-accent border-2 border-white" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-ink text-sm">New Order!</p>
        <p className="text-xs text-ink-muted mt-0.5">
          {order.delivery?.customerName || order.customerEmail} ·{" "}
          <span className="font-semibold text-accent">KSh {order.total?.toLocaleString()}</span>
        </p>
        {/* Item chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {order.items?.slice(0, 3).map((item, i) => (
            <span key={i} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2 py-0.5">
              {item.quantity}× {item.name}
            </span>
          ))}
          {(order.items?.length ?? 0) > 3 && (
            <span className="text-xs text-ink-muted">+{order.items.length - 3} more</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={onView}
          className="rounded-full px-3 py-1.5 text-xs text-white font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] hover:brightness-105 active:scale-95 transition-all whitespace-nowrap"
        >
          View Order
        </button>
        <button
          onClick={onDismiss}
          className="rounded-full px-3 py-1.5 text-xs text-ink-muted font-medium border border-slate-200 hover:border-slate-400 transition-all"
        >
          Dismiss
        </button>
      </div>
    </div>
  </motion.div>
);

// ─── Image Upload Field ───────────────────────────────────────────────────────

const ImageUploadField = ({
  currentImageUrl,
  onFileSelected,
}: {
  currentImageUrl?: string;
  onFileSelected: (file: File | null) => void;
}) => {
  const [preview, setPreview]   = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (!file) return;
    onFileSelected(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] ?? null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files?.[0] ?? null);
  };

  const displayUrl = preview || currentImageUrl;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-medium text-ink-muted">Photo</label>

      {displayUrl ? (
        <div className="relative w-full rounded-xl overflow-hidden group border border-slate-200">
          <img src={displayUrl} alt="Preview" className="w-full h-32 object-cover" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button type="button" onClick={() => inputRef.current?.click()}
              className="text-xs bg-white/90 text-ink rounded-full px-3 py-1.5 font-medium hover:bg-white transition-all">
              Change
            </button>
            <button type="button" onClick={() => { setPreview(null); onFileSelected(null); }}
              className="text-xs bg-white/90 text-red-600 rounded-full px-3 py-1.5 font-medium hover:bg-white transition-all">
              Remove
            </button>
          </div>
          <span className="absolute top-2 right-2 text-[10px] bg-white/80 text-ink-muted px-1.5 py-0.5 rounded font-mono">WebP</span>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 cursor-pointer transition-all duration-200 py-8 ${
            dragging
              ? "border-orange-400 bg-orange-50"
              : "border-slate-200 hover:border-orange-300 hover:bg-orange-50/40"
          }`}
        >
          <span className="text-3xl">🖼️</span>
          <p className="text-sm text-ink-muted">
            <span className="font-medium text-accent">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-ink-subtle">Any image format — converted to WebP automatically</p>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<"overview" | "menu" | "orders">("overview");

  const [menuItems, setMenuItems]         = useState<MenuItem[]>([]);
  const [orders, setOrders]               = useState<Order[]>([]);
  const [loadingMenu, setLoadingMenu]     = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);

  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].id);
  const [showMenuForm, setShowMenuForm]      = useState(false);
  const [editingItem, setEditingItem]        = useState<MenuItem | null>(null);
  const [formData, setFormData]              = useState<MenuItemFormData>(EMPTY_FORM);
  const [saving, setSaving]                  = useState(false);

  // ── Notification state ────────────────────────────────────────────────────
  // knownOrderIds tracks which orders existed on the previous snapshot.
  // When a new order appears with status "pending", it's genuinely new.
  const knownOrderIds      = useRef<Set<string>>(new Set());
  const isFirstLoad        = useRef(true);
  const audioCtxRef        = useRef<AudioContext | null>(null);
  const bannerTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [bannerOrder, setBannerOrder] = useState<Order | null>(null);

  // ── Play notification sound via Web Audio API ────────────────────────────
  // No external file needed — synthesises a short "ding ding" using
  // two oscillator nodes through the browser's Web Audio API.
  const playNotificationSound = () => {
    try {
      const ctx = new AudioContext();
      audioCtxRef.current = ctx;

      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc    = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc.type      = "sine";
        osc.frequency.setValueAtTime(freq, startTime);

        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.4, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      // Two tones — a rising "ding-dong" pattern
      playTone(880, ctx.currentTime,        0.35);
      playTone(1100, ctx.currentTime + 0.2, 0.35);
    } catch {
      // Audio blocked by browser — fail silently, banner still shows
    }
  };

  // ── Show banner and auto-dismiss after 12s ────────────────────────────────
  const showNewOrderBanner = (order: Order) => {
    setBannerOrder(order);
    playNotificationSound();

    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    bannerTimerRef.current = setTimeout(() => {
      setBannerOrder(null);
    }, 12000);
  };

  const dismissBanner = () => {
    if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    setBannerOrder(null);
  };

  // ── Real-time Firestore listeners ─────────────────────────────────────────
  useEffect(() => {
    const unsubs: (() => void)[] = [];
    let loadedCount = 0;
    const itemsMap: Record<string, MenuItem[]> = {};

    CATEGORIES.forEach((cat) => {
      const itemsQuery = query(
        collection(db, "menuItems", cat.id, "items"),
        orderBy("createdAt", "desc")
      );

      const unsub = onSnapshot(itemsQuery, (snap) => {
        itemsMap[cat.id] = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<MenuItem, "id" | "categoryId" | "categoryLabel">),
          categoryId:    cat.id,
          categoryLabel: cat.label,
        }));

        loadedCount += 1;
        if (loadedCount >= CATEGORIES.length) setLoadingMenu(false);
        setMenuItems(Object.values(itemsMap).flat());
      });

      unsubs.push(unsub);
    });

    // Orders listener — also detects new "pending" orders for notifications
    const ordersQ = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const unsubOrders = onSnapshot(ordersQ, (snap) => {
      const incoming = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Order, "id">),
      }));

      // Skip notification logic on the very first load —
      // we don't want to alert for orders that already existed before the admin opened the page.
      if (!isFirstLoad.current) {
        for (const order of incoming) {
          // A genuinely new paid order: not seen before + status is "pending"
          if (!knownOrderIds.current.has(order.id) && order.status === "pending") {
            showNewOrderBanner(order);
            break; // show one banner at a time
          }
        }
      }

      // Update the known IDs set to the current snapshot
      knownOrderIds.current = new Set(incoming.map((o) => o.id));
      isFirstLoad.current   = false;

      setOrders(incoming);
      setLoadingOrders(false);
    });

    unsubs.push(unsubOrders);

    return () => {
      unsubs.forEach((u) => u());
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  // ── Computed stats ────────────────────────────────────────────────────────
  const totalRevenue    = orders.filter((o) => o.status === "delivered").reduce((s, o) => s + (o.total || 0), 0);
  const today           = new Date().toDateString();
  const todayOrders     = orders.filter((o) => o.createdAt && new Date(o.createdAt.seconds * 1000).toDateString() === today).length;
  const pendingOrders   = orders.filter((o) => o.status === "pending").length;
  const activeMenuItems = menuItems.filter((m) => m.available).length;
  const itemsInActiveCategory = menuItems.filter((m) => m.categoryId === activeCategory);

  // ── Form helpers ──────────────────────────────────────────────────────────
  const openAddForm = () => {
    setEditingItem(null);
    setFormData({ ...EMPTY_FORM, categoryId: activeCategory });
    setShowMenuForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name:        item.name,
      description: item.description,
      price:       String(item.price),
      categoryId:  item.categoryId,
      available:   item.available,
    });
    setShowMenuForm(true);
  };

  const closeForm = () => {
    setShowMenuForm(false);
    setEditingItem(null);
    setFormData(EMPTY_FORM);
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSaveMenuItem = async () => {
    if (!formData.name.trim()) { toast.error("Please enter an item name."); return; }
    if (!formData.price || isNaN(parseFloat(formData.price))) { toast.error("Please enter a valid price."); return; }

    setSaving(true);
    try {
      if (editingItem) {
        await updateMenuItem(editingItem, formData);
        toast.success(`"${formData.name.trim()}" updated successfully.`);
      } else {
        await addMenuItem(formData);
        toast.success(`"${formData.name.trim()}" added to ${CATEGORIES.find((c) => c.id === formData.categoryId)?.label}.`);
      }
      closeForm();
    } catch (e) {
      console.error("Error saving menu item:", e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDeleteMenuItem = async (item: MenuItem) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(item);
      toast.success(`"${item.name}" deleted.`);
    } catch (e) {
      toast.error("Could not delete item. Please try again.");
      console.log(e)
    }
  };

  // ── Toggle availability ───────────────────────────────────────────────────
  const handleToggleAvailability = async (item: MenuItem) => {
    try {
      await toggleMenuItemAvailability(item);
      toast.success(item.available ? `"${item.name}" hidden from menu.` : `"${item.name}" is now available.`);
    } catch (e) {
      toast.error("Could not update availability. Please try again.");
      console.log(e)
    }
  };

  // ── Order status update ───────────────────────────────────────────────────
  const handleUpdateOrderStatus = async (id: string, status: OrderStatus) => {
    try {
      await updateDoc(doc(db, "orders", id), { status, updatedAt: serverTimestamp() });
      toast.success(`Order marked as ${status}.`);
    } catch (e) {
      toast.error("Could not update order status.");
      console.log(e)
    }
  };

  // ── Simulate payment (sandbox testing) ───────────────────────────────────
  const handleSimulatePayment = async (orderId: string) => {
    try {
      await simulatePaymentSuccess(orderId);
      toast.success("Payment simulated — order is now pending.");
    } catch (e) {
      toast.error("Simulation failed.");
      console.log(e)
    }
  };

  const tabs = [
    { key: "overview", label: "Overview" },
    { key: "menu",     label: "Menu"     },
    { key: "orders",   label: "Orders"   },
  ] as const;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-canvas">
      <AdminHeader />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            fontFamily: "DM Sans, sans-serif",
            fontSize: "14px",
            borderRadius: "12px",
            padding: "12px 16px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
          },
          success: { iconTheme: { primary: "rgb(255 68 0)", secondary: "#fff" }, style: { border: "1px solid #fed7aa" } },
          error:   { style: { border: "1px solid #fecaca" } },
        }}
      />

      {/* ── New Order Banner ── */}
      <AnimatePresence>
        {bannerOrder && (
          <NewOrderBanner
            order={bannerOrder}
            onDismiss={dismissBanner}
            onView={() => { dismissBanner(); setActiveTab("orders"); }}
          />
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 pt-24 sm:pt-28 pb-12">

        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 sm:mb-8">
          <p className="font-playfair text-2xl sm:text-4xl font-semibold text-ink">
            Admin <span className="text-accent">Dashboard</span>
          </p>
          <p className="text-ink-muted mt-1 text-xs sm:text-sm">Manage your restaurant in real-time</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatCard label="Total Revenue"  value={`KSh ${totalRevenue.toLocaleString()}`} sub="From delivered orders" />
          <StatCard  label="Orders Today"   value={todayOrders}     sub="Across all statuses" />
          <StatCard  label="Pending"         value={pendingOrders}   sub="Awaiting action" />
          <StatCard label="Active Items"    value={activeMenuItems} sub={`of ${menuItems.length} total`} />
        </div>

        {/* Main nav tabs */}
        <div className="flex gap-1 mb-6 bg-surface-muted p-1 rounded-xl overflow-x-auto">
          {tabs.map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex-1 min-w-fit px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap relative ${
                activeTab === tab.key ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
              }`}>
              {tab.label}
              {/* Pending orders badge on Orders tab */}
              {tab.key === "orders" && pendingOrders > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingOrders > 9 ? "9+" : pendingOrders}
                </span>
              )}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">

          {/* ── OVERVIEW TAB ── */}
          {activeTab === "overview" && (
            <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">

              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
                <h2 className="font-playfair text-lg sm:text-xl font-semibold text-ink mb-4">Recent Orders</h2>
                {loadingOrders ? <p className="text-ink-muted text-sm">Loading...</p>
                  : orders.length === 0 ? <p className="text-ink-muted text-sm">No orders yet.</p>
                  : (
                    <div className="flex flex-col gap-3">
                      {orders.slice(0, 5).map((order) => (
                        <div key={order.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0 gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-ink truncate">
                              {order.delivery?.customerName || order.customerEmail}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {order.items?.length || 0} item(s) · KSh {order.total?.toLocaleString()}
                            </p>
                          </div>
                          <StatusBadge status={order.status} />
                        </div>
                      ))}
                    </div>
                  )}
              </div>

              <div className="bg-white/70 backdrop-blur rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
                <h2 className="font-playfair text-lg sm:text-xl font-semibold text-ink mb-4">Menu by Category</h2>
                {loadingMenu ? <p className="text-ink-muted text-sm">Loading...</p> : (
                  <div className="flex flex-col gap-3">
                    {CATEGORIES.map((cat) => {
                      const count = menuItems.filter((m) => m.categoryId === cat.id).length;
                      return (
                        <div key={cat.id} className="flex items-center justify-between gap-3">
                          <span className="text-sm text-ink w-20 shrink-0">{cat.label}</span>
                          <div className="flex items-center gap-2 flex-1">
                            <div className="h-2 rounded-full bg-orange-100 flex-1 overflow-hidden">
                              <div className="h-full bg-accent rounded-full transition-all"
                                style={{ width: `${menuItems.length ? (count / menuItems.length) * 100 : 0}%` }} />
                            </div>
                            <span className="text-xs text-ink-muted w-4 text-right shrink-0">{count}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ── MENU MANAGER TAB ── */}
          {activeTab === "menu" && (
            <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              <div className="flex items-center justify-between mb-4 gap-3">
                <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-ink">Menu Items</h2>
                <button onClick={openAddForm}
                  className="inline-flex items-center gap-1 rounded-full px-4 py-2 text-white text-sm font-medium bg-linear-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md shadow-orange-300/30 hover:brightness-105 active:scale-95 transition-all whitespace-nowrap">
                  + Add Item
                </button>
              </div>

              {/* Category tabs */}
              <div className="flex gap-1 mb-5 bg-surface-muted p-1 rounded-xl overflow-x-auto">
                {CATEGORIES.map((cat) => {
                  const count = menuItems.filter((m) => m.categoryId === cat.id).length;
                  return (
                    <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
                      className={`flex-1 min-w-fit px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                        activeCategory === cat.id ? "bg-white text-ink shadow-sm" : "text-ink-muted hover:text-ink"
                      }`}>
                      {cat.label}
                      <span className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full ${
                        activeCategory === cat.id ? "bg-orange-100 text-orange-600" : "bg-slate-200 text-slate-500"
                      }`}>{count}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add / Edit form */}
              <AnimatePresence>
                {showMenuForm && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="bg-white border-2 border-dashed border-orange-300 rounded-2xl p-4 sm:p-6 mb-6 shadow-sm">
                    <h3 className="font-playfair text-lg font-semibold text-ink mb-4">
                      {editingItem ? `Edit — ${editingItem.name}` : `New Item — ${CATEGORIES.find((c) => c.id === formData.categoryId)?.label}`}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-medium text-ink-muted mb-1 block">Name *</label>
                        <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300"
                          placeholder="e.g. BBQ Chicken Pizza"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink-muted mb-1 block">Price (KSh) *</label>
                        <input type="number" min="0"
                          className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300"
                          placeholder="e.g. 850"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <label className="text-xs font-medium text-ink-muted mb-1 block">Description</label>
                        <input className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300"
                          placeholder="Short description shown on the menu..."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-ink-muted mb-1 block">Category</label>
                        <select className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-orange-300"
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                          {CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 sm:mt-5">
                        <input id="available" type="checkbox" className="accent-orange-500 w-4 h-4"
                          checked={formData.available}
                          onChange={(e) => setFormData({ ...formData, available: e.target.checked })} />
                        <label htmlFor="available" className="text-sm text-ink cursor-pointer">Available on menu</label>
                      </div>
                      <div className="col-span-1 sm:col-span-2">
                        <ImageUploadField
                          currentImageUrl={editingItem?.imageUrl}
                          onFileSelected={(file) => setFormData({ ...formData, imageFile: file })}
                        />
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-5">
                      <button onClick={handleSaveMenuItem} disabled={saving}
                        className="w-full sm:w-auto rounded-full px-6 py-2.5 text-white text-sm font-medium bg-gradient-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md hover:brightness-105 active:scale-95 transition-all disabled:opacity-60">
                        {saving ? "Saving..." : editingItem ? "Update Item" : "Add Item"}
                      </button>
                      <button onClick={closeForm}
                        className="w-full sm:w-auto rounded-full px-6 py-2.5 text-ink-muted text-sm font-medium border border-slate-200 hover:border-slate-400 transition-all">
                        Cancel
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Items grid */}
              {loadingMenu ? (
                <p className="text-ink-muted text-sm">Loading menu...</p>
              ) : itemsInActiveCategory.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-4xl mb-3">🍽️</p>
                  <p className="text-ink-muted text-sm">No items in <span className="font-medium">{CATEGORIES.find((c) => c.id === activeCategory)?.label}</span> yet.</p>
                  <button onClick={openAddForm} className="mt-4 inline-flex items-center gap-1 rounded-full px-4 py-2 text-white text-sm font-medium bg-linear-to-r from-[rgb(var(--color-accent))] to-[rgb(var(--color-accent-soft))] shadow-md hover:brightness-105 active:scale-95 transition-all">
                    + Add First Item
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {itemsInActiveCategory.map((item) => (
                    <motion.div key={item.id} layout className="bg-white/80 rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
                      {item.imageUrl && (
                        <img src={item.imageUrl} alt={item.name} className="w-full h-32 object-cover" />
                      )}
                      <div className="p-4 flex flex-col gap-2 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-playfair font-semibold text-ink truncate">{item.name}</p>
                            <p className="text-xs text-ink-muted">{item.categoryLabel}</p>
                          </div>
                          <span className="text-accent font-bold text-sm whitespace-nowrap shrink-0">KSh {item.price?.toLocaleString()}</span>
                        </div>
                        {item.description && <p className="text-xs text-ink-muted line-clamp-2">{item.description}</p>}
                        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                          <button onClick={() => handleToggleAvailability(item)}
                            className={`text-xs px-3 py-1 rounded-full border font-medium transition-all ${
                              item.available ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100" : "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                            }`}>
                            {item.available ? "Available" : "Hidden"}
                          </button>
                          <div className="flex gap-3">
                            <button onClick={() => openEditForm(item)} className="text-xs text-blue-600 hover:underline">Edit</button>
                            <button onClick={() => handleDeleteMenuItem(item)} className="text-xs text-red-500 hover:underline">Delete</button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── ORDERS TAB ── */}
          {activeTab === "orders" && (
            <motion.div key="orders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="font-playfair text-xl sm:text-2xl font-semibold text-ink mb-4">All Orders</h2>
              {loadingOrders ? (
                <p className="text-ink-muted text-sm">Loading orders...</p>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl">
                  <p className="text-4xl mb-3">📦</p>
                  <p className="text-ink-muted text-sm">No orders yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {orders.map((order) => (
                    <motion.div key={order.id} layout
                      className="bg-white/80 rounded-2xl p-4 sm:p-5 shadow-sm border border-slate-100">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate">
                            {order.delivery?.customerName || order.customerEmail || "Anonymous"}
                          </p>
                          <p className="text-xs text-ink-muted mt-0.5">
                            {order.items?.length || 0} item(s) ·{" "}
                            <span className="font-semibold text-accent">KSh {order.total?.toLocaleString()}</span>
                          </p>
                          {order.delivery?.deliveryAddress && (
                            <p className="text-xs text-ink-subtle mt-0.5">📍 {order.delivery.deliveryAddress}</p>
                          )}
                          {order.createdAt && (
                            <p className="text-xs text-ink-subtle mt-0.5">
                              {new Date(order.createdAt.seconds * 1000).toLocaleString()}
                            </p>
                          )}
                          {order.mpesaReceiptNo && (
                            <p className="text-xs text-green-700 mt-0.5 font-mono">M-Pesa: {order.mpesaReceiptNo}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                          <StatusBadge status={order.status} />

                          {/* Only show status change dropdown for paid orders */}
                          {["pending", "preparing", "ready", "delivered", "cancelled"].includes(order.status) && (
                            <select value={order.status}
                              onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as OrderStatus)}
                              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 text-ink focus:outline-none focus:ring-2 focus:ring-orange-300">
                              <option value="pending">Pending</option>
                              <option value="preparing">Preparing</option>
                              <option value="ready">Ready</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          )}

                          {/* Sandbox simulate button for awaiting_payment orders */}
                          {order.status === "awaiting_payment" && (
                            <button
                              onClick={() => handleSimulatePayment(order.id)}
                              className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-lg px-2.5 py-1.5 font-medium hover:bg-orange-100 transition-all"
                            >
                              Simulate Payment 
                            </button>
                          )}
                        </div>
                      </div>

                      {order.items && order.items.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-2">
                          {order.items.map((item, i) => (
                            <span key={i} className="text-xs bg-orange-50 text-orange-700 border border-orange-200 rounded-full px-2.5 py-1">
                              {item.quantity}× {item.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};