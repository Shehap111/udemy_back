// middleware/upload.js

import multer from 'multer';
import { cloudinary } from '../config/cloudinary.js';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// إعداد تخزين الصور
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads/images',  // مجلد الصور
    allowed_formats: ['jpeg', 'png', 'jpg'],  // السماح بالصور فقط
    transformation: [
      { width: 800, height: 800, crop: 'limit' },  // تصغير الصور لو حجمها كبير
      { quality: 'auto' },  // تحسين الجودة تلقائيًا
      { fetch_format: 'webp' }  // تحويل الصور إلى WebP
    ]
  }
});

// إعداد تخزين ملفات PDF
const pdfStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'uploads/pdfs',  // مجلد الـ PDFs
    allowed_formats: ['pdf'],  // السماح بملفات PDF فقط
  }
});

// إنشاء الـ multer لكل نوع
const imageUpload = multer({ storage: imageStorage });
const pdfUpload = multer({ storage: pdfStorage });

// التصدير بشكل صحيح
export { imageUpload, pdfUpload };
