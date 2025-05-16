import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "https://res.cloudinary.com/dr04edmf5/image/upload/v1747341071/defaultImage_nonr95.jpg" },
    role: { type: String, enum: ["admin", "instructor", "student"], default: "student" },
    isAdmin: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true }, // ✅ تم إضافة هذا الحقل
    myCourses: [
      {
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
        progress: {type: Number, default: 0},
        completedQuizzes: [
          {
            quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
            score: { type: Number, required: true },
            passed: { type: Boolean, required: true },
            completedAt: { type: Date, default: Date.now }
          }
        ]        
      },
    ],
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
