import express from "express";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Coupon from "../models/coupons.js";

const router = express.Router();

router.get("/stats", protect, isAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const totalCoupons = await Coupon.countDocuments();
    
    res.json({ totalUsers, totalCourses, totalCoupons });
  } catch (error) {
    res.status(500).json({ message: "Error fetching stats" });
  }
});

export default router;
