import express from 'express';
import { imageUpload, pdfUpload } from '../middleware/upload.js';  // استيراد الـ multer

const router = express.Router();

// راوت لرفع الصور
router.post('/upload-image', (req, res) => {
  imageUpload.single('image')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ message: 'خطأ في رفع الصورة', error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
    }

    const { path, filename, originalname, size } = req.file;

    res.status(200).json({
      message: 'تم رفع الصورة بنجاح',
      file: {
        url: path, // دا اللينك المباشر من Cloudinary
        filename,
        originalname,
        size,
      },
    });
  });
});

// راوت لرفع ملفات PDF
router.post('/upload-pdf', async (req, res) => {
  try {
    pdfUpload.single('pdfFile')(req, res, (err) => {
      if (err) {
        return res.status(400).json({ message: 'خطأ في رفع ملف PDF', error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: 'لم يتم رفع أي ملف PDF' });
      }

      res.json({
        message: 'تم رفع ملف PDF بنجاح',
        file: req.file,  // تفاصيل ملف PDF
      });
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء رفع ملف PDF' });
  }
});

export default router;
