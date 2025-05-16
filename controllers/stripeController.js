import Stripe from "stripe";
import Course from "../models/Course.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import dotenv from "dotenv";
import asyncHandler from "express-async-handler";
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;  // استخدم هذا لاستدعاء ObjectId بشكل صحيح في الجافا سكربت

dotenv.config();

// تهيئة Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ✅ إنشاء جلسة الدفع
export const createCheckoutSession = async (req, res) => {
  try {
    const { userId, courseIds, userEmail, totalAmount } = req.body;

    // تحقق من الكورسات
    const all_courses = await Course.find({ _id: { $in: courseIds } });
    if (!all_courses.length) {
      return res.status(400).json({ message: "لا يوجد كورسات صحيحة." });
    }

    // إنشاء جلسة الدفع
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [{
        price_data: {
          currency: "usd",
          product_data: {
            name: "Total Amount for Courses",
            description: "This is the total amount for selected courses",
          },
          unit_amount: totalAmount * 100, // بالسنت
        },
        quantity: 1,
      }],
      mode: "payment",
      success_url: `${process.env.CLIENT_URL}/checkout/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
      metadata: {
        userEmail,
        userId: userId.toString(),
        courseIds: JSON.stringify(courseIds), // ← دي أهم سطر
        totalAmount: totalAmount
      },
    });
    console.log("❌ 888888:" , userId , courseIds );

    return res.status(200).json({ id: session.id });
  } catch (error) {
    console.error("❌ Error creating checkout session:", error);
    res.status(500).json({ message: "حدث خطأ أثناء إنشاء جلسة الدفع", error: error.message });
  }
};


export const confirmCheckoutSession = asyncHandler(async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(400).json({ message: "Session ID is required" });
  }

  try {
    // 1. Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session || session.payment_status !== "paid") {
      return res.status(400).json({ message: "Payment not completed" });
    }

    // 2. Check if order already exists
    const existingOrder = await Order.findOne({ stripeSessionId: session.id });
    if (existingOrder) {
      return res.status(200).json({ message: "Order already confirmed" });
    }

    // 3. Extract metadata from session
    const metadata = session.metadata;
    const userId = metadata.userId;
    const userEmail = metadata.userEmail;
    const courseIds = JSON.parse(metadata.courseIds);
    const totalAmount = Number(metadata.totalAmount);

    // Check if totalAmount is a valid number
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    // 4. Map courses to include their prices
    const courses = courseIds.map((courseId) => ({
      courseId,
      price: totalAmount, // You should have a valid price here for each course
    }));

    // Check if prices are valid numbers
    courses.forEach((course) => {
      if (isNaN(course.price) || course.price <= 0) {
        return res.status(400).json({ message: "Invalid course price" });
      }
    });

    // 5. Save Order to Database
    const order = await Order.create({
      userId,
      courses,
      totalPrice: totalAmount,
      stripeSessionId: session.id,
      status: "Completed",
    });

    // 6. Update user courses
    await updateUserCourses(userId, courseIds);  // تحديث الكورسات في سجل المستخدم

    res.status(201).json({ message: "Order confirmed", order });
  } catch (error) {
    console.error("Error confirming checkout session:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

// ✅ تحديث كورسات المستخدم
const updateUserCourses = async (userId, courseIds) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("المستخدم غير موجود");

    // تحويل courseIds إلى ObjectId إذا كانت قيمها عبارة عن سلاسل نصية
    const objectIds = courseIds.map(courseId => new mongoose.Types.ObjectId(courseId));

    // إضافة الكورسات الجديدة للمستخدم
    objectIds.forEach(courseId => {
      // تأكد من أن الكورس لم يتم إضافته مسبقًا
      const courseExists = user.myCourses.some(course => course.courseId.toString() === courseId.toString());
      
      if (!courseExists) {
        user.myCourses.push({ courseId });
      }
    });

    await user.save();

    console.log("✅ تم تحديث كورسات المستخدم");
  } catch (error) {
    console.error("❌ Error updating user's courses:", error.message);
  }
};



// ✅ إنشاء الأوردر
const createOrder = async ({ userId, courseIds, totalPrice, stripeSessionId, paymentIntentId, status, couponId, discountAmount }) => {
  try {
    const courses = await Course.find({ _id: { $in: courseIds } });

    const courseData = courses.map(course => ({
      courseId: course._id,
      price: course.price,
    }));

    const order = new Order({
      userId,
      courses: courseData,
      totalPrice,
      couponId,
      discountAmount,
      stripeSessionId,
      paymentIntentId,
      status,
    });

    await order.save();

    console.log("✅ Order created:", order._id);
  } catch (error) {
    console.error("❌ Error creating order:", error.message);
    throw new Error("Failed to create order");
  }
};
