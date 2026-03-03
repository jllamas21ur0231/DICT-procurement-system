import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import pinasLogo from "../../components/images/pinas.png";

export default function SAdminSignIn() {
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

        setError("");
        setIsSubmitting(true);

        try {
            const response = await fetch("/sadmin/request-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({ email: trimmed }),
            });

            if (!response.ok) {
                let message = "Sign in failed. Please try again.";
                try {
                    const data = await response.json();
                    if (data?.message) message = data.message;
                } catch {
                    // ignore JSON parse errors
                }
                setError(message);
                return;
            }

            navigate("/sadmin/otp", { state: { email: trimmed } });
        } catch {
            setError("Unable to reach the server. Please check your connection.");
        } finally {
            setIsSubmitting(false);
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
                        className="w-36 h-36 object-contain"
                        onError={(e) => {
                            e.target.style.display = "none";
                        }}
                    />

                    {/* Heading */}
                    <div className="text-center">
                        <h2
                            className="font-extrabold text-3xl"
                            style={{ color: "#134C62" }}
                        >
                            Admin Sign In
                        </h2>
                        <p className="text-gray-500 text-sm mt-1">
                            Sign in to your account.
                        </p>
                    </div>

                    {/* Form */}
                    <form
                        onSubmit={handleSignIn}
                        className="w-full flex flex-col gap-3"
                    >
                        <input
                            type="email"
                            placeholder="Enter email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-11 px-4 rounded-lg bg-white border border-gray-200 text-sm text-gray-700 placeholder:text-gray-400 outline-none focus:ring-2 transition"
                            style={{ focusRingColor: "#134C62" }}
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
                            className="w-full h-11 text-white font-bold text-sm rounded-lg transition-colors"
                            style={{ backgroundColor: "#134C62" }}
                        >
                            {isSubmitting ? "Signing in..." : "Sign In"}
                        </Button>
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
