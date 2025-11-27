import Razorpay from "razorpay";
import { config } from "@/lib/config";

// Initialize Razorpay
// Note: Razorpay constructor doesn't validate credentials immediately
// Validation happens when making API calls
export const razorpay = new Razorpay({
  key_id: config.razorpay.keyId || "",
  key_secret: config.razorpay.keySecret || "",
});
