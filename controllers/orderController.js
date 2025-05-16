import Order from "../models/Order.js";
import Coupon from "../models/coupons.js";

/**
 * @desc استرجاع جميع الأوردرات
 * @route GET /api/orders
 * @access Admin
 */
export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find().populate("userId", "name email").populate("courses.courseId", "title");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب الأوردرات", error });
  }
};

/**
 * @desc استرجاع أوردر معين
 * @route GET /api/orders/:orderId
 * @access User
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate("userId", "name email")
      .populate("courses.courseId", "title");

    if (!order) return res.status(404).json({ message: "❌ الأوردر غير موجود" });

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء جلب الأوردر", error });
  }
};

/**
 * @desc إنشاء أوردر جديد بعد نجاح الدفع
 * @route POST /api/orders
 * @access Private (Webhook)
 */
export const createOrder = async (session) => {
  try {
    const newOrder = new Order({
      userId: session.metadata.userId,
      courses: JSON.parse(session.metadata.courses),
      totalPrice: session.amount_total / 100,
      couponId: session.metadata.couponId || null,
      discountAmount: session.metadata.discountAmount || 0,
      stripeSessionId: session.id,
      paymentIntentId: session.payment_intent,
      status: "Completed",
    });

    await newOrder.save();

    // تحديث عدد مرات استخدام الكوبون
    if (session.metadata.couponId) {
      await Coupon.findByIdAndUpdate(session.metadata.couponId, { $inc: { usedCount: 1 } });
    }

    console.log("✅ Order saved successfully!");
  } catch (error) {
    console.error("❌ Error saving order:", error);
  }
};

/**
 * @desc إلغاء أوردر معين
 * @route DELETE /api/orders/:orderId
 * @access Admin
 */
export const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) return res.status(404).json({ message: "❌ الأوردر غير موجود" });

    await order.deleteOne();
    res.status(200).json({ message: "✅ تم إلغاء الأوردر بنجاح" });
  } catch (error) {
    res.status(500).json({ message: "❌ خطأ أثناء إلغاء الأوردر", error });
  }
};
