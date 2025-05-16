import express from "express";
import asyncHandler from "express-async-handler";
import { protect, isAdmin } from "../middleware/authMiddleware.js";
import User from "../models/User.js";
import Course from "../models/Course.js";
import Coupon from "../models/coupons.js";
import {imageUpload} from "../middleware/upload.js"; // استيراد `multer`

const router = express.Router();

// ✅ عرض جميع المستخدمين
router.get(
  "/users",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const users = await User.find().select("-password");
    res.json({ users });
  })
);

// ✅ تعديل دور المستخدم (تحويله لأدمن أو مدرس أو طالب)
router.put(
  "/users/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.role = req.body.role || user.role;
    await user.save();
    res.json({ message: "User role updated successfully", user });
  })
);
// ✅ تحديث حالة تفعيل المستخدم (isActive)
router.patch(
  "/users/:id/isActive",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = req.body.isActive;
    await user.save();
    res.json({ message: "User status updated successfully", user });
  })
);
// ✅ حذف المستخدم مع منع حذف الأدمن لنفسه
router.delete(
  "/users/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    if (req.user.id === req.params.id) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  })
);

// ✅ عرض جميع الكورسات
router.get(
  "/courses",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const courses = await Course.find();
    res.json({courses});
  })
);

// ✅ إضافة كورس جديد مع التحقق من صحة البيانات
router.post(
  "/courses",
  protect,  // التأكد من تسجيل الدخول
  isAdmin,  // التأكد من كون المستخدم أدمن
  asyncHandler(async (req, res) => {
    const {
      title,
      description,
      image,
      price,
      instructor,
      categoryId,
      levels
    } = req.body;
    
    // التحقق من جميع الحقول المطلوبة
    if (!title || !description || !image || !price || !instructor || !categoryId || !levels) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // التحقق من أن السعر أكبر من 0
    if (price <= 0) {
      return res.status(400).json({ message: "Price must be greater than 0" });
    }

    // إضافة الكورس الجديد
    const newCourse = new Course({
      title,
      description,
      image,
      price,
      instructor,
      categoryId,
      levels
    });

    await newCourse.save();
    res.status(201).json({ message: "Course created successfully", newCourse });
  })
);
// ✅ إضافة Level جديد إلى كورس معين
router.post(
  "/courses/:id/levels",
  protect,  // التأكد من تسجيل الدخول
  isAdmin,  // التأكد من كون المستخدم أدمن
  asyncHandler(async (req, res) => {
    const { id } = req.params;  // الكورس الذي سيتم إضافة الـ levels له
    const { levelTitle, levelDescription, lessons, quiz } = req.body;  // بيانات الـ level

    // التحقق من وجود بيانات الـ level
    if (!levelTitle || !levelDescription || !lessons || !quiz) {
      return res.status(400).json({ message: "All level fields are required" });
    }

    // جلب الكورس المراد إضافة الـ level له
    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // إضافة الـ level إلى الكورس
    course.levels.push({
      levelTitle: {
        en: levelTitle.en,
        ar: levelTitle.ar,
        de: levelTitle.de,
        es: levelTitle.es
      },
      levelDescription: {
        en: levelDescription.en,
        ar: levelDescription.ar,
        de: levelDescription.de,
        es: levelDescription.es
      },
      lessons,
      quiz
    });

    // حفظ الكورس بعد إضافة الـ level
    await course.save();

    res.status(201).json({ message: "Level added successfully", course });
  })
);


// ✅ تعديل بيانات الكورس
router.put(
  "/courses/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    Object.assign(course, req.body);
    await course.save();
    res.json({ message: "Course updated successfully", course });
  })
);
// ✅ تغيير حالة الكورس (إظهار أو إخفاء)
router.patch(
  "/courses/:id/active",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.isActive = !course.isActive;
    await course.save();

    res.json({ message: `Course ${course.isActive ? "activated" : "deactivated"} successfully`, course });
  })
);
// ✅ حذف الكورس
router.delete(
  "/courses/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ message: "Course deleted successfully" });
  })
);

// ✅ عرض جميع الكوبونات
router.get(
  "/coupons",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const coupons = await Coupon.find();
    res.json(coupons);
  })
);

// ✅ إضافة كوبون جديد مع التحقق من البيانات
router.post(
  "/coupons",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const { code, discount, expiryDate } = req.body;
    if (!code || !discount || !expiryDate) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (discount <= 0 || discount > 100) {
      return res.status(400).json({ message: "Discount must be between 1 and 100" });
    }
    if (new Date(expiryDate) < new Date()) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    const newCoupon = new Coupon({ code, discount, expiryDate });
    await newCoupon.save();
    res.status(201).json({ message: "Coupon created successfully", newCoupon });
  })
);

// ✅ تعديل بيانات الكوبون
router.put(
  "/coupons/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });

    Object.assign(coupon, req.body);
    if (coupon.discount <= 0 || coupon.discount > 100) {
      return res.status(400).json({ message: "Discount must be between 1 and 100" });
    }
    if (new Date(coupon.expiryDate) < new Date()) {
      return res.status(400).json({ message: "Expiry date must be in the future" });
    }

    await coupon.save();
    res.json({ message: "Coupon updated successfully", coupon });
  })
);

// ✅ حذف الكوبون
router.delete(
  "/coupons/:id",
  protect,
  isAdmin,
  asyncHandler(async (req, res) => {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted successfully" });
  })
);

export default router;
