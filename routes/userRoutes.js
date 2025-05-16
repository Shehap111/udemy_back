import express from "express";
import {
  getUserById,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getUserProfile,
  logoutUser,
  submitQuizResult ,
  loginUser, // ✅ إضافة اللوجن هنا
} from "../controllers/userController.js";

const router = express.Router();

// جلب جميع المستخدمين
router.get("/", getAllUsers);

router.get("/profile", getUserProfile); // ✅ استرجاع بيانات المستخدم

// جلب مستخدم معين بالـ ID
router.get("/:id", getUserById);

// إنشاء مستخدم جديد (تسجيل حساب)
router.post("/", createUser);

// تسجيل الدخول ✅
router.post("/login", loginUser);

// تحديث بيانات المستخدم
router.put("/:id", updateUser);

// حذف مستخدم
router.delete("/:id", deleteUser);

router.post("/logout", logoutUser); // ✅ تسجيل الخروج

// ✅ تحديث تقدم المستخدم في الكورس
router.post("/:userId/submit-quiz", submitQuizResult);

export default router;
