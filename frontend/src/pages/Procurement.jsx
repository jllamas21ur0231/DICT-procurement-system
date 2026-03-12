import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE = 6;
const MY_PAGE_SIZE = 6;

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "ongoing", label: "On-going" },
  { value: "approved", label: "Approved" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "disapproved", label: "Disapproved" },
];

// ─── Shared helpers ───────────────────────────────────────────────────────────
function getStatusStyle(status) {
  const v = (status || "").toLowerCase();
  if (["pending", "ongoing", "on-going"].includes(v)) return "bg-yellow-400 text-black";
  if (["approved", "accepted"].includes(v)) return "bg-teal-600 text-white";
  if (["rejected", "disapproved"].includes(v)) return "bg-red-500 text-white";
  return "bg-gray-200 text-gray-800";
}

function formatStatus(status) {
  if (!status) return "";
  return String(status).charAt(0).toUpperCase() + String(status).slice(1);
}

function formatDate(timestamp) {
  if (!timestamp) return "";
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return timestamp;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

// ─── My Procurements Modal ────────────────────────────────────────────────────
function MyProcurementsModal({ onClose, onNavigate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let isMounted = true;
    const fetchMine = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch("/procurements/mine", {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!res.ok) throw new Error("Failed to load your procurements.");
        const data = await res.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (isMounted) setItems(list);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load your procurements.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchMine();
    return () => { isMounted = false; };
  }, []);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      const statusMatch = !filterStatus || (item.status || "").toLowerCase() === filterStatus;
      const q = search.toLowerCase();
      const searchMatch = !q || [item.procurement_no, item.title, item.procurement_mode?.name]
        .some((v) => String(v || "").toLowerCase().includes(q));
      return statusMatch && searchMatch;
    });
  }, [items, filterStatus, search]);

  useEffect(() => { setPage(1); }, [search, filterStatus]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / MY_PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * MY_PAGE_SIZE, page * MY_PAGE_SIZE);
  const hasFilters = search || filterStatus;

  const handleBackdrop = (e) => { if (e.target === e.currentTarget) onClose(); };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden flex flex-col max-h-[90vh]">

        {/* ── Modal header ── */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-[#EEF8FB]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1C7293] flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="2" y="7" width="20" height="14" rx="2" />
                <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
                <line x1="12" y1="12" x2="12" y2="16" />
                <line x1="10" y1="14" x2="14" y2="14" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">My Procurements</h2>
              <p className="text-xs text-gray-500">Procurements you have submitted</p>
            </div>
            {!loading && !error && (
              <span className="ml-1 bg-[#1C7293] text-white text-xs font-bold px-2.5 py-0.5 rounded-full">
                {filtered.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* ── Filters ── */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-100 flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg w-48 focus:outline-none focus:ring-2 focus:ring-[#1C7293] bg-white"
            />
            <svg className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293] bg-white"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setFilterStatus(""); }}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Table ── */}
        <div className="overflow-y-auto flex-1">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-700 text-sm border-b sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Proc No.</th>
                <th className="px-6 py-3 text-left font-semibold">Title</th>
                <th className="px-6 py-3 text-left font-semibold">Mode</th>
                <th className="px-6 py-3 text-left font-semibold">Status</th>
                <th className="px-6 py-3 text-left font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-500">
                      <svg className="w-5 h-5 animate-spin text-[#1C7293]" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                      </svg>
                      Loading your procurements...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-red-600">{error}</td></tr>
              )}
              {!loading && !error && paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-14 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M9 12h6m-3-3v6M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0z" />
                      </svg>
                      <p className="text-sm font-medium">No procurements found.</p>
                      {hasFilters && <p className="text-xs">Try clearing your filters.</p>}
                    </div>
                  </td>
                </tr>
              )}
              {!loading && !error && paginated.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => { onClose(); onNavigate(`/procurement/${item.id}`); }}
                  className="border-b hover:bg-[#EEF8FB] cursor-pointer transition-colors"
                  title="View procurement details"
                >
                  <td className="px-6 py-4 text-red-500 font-semibold whitespace-nowrap text-sm">{item.procurement_no}</td>
                  <td className="px-6 py-4 font-medium text-gray-800 text-sm max-w-[220px] truncate">{item.title}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{item.procurement_mode?.name || item.mode_of_procurement || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(item.status)}`}>
                      {formatStatus(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">{formatDate(item.updated_at || item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {!loading && !error && filtered.length > MY_PAGE_SIZE && (
          <div className="flex items-center justify-center gap-4 px-6 py-3 border-t border-gray-100 text-sm text-gray-600">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="disabled:opacity-30 hover:text-[#1C7293] transition-colors text-lg"
            >‹</button>
            <span className="font-medium">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="disabled:opacity-30 hover:text-[#1C7293] transition-colors text-lg"
            >›</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Procurement page ────────────────────────────────────────────────────
export default function Procurement() {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showMyModal, setShowMyModal] = useState(false);
  const navigate = useNavigate();

  // Filters
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [page, setPage] = useState(1);

  // Fetch all procurements
  useEffect(() => {
    let isMounted = true;
    const fetchProcurements = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch("/procurements", {
          headers: { Accept: "application/json" },
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load procurements");
        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        if (isMounted) setProcurements(list);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load procurements");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProcurements();
    return () => { isMounted = false; };
  }, []);

  // Derived options
  const modeOptions = useMemo(() =>
    [...new Set(procurements.map((p) => p.procurement_mode?.name || p.mode_of_procurement).filter(Boolean))].sort()
    , [procurements]);

  // Filtered + paginated
  const filtered = useMemo(() => {
    return procurements.filter((item) => {
      const statusMatch = !filterStatus || (item.status || "").toLowerCase() === filterStatus;
      const modeVal = item.procurement_mode?.name || item.mode_of_procurement || "";
      const modeMatch = !filterMode || modeVal === filterMode;
      const q = search.toLowerCase();
      const searchMatch = !q || [item.procurement_no, item.title, modeVal]
        .some((v) => String(v || "").toLowerCase().includes(q));
      return statusMatch && modeMatch && searchMatch;
    });
  }, [procurements, filterStatus, filterMode, search]);

  useEffect(() => { setPage(1); }, [search, filterStatus, filterMode]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const hasFilters = search || filterStatus || filterMode;

  return (
    <div className="min-h-screen bg-gray-50 px-6 py-4">

      {/* ── Header: title + filters + buttons ── */}
      <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
        <h3 className="text-xl font-bold text-gray-900">Procurement</h3>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-1 justify-center flex-wrap">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg w-44 focus:outline-none focus:ring-2 focus:ring-[#1C7293] bg-white"
            />
            <svg className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293] bg-white"
          >
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <select
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293] bg-white"
          >
            <option value="">All Modes</option>
            {modeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>

          {hasFilters && (
            <button
              onClick={() => { setSearch(""); setFilterStatus(""); setFilterMode(""); }}
              className="text-xs text-red-500 hover:underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* My Procurements */}
          <button
            onClick={() => setShowMyModal(true)}
            className="flex items-center gap-1.5 border border-[#1C7293] text-[#1C7293] hover:bg-[#EEF8FB] text-sm font-semibold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <rect x="2" y="7" width="20" height="14" rx="2" />
              <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" />
            </svg>
            My Procurements
          </button>

          {/* Create */}
          <a
            href="/add-procurement"
            className="bg-[#1C7293] hover:bg-[#155f7a] text-white text-sm font-semibold px-6 py-2 rounded-lg transition-colors whitespace-nowrap"
          >
            Create
          </a>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="bg-white rounded-lg overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-[#EEF8FB] text-gray-700 text-sm border-b">
            <tr>
              <th className="px-6 py-4 text-left font-semibold">Proc No.</th>
              <th className="px-6 py-4 text-left font-semibold">Procurement Title</th>
              <th className="px-6 py-4 text-left font-semibold">Mode</th>
              <th className="px-6 py-4 text-left font-semibold">Status</th>
              <th className="px-6 py-4 text-left font-semibold">Last Updated</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">Loading procurements...</td></tr>
            )}
            {!loading && error && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-red-600">{error}</td></tr>
            )}
            {!loading && !error && paginated.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-500">No procurements found.</td></tr>
            )}
            {!loading && !error && paginated.map((item) => (
              <tr
                key={item.id}
                onClick={() => navigate(`/procurement/${item.id}`)}
                className="border-b hover:bg-gray-50 cursor-pointer transition-colors"
                title="View procurement details"
              >
                <td className="px-6 py-5 text-red-500 font-semibold whitespace-nowrap">{item.procurement_no}</td>
                <td className="px-6 py-5 font-medium text-gray-800">{item.title}</td>
                <td className="px-6 py-5 text-gray-700">{item.procurement_mode?.name || item.mode_of_procurement || "—"}</td>
                <td className="px-6 py-5">
                  <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(item.status)}`}>
                    {formatStatus(item.status)}
                  </span>
                </td>
                <td className="px-6 py-5 text-gray-700 whitespace-nowrap">{formatDate(item.updated_at || item.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination — centered, matches image ── */}
      {!loading && !error && filtered.length > 0 && (
        <div className="flex items-center justify-center gap-4 mt-6 text-sm text-gray-700">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="disabled:opacity-30 hover:text-[#1C7293] transition-colors text-lg"
          >
            ‹
          </button>
          <span className="font-medium">Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="disabled:opacity-30 hover:text-[#1C7293] transition-colors text-lg"
          >
            ›
          </button>
        </div>
      )}

      {/* ── My Procurements Modal ── */}
      {showMyModal && (
        <MyProcurementsModal
          onClose={() => setShowMyModal(false)}
          onNavigate={(path) => navigate(path)}
        />
      )}
    </div>
  );
}