import Coupon from "../models/coupons.js";

/**
 * إنشاء كوبون جديد
 * @route POST /api/coupons/create
 */
export const createCoupon = async (req, res) => {
  try {
    const { code, discountType, discountValue, expirationDate, usageLimit, courseId } = req.body;

    // التأكد من عدم وجود كوبون بنفس الكود
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) return res.status(400).json({ message: "Coupon already exists!" });

    // إنشاء الكوبون الجديد
    const newCoupon = new Coupon({ code, discountType, discountValue, expirationDate, usageLimit, courseId });
    await newCoupon.save();

    res.status(201).json({ message: "Coupon created successfully", coupon: newCoupon });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

/**
 * استخدام الكوبون أثناء الدفع
 * @route POST /api/coupons/apply
 */
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body; // مبقيناش محتاجين courseId

    // البحث عن الكوبون
    const coupon = await Coupon.findOne({ code });
    if (!coupon) return res.status(404).json({ message: "Invalid coupon code!" });

    // التحقق من صلاحية الكوبون
    if (coupon.expirationDate < new Date())
      return res.status(400).json({ message: "Coupon has expired!" });

    // التحقق من عدد مرات الاستخدام
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)
      return res.status(400).json({ message: "Coupon usage limit reached!" });

    // ✅ حذفنا الشرط بتاع الكورس خالص، الكوبون هيشتغل على كل الكورسات

    // إرجاع بيانات الخصم لو الكوبون صالح
    res.status(200).json({ 
      message: "Coupon applied successfully", 
      discountType: coupon.discountType, 
      discountValue: coupon.discountValue 
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


/**
 * تحديث عدد مرات استخدام الكوبون بعد الدفع
 */
export const updateCouponUsage = async (couponId) => {
  try {
    await Coupon.findByIdAndUpdate(couponId, { $inc: { usedCount: 1 } });
  } catch (error) {
    console.error("Error updating coupon usage:", error);
  }
};
