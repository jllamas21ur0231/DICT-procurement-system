import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Signout from "../pages/Signout";
import pinasLogo from "./images/pinas.png";

const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const ProcurementIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const PPMPIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="9" y1="13" x2="15" y2="13" />
    <line x1="9" y1="17" x2="12" y2="17" />
  </svg>
);

const PurchaseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const SignOutIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const NAV_ITEMS = [
  { label: "Dashboard", icon: <DashboardIcon />, to: "/dashboard" },
  { label: "Procurement", icon: <ProcurementIcon />, to: "/procurement" },
  { label: "PPMP", icon: <PPMPIcon />, to: "/ppmp" },
  //{ label: "Purchase Request", icon: <PurchaseIcon />, to: "/purchase-request" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(true);
  const [showSignout, setShowSignout] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const handleConfirmLogout = async () => {
    try {
      await fetch('/auth/logout', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        credentials: 'include',
      });
    } catch (_) {
      // proceed with local cleanup even if request fails
    }
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/signin');
  };


  return (
    <>
      <aside
        className={`
          ${expanded ? "w-56" : "w-16"}
          min-h-screen flex flex-col
          bg-[#134C62]
          transition-all duration-300 ease-in-out
          overflow-hidden flex-shrink-0
          shadow-[2px_0_12px_rgba(0,0,0,0.15)]
        `}
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center pt-7 pb-3 px-4">
          {expanded ? (
            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center shadow-md">
              <img
                src={pinasLogo}
                alt="DICT RO1"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
          ) : (
            <img
              src={pinasLogo}
              alt="DICT RO1"
              className="w-9 h-9 rounded-full bg-white object-cover"
            />
          )}

          {expanded && (
            <span className="text-white font-extrabold text-xl tracking-wide mt-3">
              DICT RO1
            </span>
          )}
        </div>


        <nav className="flex flex-col gap-1 px-2 flex-1">
          {NAV_ITEMS.map(({ label, icon, to }) => {
            const active =
              location.pathname === to ||
              location.pathname.startsWith(to + "/");

            return (
              <Link
                key={to}
                to={to}
                className={`
                  flex items-center gap-3 rounded-xl text-sm
                  transition-all duration-150 whitespace-nowrap overflow-hidden
                  ${expanded ? "px-3 py-2.5 justify-start" : "px-0 py-2.5 justify-center"}
                  ${active
                    ? "bg-white text-[#134C62] font-semibold"
                    : "text-white/90 hover:bg-white/15 hover:text-white"}
                `}
              >
                <span>{icon}</span>
                {expanded && <span>{label}</span>}
              </Link>
            );
          })}


          <button
            onClick={() => setShowSignout(true)}
            className={`
              flex items-center gap-3 rounded-xl text-sm mt-1
              text-white/90 hover:bg-white/15 hover:text-white
              transition-all duration-150 whitespace-nowrap overflow-hidden
              bg-transparent border-none cursor-pointer w-full
              ${expanded ? "px-3 py-2.5 justify-start" : "px-0 py-2.5 justify-center"}
            `}
          >
            <span><SignOutIcon /></span>
            {expanded && <span>Sign Out</span>}
          </button>
        </nav>


        <button
          onClick={() => setExpanded(!expanded)}
          className={`
            flex items-center justify-center
            w-9 h-9 shadow-md rounded-full
            bg-white/15 hover:bg-white/30
            text-white border-none cursor-pointer
            transition-all duration-200 flex-shrink-0
            ${expanded ? "ml-4 mb-6 mt-5" : "mx-auto mb-6 mt-5"}
          `}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform duration-300 ${expanded ? "rotate-0" : "rotate-180"}`}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </aside>


      <Signout
        isOpen={showSignout}
        onClose={() => setShowSignout(false)}
        onConfirm={handleConfirmLogout}
      />
    </>
  );
}
