import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userRoutes from "./routes/userRoutes.js"; // ✅ إضافة استيراد راوت اليوزرز
import courseRoutes from './routes/courseRoutes.js';
import couponRoutes from "./routes/couponRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import cookieParser from "cookie-parser";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from './routes/categoryRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import contactRoutes  from './routes/contactRoutes.js';

 
dotenv.config();

const app = express();
app.use(express.json());


app.use(
  cors({
    origin: "http://localhost:3000", // السماح فقط لهذا الدومين
    credentials: true, // السماح بإرسال الكوكيز والتوكنات
  })
);
app.use(cookieParser()); // 🔥 ضروري لمعالجة الكوكيز

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected...");
  } catch (error) {
    console.error("Database connection failed", error);
    process.exit(1);
  }
};
connectDB();

app.get("/", (req, res) => {
  res.send("API is running...");
});
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));
// راوتس 

app.use("/api/users", userRoutes);
app.use('/api/courses', courseRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stripe", stripeRoutes);
app.use("/api/admin", adminRoutes);
app.use('/api', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/levels', levelRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/articles', articleRoutes);  
app.use('/api/contact', contactRoutes );  



const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // ✅ إضافة مسافة بعد "port"

// عند اكتشاف أي تعديل، يتم إيقاف السيرفر أولًا
process.on("SIGTERM", () => {
  console.log("Closing server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

