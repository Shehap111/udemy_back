import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";

// Routes
import userRoutes from "./routes/userRoutes.js";
import courseRoutes from './routes/courseRoutes.js';
import couponRoutes from "./routes/couponRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import stripeRoutes from "./routes/stripeRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from './routes/categoryRoutes.js';
import levelRoutes from './routes/levelRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import articleRoutes from './routes/articleRoutes.js';
import contactRoutes from './routes/contactRoutes.js';

dotenv.config();

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: "https://udemy-front-alpha.vercel.app/", // عدله لو شغال بـ دومين تاني
    credentials: true,
  })
);

app.use(cookieParser());

// اتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB Connected...");
  } catch (error) {
    console.error("❌ Database connection failed", error);
    process.exit(1);
  }
};

connectDB();

// Stripe webhook لازم يكون قبل أي ميدل وير ثاني
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// Routes
app.get("/", (req, res) => {
  res.send("API is running...");
});

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
app.use('/api/contact', contactRoutes);  

// ✅ أهم نقطة: بدل app.listen
export default app;
