import { Schema, model, Types } from 'mongoose';

const courseSchema = new Schema({
  title: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    de: { type: String, required: true },
    es: { type: String, required: true }
  },
  isActive: { type: Boolean, default: true },
  description: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    de: { type: String, required: true },
    es: { type: String, required: true }
  },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  instructor: {
    name: { type: String, required: true },
    image: { type: String, required: true }
  },
  categoryId: { type: Types.ObjectId, ref: 'categories', required: true },
  purchasesCount: {type: Number, default: 0},
  introVideo: {type: String, required: false},
  pdfFiles: { type: [String], required: false },  
  
}, { timestamps: true });

export default model('Course', courseSchema);
