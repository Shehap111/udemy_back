import Course from '../models/Course.js';

// إنشاء كورس جديد
export const createCourse = async (req, res) => {
  try {
    const newCourse = new Course({ ...req.body, purchasesCount: 0 }); // تعيين عدد مرات البيع إلى 0 عند الإنشاء
    await newCourse.save();
    res.status(201).json({ success: true, data: newCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// زيادة عدد مرات البيع عند شراء الكورس
export const incrementPurchaseCount = async (courseId) => {
  try {
    await Course.findByIdAndUpdate(courseId, { $inc: { purchasesCount: 1 } });
  } catch (error) {
    console.error('Error updating purchase count:', error);
  }
};

// جلب جميع الكورسات
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// جلب كورس واحد عن طريق الـ ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// تحديث بيانات كورس
export const updateCourse = async (req, res) => {
  try {
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, data: updatedCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// حذف كورس
export const deleteCourse = async (req, res) => {
  try {
    const deletedCourse = await Course.findByIdAndDelete(req.params.id);
    if (!deletedCourse) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.status(200).json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
