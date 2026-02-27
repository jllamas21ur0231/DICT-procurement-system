import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import pinasLogo from "../components/images/pinas.png";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e) => {
    e.preventDefault();

    const trimmed = email.trim().toLowerCase();

    if (!trimmed) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!trimmed.endsWith("@gmail.com")) {
      setError("Only Gmail addresses are allowed (example@gmail.com).");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email: trimmed }),
      });

      if (!response.ok) {
        let message = "Failed to request OTP. Please try again.";
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore JSON parse errors and keep default message
        }
        setError(message);
        return;
      }

      navigate("/signin-otp", {
        state: { email: trimmed },
      });
    } catch (err) {
      setError("Unable to reach the server. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <div className="w-[650px] flex-shrink-0 bg-[#134C62] flex flex-col px-10 py-8">
        <div>
          <h1 className="text-white font-extrabold text-2xl tracking-wide">DICT RO1</h1>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 gap-6">
          <img
            src={pinasLogo}
            alt="DICT RO1 Logo"
            className="w-44 h-44 object-contain drop-shadow-lg bg-white rounded-full shadow-md"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <h2 className="text-white font-extrabold text-2xl text-center leading-snug">
            Department of Information and<br />
            Communications Technology<br />
            Regional Office 1
          </h2>
        </div>

        <div className="text-center">
          <p className="text-white/60 text-sm">© DICT RO1 2023. All Rights Reserved</p>
        </div>
      </div>

      <div className="flex-1 bg-white flex items-center justify-center px-8">
        <div className="w-full max-w-md bg-[#EAF2F5] rounded-3xl shadow-lg px-10 py-12">
          <div className="text-center mb-8">
            <h2 className="text-[#134C62] font-extrabold text-4xl mb-2">
              Sign In
            </h2>
            <p className="text-gray-500 text-sm">
              Enter your Gmail address to receive an OTP
            </p>
          </div>

          <form onSubmit={handleSignIn} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Enter your Gmail address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[#134C62]/30 transition"
              autoFocus
            />

            {error && (
              <p className="text-sm text-red-600" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#134C62] hover:bg-[#0e3a4d] disabled:bg-[#134C62]/60 text-white font-bold text-sm rounded-lg transition-colors"
            >
              {isSubmitting ? "Requesting OTP..." : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-gray-500 text-xs mt-6">
            We'll send a one-time password to your registered contact
          </p>
        </div>
      </div>
    </div>
  );
}