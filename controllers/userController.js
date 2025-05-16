import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
// جلب جميع المستخدمين
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password"); // استبعاد الباسورد
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// جلب مستخدم واحد بالـ ID
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// إنشاء مستخدم جديد
export const createUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, profileImage } = req.body;

    // تأكد إن الإيميل مش موجود قبل كده
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // تشفير الباسورد قبل التخزين
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      profileImage,
    });

    await newUser.save();
    res.status(201).json({ message: "User created successfully", newUser });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تحديث بيانات المستخدم
export const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { firstName, lastName, email, profileImage } = req.body;

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.email = email || user.email;
    user.profileImage = profileImage || user.profileImage;

    await user.save();
    res.json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// حذف مستخدم
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من وجود المستخدم
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // مقارنة الباسورد المدخل بالباسورد المشفر
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // إنشاء JWT Token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // ضبط الكوكيز
    res.cookie("token", token, {
      httpOnly: true, // يجعل الكوكي غير متاح للـ JavaScript في المتصفح (أمان أعلى)
      secure: process.env.NODE_ENV === "production", // في الإنتاج يتم إرسال الكوكي فقط عبر HTTPS
      sameSite: "Strict", // منع الهجمات عبر المواقع (CSRF)
      maxAge: 7 * 24 * 60 * 60 * 1000, // مدة الصلاحية 7 أيام
    });

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profileImage: user.profileImage || "/default-avatar.png", // صورة افتراضية
      },
    });
  } catch (error) {
    console.error("❌ Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// ✅ تسجيل خروج المستخدم وحذف الكوكيز
export const logoutUser = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.json({ message: "Logged out successfully" });
};

export const getUserProfile = async (req, res) => {
  try {
    console.log("🔹 Request received for /profile");

    const token = req.cookies?.token; 
    console.log("🔹 Token from cookies:", token);

    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🔹 Decoded token:", decoded);
    } catch (err) {
      console.error("❌ Token verification failed:", err.message);
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findById(decoded.userId).select("-password");
    console.log("🔹 Fetched user:", user);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ user });
  } catch (error) {
    console.error("❌ Error fetching user profile:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export const submitQuizResult = async (req, res) => {
  try {
    const { userId } = req.params;
    const { courseId, quizId, score, totalScore } = req.body;

    const passingRate = 0.7;
    const passed = score / totalScore >= passingRate;

    // هات اليوزر
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // هات الكورس من myCourses
    const courseProgress = user.myCourses.find(
      (c) => c.courseId.toString() === courseId
    );
    if (!courseProgress) {
      return res.status(400).json({ message: 'User not enrolled in this course' });
    }

    // اتأكد إن الكويز ما تضافش قبل كده
    const alreadyCompleted = courseProgress.completedQuizzes.some(
      (quiz) => quiz.quizId.toString() === quizId
    );
    if (alreadyCompleted) {
      return res.status(400).json({ message: 'Quiz already completed' });
    }

    // ضيف الكويز للـ completedQuizzes
    courseProgress.completedQuizzes.push({
      quizId,
      score,
      passed,
    });

    // لو عدى الكويز، زوّد البروجريس بنسبة معينة (مثلاً كل كويز يساوي 20%)
    if (passed) {
      courseProgress.progress = Math.min(courseProgress.progress + 20, 100);
    }

    // احفظ اليوزر بعد التعديل
    await user.save();

    res.status(200).json({
      message: 'Quiz result saved successfully',
      passed,
      newProgress: courseProgress.progress,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};