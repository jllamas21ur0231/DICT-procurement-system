import React from "react";
import { LogOut } from "lucide-react";

function Signout({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-8 w-[90%] max-w-md text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 flex items-center justify-center rounded-full border-4 border-red-500">
            <LogOut className="text-red-500 w-8 h-8" />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-teal-700 mb-2">
          Sign Out
        </h2>

        {/* Description */}
        <p className="text-gray-500 text-sm mb-6">
          Please confirm if you wish to sign out from your current session.
        </p>

        {/* Buttons */}
        <div className="flex justify-center gap-4">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-lg bg-teal-700 text-white font-medium hover:bg-teal-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default Signout;
