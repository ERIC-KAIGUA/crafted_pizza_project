
import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import axios from "axios";

admin.initializeApp();
const db = admin.firestore();

// ─── Secrets ──────────────────────────────────────────────────────────────────

const DARAJA_CONSUMER_KEY    = defineSecret("DARAJA_CONSUMER_KEY");
const DARAJA_CONSUMER_SECRET = defineSecret("DARAJA_CONSUMER_SECRET");
const DARAJA_PASSKEY         = defineSecret("DARAJA_PASSKEY");
const DARAJA_SHORTCODE       = defineSecret("DARAJA_SHORTCODE");
const DARAJA_CALLBACK_URL    = defineSecret("DARAJA_CALLBACK_URL");

// ─── Config ───────────────────────────────────────────────────────────────────

const DARAJA_BASE_URL = "https://sandbox.safaricom.co.ke";
// Switch to production when ready:
// const DARAJA_BASE_URL = "https://api.safaricom.co.ke";

// ─── CORS helper ──────────────────────────────────────────────────────────────
// Sets the required CORS headers on every response.
// cors: true in onRequest options is NOT sufficient for Cloud Run —
// the preflight OPTIONS request must be handled manually in the function body.
//
// When going live, replace "*" with your actual domain:
// e.g. "https://craftedpizza.co.ke"

const setCorsHeaders = (res: any) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getDarajaToken = async (
  consumerKey: string,
  consumerSecret: string
): Promise<string> => {
  const credentials = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const response = await axios.get(
    `${DARAJA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    { headers: { Authorization: `Basic ${credentials}` } }
  );
  return response.data.access_token;
};

const generatePassword = (
  shortcode: string,
  passkey: string,
  timestamp: string
): string =>
  Buffer.from(`${shortcode}${passkey}${timestamp}`).toString("base64");

const getTimestamp = (): string =>
  new Date().toISOString().replace(/[-T:.Z]/g, "").slice(0, 14);

// ─── Function 1: mpesaStkPush ─────────────────────────────────────────────────

export const mpesaStkPush = onRequest(
  {
    region: "europe-west2",
    secrets: [
      DARAJA_CONSUMER_KEY,
      DARAJA_CONSUMER_SECRET,
      DARAJA_PASSKEY,
      DARAJA_SHORTCODE,
      DARAJA_CALLBACK_URL,
    ],
  },
  async (req, res) => {
    // ── Step 1: Set CORS headers on every response ──
    setCorsHeaders(res);

    // ── Step 2: Handle preflight OPTIONS request ──
    // The browser sends this automatically before the real POST.
    // We must respond with 204 and the CORS headers — nothing else.
    if (req.method === "OPTIONS") {
      res.status(204).send("");
      return;
    }

    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { orderId, phone, amount, description } = req.body;

    if (!orderId || !phone || !amount) {
      res.status(400).json({ error: "orderId, phone and amount are required" });
      return;
    }

    const consumerKey    = DARAJA_CONSUMER_KEY.value();
    const consumerSecret = DARAJA_CONSUMER_SECRET.value();
    const passkey        = DARAJA_PASSKEY.value();
    const shortcode      = DARAJA_SHORTCODE.value();
    const callbackUrl    = DARAJA_CALLBACK_URL.value();

    try {
      const token     = await getDarajaToken(consumerKey, consumerSecret);
      const timestamp = getTimestamp();
      const password  = generatePassword(shortcode, passkey, timestamp);

      const stkResponse = await axios.post(
        `${DARAJA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
        {
          BusinessShortCode: shortcode,
          Password:          password,
          Timestamp:         timestamp,
          TransactionType:   "CustomerPayBillOnline",
          Amount:            Math.ceil(amount),
          PartyA:            phone,
          PartyB:            shortcode,
          PhoneNumber:       phone,
          CallBackURL:       callbackUrl,
          AccountReference:  `Order-${orderId.slice(0, 8).toUpperCase()}`,
          TransactionDesc:   description ?? "Crafted Pizza Order",
        },
        {
          headers: {
            Authorization:  `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      await db.collection("orders").doc(orderId).update({
        mpesaCheckoutRequestId: stkResponse.data.CheckoutRequestID,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({
        success:           true,
        checkoutRequestId: stkResponse.data.CheckoutRequestID,
      });

    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Unknown error";
      console.error("STK push error:", error);

      try {
        await db.collection("orders").doc(orderId).update({
          status:        "payment_failed",
          paymentStatus: "failed",
          updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch { /* ignore secondary error */ }

      res.status(500).json({ error: message });
    }
  }
);

// ─── Function 2: mpesaCallback ────────────────────────────────────────────────
// Daraja calls this server-to-server — no CORS headers needed here.

export const mpesaCallback = onRequest(
  { region: "europe-west2" },
  async (req, res) => {
    // Acknowledge immediately — Daraja requires a response within 5 seconds
    res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });

    try {
      const callback = req.body?.Body?.stkCallback;
      if (!callback) return;

      const {
        ResultCode,
        ResultDesc,
        CheckoutRequestID,
        CallbackMetadata,
      } = callback;

      const ordersSnap = await db
        .collection("orders")
        .where("mpesaCheckoutRequestId", "==", CheckoutRequestID)
        .limit(1)
        .get();

      if (ordersSnap.empty) {
        console.error("No order found for CheckoutRequestID:", CheckoutRequestID);
        return;
      }

      const orderDoc = ordersSnap.docs[0];

      if (ResultCode === 0) {
        const metaItems: { Name: string; Value: string | number }[] =
          CallbackMetadata?.Item ?? [];
        const receiptItem    = metaItems.find((i) => i.Name === "MpesaReceiptNumber");
        const mpesaReceiptNo = receiptItem ? String(receiptItem.Value) : null;

        await orderDoc.ref.update({
          status:         "pending",
          paymentStatus:  "completed",
          mpesaReceiptNo: mpesaReceiptNo,
          updatedAt:      admin.firestore.FieldValue.serverTimestamp(),
        });

      } else {
        console.log(`Payment failed for order ${orderDoc.id}: ${ResultDesc}`);

        await orderDoc.ref.update({
          status:        "payment_failed",
          paymentStatus: "failed",
          updatedAt:     admin.firestore.FieldValue.serverTimestamp(),
        });
      }

    } catch (error) {
      console.error("Callback processing error:", error);
    }
  }
);