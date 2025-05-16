import express from "express";
import { getAllOrders, getOrderById, cancelOrder } from "../controllers/orderController.js";

const router = express.Router();

// جلب جميع الأوردرات (للأدمن)
router.get("/", getAllOrders);

// جلب أوردر معين
router.get("/:orderId", getOrderById);

// إلغاء أوردر معين (للأدمن)
router.delete("/:orderId", cancelOrder);

export default router;
