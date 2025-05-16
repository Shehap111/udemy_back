import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const levelSchema = new Schema({
  levelTitle: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    de: { type: String, required: true },
    es: { type: String, required: true }
  },
  levelDescription: {
    en: { type: String, required: true },
    ar: { type: String, required: true },
    de: { type: String, required: true },
    es: { type: String, required: true }
  },
  lessons: [
    {
      lessonTitle: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
        de: { type: String, required: true },
        es: { type: String, required: true }
      },
      videoUrl: { type: String, required: true },
      content: {
        en: { type: String, required: true },
        ar: { type: String, required: true },
        de: { type: String, required: true },
        es: { type: String, required: true }
      },
      lessonDuration: { type: Number, required: true },  
    }
  ],
  CourseId: { type: Types.ObjectId, ref: 'courses', required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default model('Level', levelSchema);
