import express from 'express';
import { createContact, getAllMessages } from '../controllers/contactController.js';

const router = express.Router();

// إرسال رسالة
router.post('/', createContact);

// ✅ جلب كل الرسائل (للأدمن)
router.get('/', getAllMessages);

export default router;
