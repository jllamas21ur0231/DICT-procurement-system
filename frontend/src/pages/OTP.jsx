import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import pinasLogo from "../components/images/pinas.png";

export default function OTP() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (!email) {
      setError("Missing email. Please sign in again.");
      navigate("/signin");
      return;
    }

    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit code sent to your email.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/auth/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, otp: otpCode }),
      });

      if (!response.ok) {
        let message = "Invalid or expired code. Please try again.";
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore JSON parse errors
        }
        setError(message);
        return;
      }

      navigate("/dashboard");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Missing email. Please sign in again.");
      navigate("/signin");
      return;
    }

    setError("");
    setIsResending(true);

    try {
      const response = await fetch("/auth/resend-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        let message = "Failed to resend code. Please try again.";
        try {
          const data = await response.json();
          if (data?.message) {
            message = data.message;
          }
        } catch {
          // ignore JSON parse errors
        }
        setError(message);
        return;
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignIn = () => {
    navigate("/signin");
  };

  return (
    <div className="flex min-h-screen w-full">

      {/* Left Panel */}
      <div className="w-[650px] flex-shrink-0 bg-[#134C62] flex flex-col px-10 py-8">
        {/* Top: Brand */}
        <div>
          <h1 className="text-white font-extrabold text-2xl tracking-wide">DICT RO1</h1>
        </div>

        {/* Center: Logo + Title */}
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

        {/* Bottom: Copyright */}
        <div className="text-center">
          <p className="text-white/60 text-sm">© DICT RO1 2023. All Rights Reserved</p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 bg-white flex items-center justify-center px-8">
        {/* Card */}
        <div className="w-full max-w-md bg-[#EAF2F5] rounded-3xl shadow-lg px-10 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-[#0e7490] font-extrabold text-4xl mb-3">Verify Email</h2>
            <p className="text-gray-500 text-sm">
              A verification code has been sent to your<br />
              registered email address.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleVerify} className="flex flex-col gap-6">
            {/* OTP Input Boxes */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-12 text-center text-xl font-semibold bg-white border-2 border-gray-300 rounded-lg outline-none focus:border-[#0e7490] focus:ring-2 focus:ring-[#0e7490]/20 transition"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center" role="alert">
                {error}
              </p>
            )}

            {/* Verify Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-[#0e7490] hover:bg-[#0c5f73] disabled:bg-[#0e7490]/60 text-white font-bold text-base rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Verifying..." : "Verify & Register"}
              <span className="text-xl">→</span>
            </Button>

            {/* Bottom Links */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="flex items-center gap-2 text-gray-700 hover:text-[#0e7490] disabled:text-gray-400 transition"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {isResending ? "Resending..." : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={handleBackToSignIn}
                className="flex items-center gap-2 text-gray-700 hover:text-[#0e7490] transition"
              >
                <span>← Back to sign in</span>
              </button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}