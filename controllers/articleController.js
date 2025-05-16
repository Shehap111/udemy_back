import Article from '../models/article.js';
import slugify from 'slugify';

// دالة لتوليد slug مع الحفاظ على العربي
const generateSlug = (text) => {
  return slugify(text, {
    lower: true,  // تحويل كل الحروف للأحرف الصغيرة
    strict: true, // إزالة الحروف غير المتوافقة مع الـ slug
    remove: /[^\u0621-\u064A\u0660-\u0669a-zA-Z0-9 -]/g  // الحفاظ على الحروف العربية واللاتينية والأرقام
  });
};

// دالة توليد slug فريدة
const generateUniqueSlugs = async (titleObj) => {
  const slugs = {};

  for (const lang of Object.keys(titleObj)) {
    let baseSlug = generateSlug(titleObj[lang]);
    let uniqueSlug = baseSlug;
    let exists = await Article.findOne({ [`slug.${lang}`]: uniqueSlug });

    while (exists) {
      uniqueSlug = `${baseSlug}-${Date.now()}`;
      exists = await Article.findOne({ [`slug.${lang}`]: uniqueSlug });
    }

    slugs[lang] = uniqueSlug;
  }

  return slugs;
};

// إنشاء مقال جديد
export const createArticle = async (req, res) => {
  try {
    const slugs = await generateUniqueSlugs(req.body.title);
    const article = new Article({
      ...req.body,
      slug: slugs
    });

    await article.save();
    res.status(201).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// الحصول على كل المقالات
export const getAllArticles = async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    if (articles.length === 0) {
      return res.status(404).json({ message: 'No articles found' });
    }
    res.json(articles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// الحصول على مقال بـ ID
export const getArticleById = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });
    res.json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// تحديث مقال
export const updateArticle = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    if (req.body.title) {
      const updatedSlugs = await generateUniqueSlugs(req.body.title);
      req.body.slug = updatedSlugs;
    }

    Object.assign(article, req.body);
    article.updatedAt = new Date();

    await article.save();
    res.status(200).json(article);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// إضافة كومنت
export const addComment = async (req, res) => {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const comment = {
      commenterName: req.body.commenterName,
      commenterImage: req.body.commenterImage,
      content: req.body.content,
      createdAt: new Date()
    };
    article.comments.push(comment);
    await article.save();
    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// إضافة رد على كومنت
export const addReply = async (req, res) => {
  try {
    const article = await Article.findById(req.params.articleId);
    if (!article) return res.status(404).json({ message: 'Article not found' });

    const comment = article.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });

    const reply = {
      replierName: req.body.replierName,
      replierImage: req.body.replierImage,
      content: req.body.content,
      createdAt: new Date()
    };
    comment.replies.push(reply);
    await article.save();
    res.status(201).json(reply);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};