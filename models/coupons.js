import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // كود الكوبون
  discountType: { type: String, enum: ["percentage", "fixed"], required: true }, // نوع الخصم (نسبة % أو مبلغ ثابت)
  discountValue: { type: Number, required: true }, // قيمة الخصم
  expirationDate: { type: Date, required: true }, // تاريخ انتهاء الكوبون
  usageLimit: { type: Number, default: 1 }, // عدد المرات المسموح باستخدام الكوبون فيها
  usedCount: { type: Number, default: 0 }, // عدد المرات اللي تم استخدام الكوبون فيها
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: false }, // لو undefined يبقى الكوبون لكل الموقع
}, { timestamps: true });

export default mongoose.model("Coupon", couponSchema);
