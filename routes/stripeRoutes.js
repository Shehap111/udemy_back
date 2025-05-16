import express from "express";
import {
  createCheckoutSession,
  confirmCheckoutSession,
} from "../controllers/stripeController.js";

const router = express.Router();

// إنشاء checkout session
router.post("/checkout-session", createCheckoutSession);

// endpoint لتأكيد الجلسة والتحقق من الدفع
router.post('/confirm-checkout-session', confirmCheckoutSession);

export default router;
