import express from 'express';
import { addCategory, updateCategory, getCategories, getCategoryById } from '../controllers/categoryController.js';

const router = express.Router();

// إضافة كاتيجوري
router.post('/add', addCategory);

// تعديل كاتيجوري
router.put('/:id', updateCategory);

// عرض جميع الكاتيجوريات
router.get('/', getCategories);

// عرض كاتيجوري واحدة
router.get('/:id', getCategoryById);

export default router;
