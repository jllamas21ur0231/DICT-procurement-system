import { useNavigate } from "react-router-dom";

/**
 * needToSign.jsx
 * Shown to any user who tries to access a protected page without signing in.
 * Accepts a `signInPath` prop so it can route to either /signin or /sadmin/signin.
 */
export default function NeedToSign({ signInPath = "/signin" }) {
    const navigate = useNavigate();

    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #0a2e3d 0%, #134C62 50%, #1e7a8c 100%)",
                fontFamily: "'Inter', 'Segoe UI', sans-serif",
                padding: "1.5rem",
            }}
        >
            {/* Decorative rings */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
                {[250, 420, 600].map((size, i) => (
                    <div
                        key={i}
                        style={{
                            position: "absolute",
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, -50%)",
                            width: `${size}px`,
                            height: `${size}px`,
                            borderRadius: "50%",
                            border: "1px solid rgba(255,255,255,0.07)",
                        }}
                    />
                ))}
            </div>

            <div
                style={{
                    position: "relative",
                    background: "rgba(255, 255, 255, 0.06)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: "1.5rem",
                    padding: "3rem 2.5rem",
                    maxWidth: "440px",
                    width: "100%",
                    textAlign: "center",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
                }}
            >
                {/* Lock icon */}
                <div
                    style={{
                        width: "72px",
                        height: "72px",
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.12)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1.75rem",
                    }}
                >
                    <svg
                        width="34"
                        height="34"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="rgba(255,255,255,0.9)"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                </div>

                <h1
                    style={{
                        fontSize: "1.75rem",
                        fontWeight: 700,
                        color: "#ffffff",
                        margin: "0 0 0.75rem",
                        letterSpacing: "-0.02em",
                    }}
                >
                    Access Restricted
                </h1>

                <p
                    style={{
                        fontSize: "1rem",
                        color: "rgba(255, 255, 255, 0.65)",
                        lineHeight: 1.6,
                        margin: "0 0 2rem",
                    }}
                >
                    You need to sign in to view this page. Please authenticate to continue.
                </p>

                <button
                    onClick={() => navigate(signInPath)}
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.8rem 2.2rem",
                        background: "linear-gradient(135deg, #1e7a8c, #134C62)",
                        color: "#ffffff",
                        border: "1px solid rgba(255,255,255,0.2)",
                        borderRadius: "0.75rem",
                        fontSize: "1rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                        letterSpacing: "0.01em",
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.35)";
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.25)";
                    }}
                >
                    <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                        <polyline points="10 17 15 12 10 7" />
                        <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                    Sign In
                </button>

                <p
                    style={{
                        marginTop: "1.5rem",
                        fontSize: "0.8rem",
                        color: "rgba(255,255,255,0.35)",
                    }}
                >
                    DICT Procurement System
                </p>
            </div>
        </div>
    );
}
