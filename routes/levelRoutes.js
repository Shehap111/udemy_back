// routes/levelRoutes.js
import express from "express";
import {
    createLevel, getLevelsByCourse, getLevelById, updateLevel, deleteLevel,
    addLesson, updateLesson, deleteLesson,
    getAllLevels
} from "../controllers/levelController.js";

const router = express.Router();

// جلب جميع المستويات
router.get("/all", getAllLevels);
router.post("/", createLevel);
router.get("/", getLevelsByCourse);
router.get("/:id", getLevelById);
router.put("/:id", updateLevel);
router.delete("/:id", deleteLevel);

router.post("/:id/lesson", addLesson);
router.put("/:levelId/lesson/:lessonId", updateLesson);
router.delete("/:levelId/lesson/:lessonId", deleteLesson);


export default router;
