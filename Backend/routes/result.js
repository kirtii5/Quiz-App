const express = require("express");
const mongoose = require("mongoose");
const Result = require("../models/result");
const Quiz = require("../models/quiz");
const Question = require("../models/questions");

const router = express.Router();



/**
 * 📌 1. Save Quiz Result (User Submits Quiz)
 */
router.post("/submit", async (req, res) => {
    try {
        console.log("📩 Incoming Quiz Submission:", req.body);

        const { quizId, userId, answers } = req.body;

        if (!quizId || !userId || !Array.isArray(answers)) {
            return res.status(400).json({ message: "Invalid request data" });
        }

        let score = 0;

        for (const answer of answers) {
            const question = await Question.findById(answer.questionId);
            if (!question) continue;

            const { type, correctAnswers } = question;
            const selected = answer.selectedOption;

            if (type === "single" && correctAnswers.includes(selected)) {
                score += 1;
            } else if (type === "multiple" && Array.isArray(selected)) {
                const isCorrect =
                    selected.length === correctAnswers.length &&
                    selected.every((opt) => correctAnswers.includes(opt));
                if (isCorrect) score += 1;
            } else if (type === "write" && typeof selected === "string") {
                const normalized = selected.trim().toLowerCase();
                const matches = correctAnswers.map((ans) =>
                    typeof ans === "string" ? ans.trim().toLowerCase() : ""
                );
                if (matches.includes(normalized)) score += 1;
            }
        }

        const result = new Result({ quizId, userId, answers, score });
        await result.save();

        res.status(201).json({
            message: "Quiz submitted successfully",
            resultId: result._id,
            score,
        });
    } catch (error) {
        console.error("❌ Error saving result:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * 📌 2. Fetch All Results for a User
 */
router.get('/user/:userId', async (req, res) => {
    try {
        const results = await Result.find({ userId: req.params.userId }).populate('quizId');
        res.json(results);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

/**
 * 📌 3. Admin View - All Results for a Quiz
 */
router.get("/admin/:quizId", async (req, res) => {
    try {
        const { quizId } = req.params;
        const results = await Result.find({ quizId })
            .populate("userId")
            .populate("answers.questionId");
        res.json(results);
    } catch (error) {
        console.error("❌ Error fetching quiz results:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * 📌 4. Get Specific Result by ID
 */
router.get("/:resultId", async (req, res) => {
    try {
        const { resultId } = req.params;
        const result = await Result.findById(resultId)
            .populate("userId")
            .populate("quizId")
            .populate("answers.questionId");

        if (!result) {
            return res.status(404).json({ message: "Result not found" });
        }

        res.json(result);
    } catch (error) {
        console.error("❌ Error fetching result:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

/**
 * 📌 5. Get Result for a Specific Quiz and User
 */
router.get("/quiz/:quizId", async (req, res) => {
    const { quizId } = req.params;
    const { userId } = req.query;

    const result = await Result.findOne({ quizId, userId })
        .populate("userId")
        .populate("quizId")
        .populate("answers.questionId");

    if (!result) {
        return res.status(404).json({ message: "Result not found" });
    }

    res.json(result);
});


router.get('/user/:userId/quiz/:quizId', async (req, res) => {
    const { userId, quizId } = req.params;
    try {
        const result = await Result.findOne({ quizId, userId }).sort({ submittedAt: -1 });

        if (!result) return res.status(404).json({ error: 'Result not found' });
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


module.exports = router;
