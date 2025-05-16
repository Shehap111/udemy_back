// controllers/levelController.js
import Level from "../models/levels.js";

// إنشاء مستوى جديد
export const createLevel = async (req, res) => {
    try {
        const level = new Level(req.body);
        await level.save();
        res.status(201).json(level);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// جلب جميع المستويات لكورس معين
export const getLevelsByCourse = async (req, res) => {
    try {
        const { courseId } = req.query;
        const levels = await Level.find({ CourseId: courseId });
        res.json(levels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// جلب مستوى معين بالتفاصيل
export const getLevelById = async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ message: "Level not found" });
        res.json(level);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// تحديث بيانات مستوى معين
export const updateLevel = async (req, res) => {
    try {
        const level = await Level.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!level) return res.status(404).json({ message: "Level not found" });
        res.json(level);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// حذف مستوى معين
export const deleteLevel = async (req, res) => {
    try {
        const level = await Level.findByIdAndDelete(req.params.id);
        if (!level) return res.status(404).json({ message: "Level not found" });
        res.json({ message: "Level deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// إضافة درس جديد لمستوى معين
export const addLesson = async (req, res) => {
    try {
        const level = await Level.findById(req.params.id);
        if (!level) return res.status(404).json({ message: "Level not found" });
        level.lessons.push(req.body);
        await level.save();
        res.json(level);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// تحديث بيانات درس معين
export const updateLesson = async (req, res) => {
    try {
        const level = await Level.findById(req.params.levelId);
        if (!level) return res.status(404).json({ message: "Level not found" });
        
        const lesson = level.lessons.id(req.params.lessonId);
        if (!lesson) return res.status(404).json({ message: "Lesson not found" });
        
        Object.assign(lesson, req.body);
        await level.save();
        res.json(level);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// حذف درس معين
export const deleteLesson = async (req, res) => {
    try {
        const level = await Level.findById(req.params.levelId);
        if (!level) return res.status(404).json({ message: "Level not found" });
        
        level.lessons = level.lessons.filter(lesson => lesson._id.toString() !== req.params.lessonId);
        await level.save();
        res.json(level);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// جلب جميع المستويات في الكولكشن
export const getAllLevels = async (req, res) => {
    try {
        const levels = await Level.find();
        res.json(levels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};