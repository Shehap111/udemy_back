// routes/quizRoutes.js
import express from 'express';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  toggleQuizStatus
} from '../controllers/quizController.js';

const router = express.Router();

// Create a new quiz
router.post('/', createQuiz);

// Get quizzes with optional filtering
// Can filter by courseId, levelId, and isActive
// Example: /quizzes?courseId=123&levelId=456&isActive=true
router.get('/', getQuizzes);

// Get a specific quiz by ID
router.get('/:id', getQuizById);

// Update a quiz
router.put('/:id', updateQuiz);

// Delete a quiz
router.delete('/:id', deleteQuiz);

// Toggle quiz active status
router.patch('/:id/toggle-status', toggleQuizStatus);

export default router;