    import Category from '../models/Category.js';

// إضافة كاتيجوري جديد
export const addCategory = async (req, res) => {
  try {
    const { title, description } = req.body;
    const newCategory = new Category({
      title,
      description,
    });

    await newCategory.save();
    res.status(201).json({ message: 'تم إضافة الكاتيجوري بنجاح', category: newCategory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة الكاتيجوري' });
  }
};

// تعديل كاتيجوري
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const category = await Category.findByIdAndUpdate(id, { title, description }, { new: true });
    if (!category) {
      return res.status(404).json({ message: 'الكاتيجوري غير موجود' });
    }

    res.status(200).json({ message: 'تم تعديل الكاتيجوري بنجاح', category });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء تعديل الكاتيجوري' });
  }
};

// عرض جميع الكاتيجوريات
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الكاتيجوريات' });
  }
};

// عرض كاتيجوري واحدة
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'الكاتيجوري غير موجود' });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الكاتيجوري' });
  }
};
