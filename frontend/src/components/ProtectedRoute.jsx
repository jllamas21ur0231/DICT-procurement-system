import { useEffect, useState } from "react";
import NeedToSign from "../pages/needToSign";

/**
 * ProtectedRoute — wraps end-user pages.
 * Calls GET /auth/me to check if the user session is valid.
 * Shows a loading indicator while checking, then either renders
 * the children or the NeedToSign page.
 */
export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("checking"); // "checking" | "ok" | "unauth"

    useEffect(() => {
        let cancelled = false;

        fetch("/auth/me", {
            headers: { Accept: "application/json" },
            credentials: "include",
        })
            .then((res) => {
                if (!cancelled) setStatus(res.ok ? "ok" : "unauth");
            })
            .catch(() => {
                if (!cancelled) setStatus("unauth");
            });

        return () => { cancelled = true; };
    }, []);

    if (status === "checking") {
        return (
            <div
                style={{
                    minHeight: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#f8fafc",
                    fontFamily: "'Inter', sans-serif",
                    color: "#64748b",
                    fontSize: "0.95rem",
                    gap: "0.65rem",
                }}
            >
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ animation: "spin 1s linear infinite" }}
                >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                Verifying session…
            </div>
        );
    }

    if (status === "unauth") {
        return <NeedToSign signInPath="/signin" />;
    }

    return children;
}
