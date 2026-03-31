import {
  collection,
  addDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { type CartItem } from "../types/cart";
import { type CheckoutFormData, type Order, type OrderItem } from "../types/order";



export type PlaceOrderParams = {
  customerId:    string;
  customerEmail: string;
  cartItems:     CartItem[];
  total:         number;
  formData:      CheckoutFormData;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const cartItemsToOrderItems = (cartItems: CartItem[]): OrderItem[] =>
  cartItems.map((item) => ({
    itemId:    item.itemId,
    name:      item.name,
    quantity:  item.quantity,
    price:     item.price,
    imageUrl:  item.imageUrl,
  }));

export const formatPhoneForMpesa = (phone: string): string => {
  const cleaned = phone.replace(/\s+/g, "").replace(/^\+/, "");
  if (cleaned.startsWith("0")) return "254" + cleaned.slice(1);
  if (cleaned.startsWith("254")) return cleaned;
  return cleaned;
};


const STK_PUSH_URL = import.meta.env.VITE_STK_PUSH_URL



export const placeOrder = async (params: PlaceOrderParams): Promise<string> => {
  const { customerId, customerEmail, cartItems, total, formData } = params;

  const orderRef = await addDoc(collection(db, "orders"), {
    customerId,
    customerEmail,
    delivery: {
      customerName:    formData.customerName.trim(),
      customerPhone:   formatPhoneForMpesa(formData.customerPhone),
      deliveryAddress: formData.deliveryAddress.trim(),
      deliveryNotes:   formData.deliveryNotes.trim(),
    },
    items:         cartItemsToOrderItems(cartItems),
    total,
    paymentMethod: "mpesa",
    paymentStatus: "pending",
    status:        "awaiting_payment",
    createdAt:     serverTimestamp(),
    updatedAt:     serverTimestamp(),
  });

  try {
    const response = await fetch(STK_PUSH_URL, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orderId:     orderRef.id,
        phone:       formatPhoneForMpesa(formData.customerPhone),
        amount:      total,
        description: `Crafted Pizza Order ${orderRef.id.slice(0, 8).toUpperCase()}`,
      }),
    });

    if (!response.ok) {
      await updateDoc(doc(db, "orders", orderRef.id), {
        status:        "payment_failed",
        paymentStatus: "failed",
      });
      throw new Error("Failed to initiate M-Pesa payment. Please try again.");
    }
  } catch (error) {
    await updateDoc(doc(db, "orders", orderRef.id), {
      status:        "payment_failed",
      paymentStatus: "failed",
    });
    throw error;
  }

  return orderRef.id;
};



export const simulatePaymentSuccess = async (orderId: string): Promise<void> => {
  await updateDoc(doc(db, "orders", orderId), {
    status:         "pending",       // kitchen can now see the order
    paymentStatus:  "completed",
    mpesaReceiptNo: `SIM${Date.now().toString().slice(-8)}`, // fake receipt number
    updatedAt:      serverTimestamp(),
  });
};

export const simulatePaymentFailure = async (orderId: string): Promise<void> => {
  await updateDoc(doc(db, "orders", orderId), {
    status:        "payment_failed",
    paymentStatus: "failed",
    updatedAt:     serverTimestamp(),
  });
};



export const subscribeToOrder = (
  orderId: string,
  onUpdate: (order: Order) => void
): (() => void) => {
  const orderRef = doc(db, "orders", orderId);
  return onSnapshot(orderRef, (snap) => {
    if (snap.exists()) {
      onUpdate({ id: snap.id, ...(snap.data() as Omit<Order, "id">) });
    }
  });
};


export const subscribeToCustomerOrders = (
  customerId: string,
  onUpdate: (orders: Order[]) => void
): (() => void) => {
  const q = query(
    collection(db, "orders"),
    where("customerId", "==", customerId),
    orderBy("createdAt", "desc")
  );
  return onSnapshot(q, (snap) => {
    onUpdate(
      snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Order, "id">) }))
    );
  });
};