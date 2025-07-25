import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle, FaEllipsisV } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

export default function Profile() {
  const { user, signOut, token } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [adminResults, setAdminResults] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/");
    } else {
      fetchUserResults();

      if (user.role === "admin") {
        fetchAdminResults();
      }
    }
  }, [user, navigate]);

  const fetchUserResults = async () => {
    try {
      const res = await axios.get(
        `https://quiz-app-vrxp.onrender.com/api/results/user/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResults(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch results:", err);
    }
  };

  const fetchAdminResults = async () => {
    try {
      const res = await axios.get(
        `https://quiz-app-vrxp.onrender.com/api/results/admin-all-results`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAdminResults(res.data);
    } catch (err) {
      console.error("Admin fetch failed:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 pt-20 pb-10 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-10 w-full max-w-4xl relative">
        {/* Three Dots Menu */}
        <div className="absolute top-4 right-6">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-gray-600 text-xl focus:outline-none"
          >
            <FaEllipsisV />
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-28 bg-white border rounded-lg shadow z-50">
              <button
                onClick={() => {
                  signOut();
                  navigate("/");
                }}
                className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-100"
              >
                Logout
              </button>
            </div>
          )}
        </div>

        {/* User Info */}
        <div className="text-center mb-8">
          <FaUserCircle className="text-7xl text-gray-400 mx-auto mb-3" />
          <h2 className="text-3xl font-semibold text-gray-800">{user?.name}</h2>
          <p className="text-md text-gray-500">{user?.email}</p>
        </div>

        {/* User's Own Results */}
        <div>
          <h3 className="text-xl font-semibold text-gray-700 mb-4">
            Your Quiz Results
          </h3>
          {results.length > 0 ? (
            <table className="w-full table-auto text-left">
              <thead>
                <tr className="bg-indigo-100 text-gray-700">
                  <th className="px-4 py-2">Quiz</th>
                  <th className="px-4 py-2">Score</th>
                  <th className="px-4 py-2">Date</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr
                    key={result._id}
                    className="border-b border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-4 py-2">
                      {result.quizId?.title || "Untitled Quiz"}
                    </td>
                    <td className="px-4 py-2">
                      {result.score} /{" "}
                      {result.totalQuestions || result.answers.length}
                    </td>
                    <td className="px-4 py-2">
                      {new Date(result.submittedAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No quiz results found.</p>
          )}
        </div>

        {/* Admin View of All Quiz Attempts */}
        {user?.role === "admin" && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              📊 All Quiz Attempts
            </h3>
            {adminResults.length > 0 ? (
              <table className="w-full table-auto text-left border">
                <thead>
                  <tr className="bg-indigo-200 text-gray-800">
                    <th className="px-4 py-2">Student</th>
                    <th className="px-4 py-2">Email</th>
                    <th className="px-4 py-2">Quiz</th>
                    <th className="px-4 py-2">Score</th>
                    <th className="px-4 py-2">Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {adminResults.map((res) => (
                    <tr key={res._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-2">{res.userId?.name}</td>
                      <td className="px-4 py-2">{res.userId?.email}</td>
                      <td className="px-4 py-2">{res.quizId?.title}</td>
                      <td className="px-4 py-2">
                        {res.score} / {res.totalQuestions}
                      </td>
                      <td className="px-4 py-2">
                        {new Date(res.submittedAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No results found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
