import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import { useAuth } from "../context/AuthContext"; 

export default function Profile() {
  const { user, signOut } = useAuth(); // ✅ Now logout is available
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
        <FaUserCircle className="text-6xl mx-auto text-gray-500" />
        {user ? (
          <>
            <h2 className="text-2xl font-bold mt-3">{user.name}</h2>
            <p className="text-gray-600">{user.email}</p>
            <button
              onClick={() => {
                signOut();  // ✅ Clears user session
                navigate("/"); // ✅ Redirects to home
              }}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
              Logout
            </button>
          </>
        ) : (
          <p className="text-gray-600">Loading...</p>
        )}
      </div>
    </div>
  );
}
