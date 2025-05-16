// models/Quiz.js
import mongoose from 'mongoose';

const { Schema, model, Types } = mongoose;

const quizSchema = new Schema({
  levelId: {type: Types.ObjectId, ref: 'Level', required: true},
  courseId: {type: Types.ObjectId, ref: 'Course', required: true},
  quizTitle: { type: String, required: true },
  isActive: { type: Boolean, default: true }, // حالة التفعيل للكويز
  totalScore: { type: Number, default: 0 }, // إجمالي السكور للكويز
  questions: [
    {
      questionText: { type: String, required: true }, // نص السؤال بلغة واحدة فقط
      options: [{ type: String, required: true }], // مصفوفة من الاختيارات بنفس اللغة
      correctAnswerIndex: { type: Number, required: true },
      score: { type: Number, required: true }
    }
  ]
}, { timestamps: true });

export default model('Quiz', quizSchema);
