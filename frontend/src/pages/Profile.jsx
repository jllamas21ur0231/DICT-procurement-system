import React from "react";

export default function Profile({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white w-[90%] max-w-md rounded-3xl shadow-2xl p-8 text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-6 text-black text-2xl font-bold hover:scale-110 transition"
        >
          ✕
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold text-[#134C62] mb-6">
          Profile
        </h2>

        {/* Profile Image */}
        <div className="flex justify-center mb-4">
          <div className="w-32 h-32 rounded-full border-[6px] border-[#2B7A8B] overflow-hidden shadow-md">
            <img
              src="https://i.pravatar.cc/300"
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Username */}
        <p className="text-[#134C62] text-sm font-medium mb-2">
          johndoe234
        </p>

        {/* Full Name */}
        <h3 className="text-xl font-bold text-[#134C62] mb-3">
          Juanette Catalene Lictaoa
        </h3>

        {/* Tags */}
        <div className="flex justify-center gap-2 mb-3">
          <span className="px-3 py-1 text-sm border border-gray-400 rounded-lg text-gray-600">
            Engr. II
          </span>
          <span className="px-3 py-1 text-sm border border-gray-400 rounded-lg text-gray-600">
            Free WiFi 4 All
          </span>
        </div>

        {/* Email */}
        <p className="text-gray-500 text-sm">
          cataliyahdm@gmail.com
        </p>
      </div>
    </div>
  );
}
