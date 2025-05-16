import express from 'express';
import { createArticle, getAllArticles, getArticleById, addComment, addReply, updateArticle } from '../controllers/articleController.js';

const router = express.Router();

// روت إنشاء مقال جديد
router.post('/', createArticle);

// روت الحصول على جميع المقالات
router.get('/', getAllArticles);

// روت الحصول على مقال بناءً على ID
router.get('/:id', getArticleById);

// روت إضافة تعليق للمقال
router.post('/:id/comments', addComment);

// روت إضافة رد على تعليق
router.post('/:articleId/comments/:commentId/replies', addReply);

// روت تعديل مقال بناءً على ID
router.put('/:id', updateArticle);

export default router;
