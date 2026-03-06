import React, { useEffect, useState } from "react";

export default function Profile({ isOpen, onClose }) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProfile = () => {
    setLoading(true);
    setError("");
    setProfile(null);

    fetch("/auth/profile", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load profile.");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => setError(err.message || "Failed to load profile."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isOpen) return;
    loadProfile();
  }, [isOpen]);

  if (!isOpen) return null;

  const firstName = profile?.first_name ?? "";
  const middleName = profile?.middle_name ?? "";
  const lastName = profile?.last_name ?? "";
  const email = profile?.email ?? "";
  const position = profile?.position ?? "";

  const fullName = [firstName, middleName, lastName].filter(Boolean).join(" ");
  const initials = [firstName[0], lastName[0]].filter(Boolean).join("").toUpperCase();

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
        <h2 className="text-2xl font-bold text-[#134C62] mb-6">Profile</h2>

        {/* Loading */}
        {loading && (
          <div className="py-10 flex flex-col items-center gap-3">
            <div className="w-10 h-10 rounded-full border-4 border-[#2B7A8B] border-t-transparent animate-spin" />
            <p className="text-gray-400 text-sm">Loading profile…</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="py-10">
            <p className="text-red-500 text-sm mb-3">{error}</p>
            <button
              onClick={loadProfile}
              className="text-sm text-[#1C7293] hover:underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Profile Data */}
        {!loading && !error && profile && (
          <>
            {/* Avatar */}
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 rounded-full border-[6px] border-[#2B7A8B] shadow-md bg-[#D3EAED] flex items-center justify-center">
                {initials ? (
                  <span className="text-[#134C62] text-3xl font-bold">
                    {initials}
                  </span>
                ) : (
                  <svg className="w-16 h-16 text-[#2B7A8B]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Full Name */}
            <h3 className="text-xl font-bold text-[#134C62] mb-3">
              {fullName || "—"}
            </h3>

            {/* Position Tag */}
            {position && (
              <div className="flex justify-center gap-2 mb-3">
                <span className="px-3 py-1 text-sm border border-gray-400 rounded-lg text-gray-600">
                  {position}
                </span>
              </div>
            )}

            {/* Email */}
            <p className="text-gray-500 text-sm">{email || "—"}</p>
          </>
        )}
      </div>
    </div>
  );
}