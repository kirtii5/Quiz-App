import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = sessionStorage.getItem("user");

      // Ensure storedUser is valid before parsing
      if (storedUser && storedUser !== "undefined") {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser && typeof parsedUser === "object") {
          setUser(parsedUser);
        } else {
          console.error("Invalid user data format");
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      setUser(null);
      sessionStorage.removeItem("user"); // Clear corrupted data
    }
  }, []);

  return (
    <div className="flex flex-col justify-start items-center min-h-screen bg-gradient-to-r from-blue-100 to-purple-200 pt-40">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">
        Test Your Knowledge, Track Your Progress
      </h1>
      <h3 className="text-xl font-bold text-gray-800 mb-8">
        Simplified Assessment for Students & Educators
      </h3>

      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-5xl w-full flex flex-row gap-8 border border-gray-300">
        {/* ✅ Start Quiz Button */}
        <div className="flex-1 shadow-md rounded-xl p-6 transition-transform hover:scale-105 text-center border border-gray-300 hover:shadow-lg bg-blue-50">
          <h5 className="text-xl font-semibold mb-4">Start a Quiz</h5>
          <p className="text-gray-600 mb-6">
            Enter your unique quiz code and begin the test.
          </p>
          <button
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition"
            onClick={() => {
              if (!user) {
                alert("You need to login as student to start a quiz.");
                navigate("/login");
              } else if (user.role !== "student") {
                alert("Only students can access the quiz.");
              } else {
                navigate("/verify-captcha");
              }
            }}>
            Start Quiz
          </button>
        </div>

        {/* ✅ Create Quiz Button */}
        <div className="flex-1 shadow-md rounded-xl p-6 transition-transform hover:scale-105 text-center border border-gray-300 hover:shadow-lg bg-purple-50">
          <h5 className="text-xl font-semibold mb-4">Create a Quiz</h5>
          <p className="text-gray-600 mb-6">
            Upload questions and generate a quiz code.
          </p>
          <button
            className="w-full bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition"
            onClick={() => {
              if (!user) {
                alert("You need to login as admin to create a quiz.");
                navigate("/login");
              } else if (user.role !== "admin") {
                alert("Only admins can create quizzes.");
              } else {
                navigate("/create-quiz");
              }
            }}>
            Create Quiz
          </button>
        </div>
      </div>
    </div>
  );
}
