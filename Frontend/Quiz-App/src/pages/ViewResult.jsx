import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ViewResult = () => {
  const location = useLocation();
  const { quizId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?._id || user?.id;
  const baseURL = process.env.REACT_APP_API_BASE_URL;

  const [result, setResult] = useState(location.state?.result || null);
  const [quiz, setQuiz] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResultsAndQuiz = async () => {
      try {
        const [resultRes, quizRes] = await Promise.all([
          fetch(`${baseURL}/api/results/quiz/${quizId}?userId=${userId}`),
          fetch(`${baseURL}/api/quiz/${quizId}`),
        ]);

        const resultData = await resultRes.json();
        const quizData = await quizRes.json();

        if (!resultData || !quizData.quiz || !quizData.questions) {
          throw new Error("Result or Quiz data not found.");
        }

        setResult(resultData);
        setQuiz({ ...quizData.quiz, questions: quizData.questions });

        let calculatedScore = 0;

        resultData.answers.forEach((answer) => {
          const question = quizData.questions.find(
            (q) =>
              q._id === answer.questionId || q._id === answer.questionId?._id
          );
          if (!question) return;

          const selected = answer.selectedOption;
          const correct = question.correctAnswers || [];

          let isCorrect = false;

          if (question.type === "single") {
            isCorrect = correct.includes(selected);
          } else if (question.type === "multiple") {
            isCorrect =
              Array.isArray(selected) &&
              selected.length === correct.length &&
              selected.every((opt) => correct.includes(opt));
          } else if (question.type === "write") {
            const normalized =
              typeof selected === "string" ? selected.trim().toLowerCase() : "";
            const correctNormalized = correct.map((ans) =>
              typeof ans === "string" ? ans.trim().toLowerCase() : ""
            );
            isCorrect = correctNormalized.includes(normalized);
          }

          if (isCorrect) calculatedScore++;
        });

        setScore(calculatedScore);
      } catch (err) {
        console.error("❌ Error loading results:", err);
        setError("Something went wrong while loading quiz result.");
      } finally {
        setLoading(false);
      }
    };

    if (user && (!result || !quiz)) {
      fetchResultsAndQuiz();
    }
  }, [user, quizId, userId]);

  if (!user)
    return (
      <p className="text-center text-red-500">
        Please log in to view your results.
      </p>
    );
  if (loading) return <p className="text-center text-xl">Loading results...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!result || !quiz)
    return <p className="text-center">No result available.</p>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 py-20 px-4">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">📊 Quiz Result</h2>
        <p>
          <strong>Quiz Title:</strong> {quiz.title}
        </p>
        <p>
          <strong>Your Score:</strong> {score} / {quiz.questions.length}
        </p>

        <h3 className="mt-6 font-semibold text-lg">Detailed Answers:</h3>
        <div className="mt-4 space-y-6">
          {quiz.questions.map((q, idx) => {
            const userAnswer = result.answers.find(
              (a) => a.questionId === q._id || a.questionId?._id === q._id
            );
            const selected = userAnswer?.selectedOption;
            const attempted =
              selected !== null &&
              selected !== "" &&
              !(Array.isArray(selected) && selected.length === 0);
            const correct = q.correctAnswers || [];

            let isCorrect = false;
            if (attempted) {
              if (q.type === "single") {
                isCorrect = correct.includes(selected);
              } else if (q.type === "multiple") {
                isCorrect =
                  Array.isArray(selected) &&
                  selected.length === correct.length &&
                  selected.every((opt) => correct.includes(opt));
              } else if (q.type === "write") {
                const normalized =
                  typeof selected === "string"
                    ? selected.trim().toLowerCase()
                    : "";
                const correctNormalized = correct.map((ans) =>
                  typeof ans === "string" ? ans.trim().toLowerCase() : ""
                );
                isCorrect = correctNormalized.includes(normalized);
              }
            }

            const userValue = attempted
              ? Array.isArray(selected)
                ? selected.join(", ")
                : selected
              : "Not answered";

            const correctValue = Array.isArray(correct)
              ? correct.join(", ")
              : correct;

            return (
              <div
                key={q._id}
                className={`p-4 rounded-md border ${
                  !attempted
                    ? "border-yellow-500 bg-yellow-50"
                    : isCorrect
                    ? "border-green-500 bg-green-50"
                    : "border-red-500 bg-red-50"
                }`}>
                <p className="font-semibold">
                  Q{idx + 1}. {q.text}
                </p>
                <p>
                  <strong>Your Answer:</strong>{" "}
                  <span
                    className={
                      !attempted
                        ? "text-yellow-600"
                        : isCorrect
                        ? "text-green-600"
                        : "text-red-600"
                    }>
                    {userValue}
                  </span>
                </p>
                <p>
                  <strong>Correct Answer:</strong>{" "}
                  <span className="text-green-700">{correctValue}</span>
                </p>

                {!attempted ? (
                  <p className="text-sm text-yellow-600 italic mt-1">
                    ⚠️ You skipped this question.
                  </p>
                ) : isCorrect ? (
                  <p className="text-sm text-green-600 italic mt-1">
                    ✅ Your answer is correct.
                  </p>
                ) : (
                  <p className="text-sm text-red-600 italic mt-1">
                    ❌ Your answer is incorrect.
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewResult;
