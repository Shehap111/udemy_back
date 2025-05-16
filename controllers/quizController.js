import Quiz from '../models/quiz.js';
import mongoose from 'mongoose';

// Create a new quiz with validation
export const createQuiz = async (req, res) => {
  try {
    const { courseId, levelId, quizTitle, questions, isActive = true } = req.body;

    // Validate required fields
    if (!courseId || !levelId || !questions) {
      return res.status(400).json({ message: "Missing required fields: courseId, levelId, or questions" });
    }

    // Validate questions structure
    const isValidQuestions = questions.every(question => 
      question.questionText && 
      question.options && 
      question.options.length > 0 &&
      typeof question.correctAnswerIndex === 'number' &&
      typeof question.score === 'number'
    );

    if (!isValidQuestions) {
      return res.status(400).json({ message: "Invalid questions structure" });
    }

    // Calculate total score
    const totalScore = questions.reduce((sum, question) => sum + question.score, 0);

    const newQuiz = new Quiz({
      courseId,
      levelId,
      quizTitle,
      questions,
      isActive,
      totalScore
    });

    await newQuiz.save();
    res.status(201).json({ 
      success: true,
      message: "Quiz created successfully", 
      data: newQuiz 
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      message: "Server error while creating quiz", 
      error: error.message 
    });
  }
};

// Get quizzes with flexible filtering
export const getQuizzes = async (req, res) => {
  try {
    const { courseId, levelId, isActive } = req.query;

    let filter = {};
    if (courseId) filter.courseId = courseId;
    if (levelId) filter.levelId = levelId;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const quizzes = await Quiz.find(filter)
      .populate('levelId', 'name _id') // Only include name and _id from Level
      .populate('courseId', 'title _id') // Only include title and _id from Course
      .lean(); // Convert to plain JavaScript objects

    if (!quizzes.length) {
      return res.status(200).json({ 
        success: true,
        message: "No quizzes found", 
        data: [] 
      });
    }

    res.status(200).json({ 
      success: true,
      data: quizzes 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching quizzes", 
      error: error.message 
    });
  }
};

// Get specific quiz by ID with detailed population
export const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid quiz ID format" 
      });
    }

    const quiz = await Quiz.findById(id)
      .populate('levelId', 'name description _id')
      .populate('courseId', 'title description _id');

    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: "Quiz not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      data: quiz 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error while fetching quiz", 
      error: error.message 
    });
  }
};

// Update quiz with comprehensive validation
export const updateQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { questions, isActive, courseId, levelId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid quiz ID format" 
      });
    }

    const updateData = {};
    if (questions !== undefined) {
      // Validate questions if provided
      const isValidQuestions = questions.every(question => 
        question.questionText && 
        question.options && 
        question.options.length > 0 &&
        typeof question.correctAnswerIndex === 'number' &&
        typeof question.score === 'number'
      );

      if (!isValidQuestions) {
        return res.status(400).json({ 
          success: false,
          message: "Invalid questions structure" 
        });
      }

      updateData.questions = questions;
      updateData.totalScore = questions.reduce((sum, question) => sum + question.score, 0);
    }

    if (isActive !== undefined) updateData.isActive = isActive;
    if (courseId !== undefined) updateData.courseId = courseId;
    if (levelId !== undefined) updateData.levelId = levelId;

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    )
    .populate('levelId', 'name _id')
    .populate('courseId', 'title _id');

    if (!updatedQuiz) {
      return res.status(404).json({ 
        success: false,
        message: "Quiz not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Quiz updated successfully", 
      data: updatedQuiz 
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ 
        success: false,
        message: "Validation error",
        error: error.message 
      });
    }
    res.status(500).json({ 
      success: false,
      message: "Server error while updating quiz", 
      error: error.message 
    });
  }
};

// Delete quiz with validation
export const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid quiz ID format" 
      });
    }

    const deletedQuiz = await Quiz.findByIdAndDelete(id);

    if (!deletedQuiz) {
      return res.status(404).json({ 
        success: false,
        message: "Quiz not found" 
      });
    }

    res.status(200).json({ 
      success: true,
      message: "Quiz deleted successfully" 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error while deleting quiz", 
      error: error.message 
    });
  }
};

// Toggle quiz active status
export const toggleQuizStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid quiz ID format" 
      });
    }

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ 
        success: false,
        message: "Quiz not found" 
      });
    }

    quiz.isActive = !quiz.isActive;
    await quiz.save();

    res.status(200).json({ 
      success: true,
      message: `Quiz ${quiz.isActive ? 'activated' : 'deactivated'} successfully`,
      data: quiz 
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: "Server error while toggling quiz status", 
      error: error.message 
    });
  }
};