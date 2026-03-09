import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation, useNavigate } from "react-router-dom";
import pinasLogo from "../../components/images/pinas.png";

export default function SAdminOTP() {
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
        document.getElementById(`sadmin-otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`sadmin-otp-${index - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (!email) {
      setError("Missing email. Please sign in again.");
      navigate("/sadmin/signin");
      return;
    }

    if (otpCode.length !== 6) {
      setError("Please enter the 6-digit code sent to your email.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/sadmin/verify-otp", {
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
          if (data?.message) message = data.message;
        } catch {
          // ignore JSON parse errors
        }
        setError(message);
        return;
      }

      navigate("/sadmin/dashboard");
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) {
      setError("Missing email. Please sign in again.");
      navigate("/sadmin/signin");
      return;
    }

    setError("");
    setIsResending(true);

    try {
      const response = await fetch("/sadmin/resend-otp", {
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
          if (data?.message) message = data.message;
        } catch {
          // ignore
        }
        setError(message);
      }
    } catch {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#1e7a8c" }}
    >
      {/* Top-left brand */}
      <div className="px-8 py-6">
        <h1 className="text-white font-extrabold text-2xl tracking-wide">
          DICT RO1
        </h1>
      </div>

      {/* Centered card */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div
          className="w-full max-w-sm rounded-3xl shadow-xl px-10 py-12 flex flex-col items-center gap-6"
          style={{ backgroundColor: "#dceef4" }}
        >
          {/* Logo */}
          <img
            src={pinasLogo}
            alt="DICT RO1 Logo"
            className="w-28 h-28 object-contain"
            onError={(e) => { e.target.style.display = "none"; }}
          />

          {/* Heading */}
          <div className="text-center">
            <h2
              className="font-extrabold text-3xl"
              style={{ color: "#134C62" }}
            >
              Verify Email
            </h2>
            <p className="text-gray-500 text-sm mt-2">
              A 6-digit code was sent to<br />
              <span className="font-medium text-gray-700">{email}</span>
            </p>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleVerify} className="w-full flex flex-col gap-5">
            {/* 6 digit boxes */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`sadmin-otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-11 text-center text-xl font-semibold bg-white border-2 border-gray-300 rounded-lg outline-none transition"
                  style={{ borderColor: digit ? "#134C62" : undefined }}
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-600 text-center" role="alert">
                {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 text-white font-bold text-sm rounded-lg transition-colors"
              style={{ backgroundColor: "#134C62" }}
            >
              {isSubmitting ? "Verifying..." : "Verify & Sign In"}
            </Button>

            {/* Links row */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="text-gray-600 hover:underline disabled:text-gray-400 transition"
              >
                {isResending ? "Resending..." : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={() => navigate("/sadmin/signin")}
                className="text-gray-600 hover:underline transition"
              >
                ← Back to sign in
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center pb-6">
        <p className="text-white/70 text-sm">
          © DICT RO1 2023. All Rights Reserved
        </p>
      </div>
    </div>
  );
}