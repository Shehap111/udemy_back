import mongoose from 'mongoose';
import slugify from 'slugify';

const { Schema, Types } = mongoose;

// دالة لإنشاء الـ slug من العنوان
const generateSlug = (title, language) => {
  return slugify(title[language], { lower: true, strict: true });
};

// دالة للتحقق من الـ slug في قاعدة البيانات
const checkSlugExistence = async (slug) => {
  const existingArticle = await Article.findOne({ slug });
  return existingArticle;
};

const articleSchema = new Schema({
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
  isActive: { type: Boolean, default: true },
  authorName: { type: String, required: true },
  authorImage: { type: String, required: true },
  categoryId: { type: Types.ObjectId, ref: 'Category', required: true },
  articleImage: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['published', 'draft'], default: 'draft' },
  tags: { type: [String], default: [] },
  comments: [{
    commenterName: { type: String, required: true },
    commenterImage: { type: String },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    replies: [{
      replierName: { type: String, required: true },
      replierImage: { type: String },
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }]
  }],
  slug: {
    en: { type: String, unique: true },
    ar: { type: String, unique: true },
    de: { type: String, unique: true },
    es: { type: String, unique: true }
  }
});

// هوك قبل الـ `save` عشان نعمل الـ slug ونشيك لو موجود
articleSchema.pre('save', async function(next) {
  try {
    // جلب الـ slug للغات المختلفة من العنوان
    const enSlug = generateSlug(this.title, 'en');
    const arSlug = generateSlug(this.title, 'ar');
    const deSlug = generateSlug(this.title, 'de');
    const esSlug = generateSlug(this.title, 'es');

    // التأكد من أن الـ slug فريد
    const checkEnSlug = await checkSlugExistence(enSlug);
    const checkArSlug = await checkSlugExistence(arSlug);
    const checkDeSlug = await checkSlugExistence(deSlug);
    const checkEsSlug = await checkSlugExistence(esSlug);

    if (checkEnSlug || checkArSlug || checkDeSlug || checkEsSlug) {
      // لو الـ slug مكرر، أضف رقم أو تعديل له ليكون فريد
      this.slug.en = `${enSlug}-${Date.now()}`;
      this.slug.ar = `${arSlug}-${Date.now()}`;
      this.slug.de = `${deSlug}-${Date.now()}`;
      this.slug.es = `${esSlug}-${Date.now()}`;
    } else {
      // لو الـ slug فريد
      this.slug.en = enSlug;
      this.slug.ar = arSlug;
      this.slug.de = deSlug;
      this.slug.es = esSlug;
    }

    next();
  } catch (error) {
    next(error);
  }
});


const Article = mongoose.model('Article', articleSchema);

export default Article;  