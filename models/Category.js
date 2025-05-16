import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    de: { type: String, required: true },
    es: { type: String, required: true },
  },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    de: { type: String, required: true },
    es: { type: String, required: true },
  },
  // يمكن إضافة خصائص إضافية مثل image أو parentCategory هنا إذا لزم الأمر
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

export default Category;
