import express from "express";
import { createCoupon, applyCoupon } from "../controllers/couponController.js";

const router = express.Router();

router.post("/create", createCoupon);  // إنشاء كوبون جديد
router.post("/apply", applyCoupon);    // تطبيق كوبون عند الدفع

export default router;
