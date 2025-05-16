import jwt from "jsonwebtoken";
import User from "../models/User.js";
import asyncHandler from "express-async-handler";
import cookieParser from "cookie-parser"; // ✅ تأكد إن السيرفر بيستخدمه

// ✅ حماية الراوتس (يجب أن يكون المستخدم مسجل الدخول)
export const protect = asyncHandler(async (req, res, next) => {
  let token = req.cookies.token || null; // ✅ جلب التوكن من الكوكيز

  // ✅ لو مفيش توكن في الكوكيز، ابحث في الهيدرز
  if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId).select("-password"); // ✅ `userId` مش `id`
    next();
  } catch (error) {
    res.status(401).json({ message: "Not authorized, token failed" });
  }
});

// ✅ التأكد من أن المستخدم هو الأدمن
export const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
       console.log("User Data:", req.user); // ✅ تأكد من البيانات
    next();
  } else {
    res.status(403).json({ message: "Not authorized as admin" });
  console.log("User Data:", req.user); // ✅ تأكد من البيانات
    }
};
