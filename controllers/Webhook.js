import Stripe from "stripe";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";

// نبدأ بتهيئة Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * @desc Webhook لالتقاط أحداث الدفع من Stripe
 * @route POST /api/stripe/webhook
 * @access Private
 */
export const stripeWebhook = async (req, res) => {
  const event = req.body;

  // تحقق من نوع الحدث (event) المرسل من Stripe
  try {
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object; // البيانات الكاملة عن الجلسة

        // التحقق من حالة الدفع
        if (session.payment_status === "paid") {
          // إنشاء الأوردر في قاعدة البيانات
          const order = new Order({
            userId: session.metadata.userId,
            courses: JSON.parse(session.metadata.courses),
            totalPrice: session.amount_total / 100, // تحويل القيمة من سنت إلى دولار
            paymentMethod: session.payment_method_types[0], // نوع طريقة الدفع (Card/Paypal...)
            isPaid: true,
            couponId: session.metadata.couponId || null,
          });

          await order.save();

          // إذا كان في كوبون تم استخدامه، يتم تحديث الـ usedCount
          if (session.metadata.couponId) {
            await Coupon.findByIdAndUpdate(session.metadata.couponId, { $inc: { usedCount: 1 } });
          }

          console.log("✅ Order created successfully!");
        }
        break;

      // يمكن إضافة حالات أخرى للأحداث الخاصة مثل:
      // case "payment_intent.failed":
      // case "checkout.session.async_payment_failed":
      // case "payment_intent.succeeded":
      // case "invoice.payment_failed":
      // case "invoice.payment_succeeded":
      // وغيرها حسب الاحتياج

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).send("Webhook received");
  } catch (error) {
    console.error("❌ Error processing webhook", error);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};
