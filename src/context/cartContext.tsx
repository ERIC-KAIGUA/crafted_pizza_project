// src/context/CartContext.tsx
//
// Provides cart state to the entire app.
// Any component can call useCart() to read or modify the cart.
//
// The cart lives in memory (useState). It gets written to Firestore
// only when the customer places an order — that comes in the next step.

import { createContext, useContext, useState } from "react";
import { type CartItem } from "../types/cart";
import { type MenuItem } from "../types/menu";

// ─── Types ────────────────────────────────────────────────────────────────────

type CartContextType = {
  items:          CartItem[];
  totalItems:     number;          // Sum of all quantities — shown on the cart icon badge
  totalPrice:     number;          // Sum of (price × quantity) for all items
  addToCart:      (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart:      () => void;
};

// ─── Context ──────────────────────────────────────────────────────────────────

const CartContext = createContext<CartContextType | null>(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};

// ─── Provider ─────────────────────────────────────────────────────────────────

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // ── Derived values ────────────────────────────────────────────────────────
  // Calculated fresh on every render — always in sync with items array
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Adds a menu item to the cart.
   * If the item is already in the cart, increments its quantity by 1.
   * If it's new, adds it with quantity 1.
   */
  const addToCart = (menuItem: MenuItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.itemId === menuItem.id);
      if (existing) {
        // Already in cart — just bump the quantity
        return prev.map((i) =>
          i.itemId === menuItem.id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      // New item — create a CartItem snapshot
      return [
        ...prev,
        {
          itemId:     menuItem.id,
          name:       menuItem.name,
          price:      menuItem.price,
          imageUrl:   menuItem.imageUrl,
          categoryId: menuItem.categoryId,
          quantity:   1,
        },
      ];
    });
  };

  /**
   * Removes an item from the cart entirely, regardless of quantity.
   */
  const removeFromCart = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.itemId !== itemId));
  };

  /**
   * Sets the quantity of an item directly.
   * If quantity is 0 or less, the item is removed from the cart.
   */
  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.itemId === itemId ? { ...i, quantity } : i))
    );
  };

  /**
   * Empties the cart completely.
   * Called after a successful order is placed.
   */
  const clearCart = () => setItems([]);

  return (
    <CartContext.Provider
      value={{ items, totalItems, totalPrice, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
};