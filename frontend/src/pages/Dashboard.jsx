import { useEffect, useState, useMemo } from "react";
import "../css/Dashboard.css";
import { useSearch } from "../context/SearchContext";
import { useNavigate } from "react-router-dom";

const PAGE_SIZE_OPTIONS = [5, 10, 25, 50];

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "pending", label: "Pending" },
  { value: "ongoing", label: "On-going" },
  { value: "approved", label: "Approved" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
  { value: "disapproved", label: "Disapproved" },
];

const getStatusStyle = (status) => {
  const v = (status || "").toLowerCase();
  if (["pending", "ongoing", "on-going"].includes(v)) return "bg-yellow-100 text-yellow-800 border border-yellow-300";
  if (["approved", "accepted"].includes(v)) return "bg-teal-100 text-teal-800 border border-teal-300";
  if (["rejected", "disapproved"].includes(v)) return "bg-red-100 text-red-700 border border-red-300";
  return "bg-gray-100 text-gray-700 border border-gray-300";
};

const capitalize = (s) => (!s ? "" : String(s).charAt(0).toUpperCase() + String(s).slice(1));

const formatDate = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d) ? ts : d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

// ─────────────────────────────────────────────────────────────────────────────
// Purchase Request Table
// ─────────────────────────────────────────────────────────────────────────────
function PurchaseRequestTable() {
  const navigate = useNavigate();
  const [allPR, setAllPR] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [filterOffice, setFilterOffice] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/purchase-requests?per_page=200", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((r) => { if (!r.ok) throw new Error("Failed to load purchase requests"); return r.json(); })
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setAllPR(list);
      })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const officeOptions = useMemo(() =>
    [...new Set(allPR.map((r) => r.office).filter(Boolean))].sort()
    , [allPR]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allPR.filter((r) => {
      const officeMatch = !filterOffice || r.office === filterOffice;
      const searchMatch = !q || [r.purchase_request_number, r.office, r.responsibility_center_code, r.purpose]
        .some((v) => String(v || "").toLowerCase().includes(q));
      return officeMatch && searchMatch;
    });
  }, [allPR, search, filterOffice]);

  useEffect(() => { setPage(1); }, [search, filterOffice, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = search || filterOffice;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Header + Filters */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Purchase Request</h3>
          {hasFilters && (
            <button onClick={() => { setSearch(""); setFilterOffice(""); }} className="text-xs text-red-500 hover:underline">
              Clear filters
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
            />
            <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
            </svg>
          </div>
          <select
            value={filterOffice}
            onChange={(e) => setFilterOffice(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
          >
            <option value="">All Offices</option>
            {officeOptions.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["PR Number", "Office", "Resp. Center Code", "Purpose", "Date Created"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading && <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Loading purchase requests…</td></tr>}
            {!loading && error && <tr><td colSpan={5} className="px-6 py-10 text-center text-red-500">{error}</td></tr>}
            {!loading && !error && paginated.length === 0 && (
              <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No purchase requests match your filters.</td></tr>
            )}
            {!loading && !error && paginated.map((item) => (
              <tr
                key={item.id}
                onClick={() => navigate(`/purchase-requests/${item.id}`)}
                className="hover:bg-[#EEF8FB] transition-colors cursor-pointer"
                title="View purchase request details"
              >
                <td className="px-5 py-3 text-[#c0392b] font-semibold whitespace-nowrap">{item.purchase_request_number || "—"}</td>
                <td className="px-5 py-3 text-gray-700">{item.office || "—"}</td>
                <td className="px-5 py-3 text-gray-600">{item.responsibility_center_code || "—"}</td>
                <td className="px-5 py-3 text-gray-600 max-w-[260px] truncate">{item.purpose || "—"}</td>
                <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(item.date_created)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page:</span>
          <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none">
            {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
          <span className="ml-2 text-gray-500">
            {filtered.length === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`} of {filtered.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">«</button>
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">‹</button>
          <span className="px-3 py-1 text-sm font-medium">{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">›</button>
          <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">»</button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Procurement Table
// ─────────────────────────────────────────────────────────────────────────────
function ProcurementTable({ cardsOnly = false }) {
  const navigate = useNavigate();

  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetch("/procurements?per_page=100", {
      headers: { Accept: "application/json" },
      credentials: "include",
    })
      .then((r) => { if (!r.ok) throw new Error("Failed to load procurements"); return r.json(); })
      .then((data) => {
        if (!mounted) return;
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
        setAll(list);
      })
      .catch((err) => { if (mounted) setError(err.message); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, []);

  const modeOptions = useMemo(() =>
    [...new Set(all.map((p) => p.procurement_mode?.name || p.mode_of_procurement).filter(Boolean))].sort()
    , [all]);

  const projectOptions = useMemo(() =>
    [...new Set(all.map((p) => p.project_record?.name || p.project).filter(Boolean))].sort()
    , [all]);

  const stats = useMemo(() => {
    const t = { ongoing: 0, approved: 0, disapproved: 0 };
    all.forEach((item) => {
      const s = (item.status || "").toLowerCase();
      if (["pending", "ongoing", "on-going"].includes(s)) t.ongoing++;
      else if (["approved", "accepted"].includes(s)) t.approved++;
      else if (["rejected", "disapproved"].includes(s)) t.disapproved++;
    });
    return t;
  }, [all]);

  const filtered = useMemo(() => {
    return all.filter((item) => {
      const statusMatch = !filterStatus || (item.status || "").toLowerCase() === filterStatus;
      const modeVal = item.procurement_mode?.name || item.mode_of_procurement || "";
      const modeMatch = !filterMode || modeVal === filterMode;
      const projectVal = item.project_record?.name || item.project || "";
      const projectMatch = !filterProject || projectVal === filterProject;
      const q = search.toLowerCase();
      const searchMatch = !q || [item.procurement_no, item.title, modeVal, projectVal]
        .some((v) => String(v || "").toLowerCase().includes(q));
      return statusMatch && modeMatch && projectMatch && searchMatch;
    });
  }, [all, filterStatus, filterMode, filterProject, search]);

  useEffect(() => { setPage(1); }, [filterStatus, filterMode, filterProject, search, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  const hasFilters = filterStatus || filterMode || filterProject || search;

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {[
          { number: stats.ongoing, label: "On-going", sublabel: "Procurements", color: "text-yellow-500" },
          { number: stats.approved, label: "Approved", sublabel: "Procurements", color: "text-teal-600" },
          { number: stats.disapproved, label: "Disapproved", sublabel: "Procurements", color: "text-red-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className={`text-6xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
            <div className="text-lg font-semibold">{stat.label}</div>
            <div className="text-lg font-semibold text-gray-500">{stat.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Downloadable Templates */}
      <DownloadableTemplates />

      {/* Table — hidden in cardsOnly mode */}
      {!cardsOnly && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Procurement</h3>
              {hasFilters && (
                <button
                  onClick={() => { setFilterStatus(""); setFilterMode(""); setFilterProject(""); setSearch(""); }}
                  className="text-xs text-red-500 hover:underline"
                >
                  Clear filters
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                />
                <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]">
                {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]">
                <option value="">All Modes</option>
                {modeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]">
                <option value="">All Projects</option>
                {projectOptions.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  {["Proc. No.", "Title", "Mode of Procurement", "Project", "Status", "Date"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading procurements…</td></tr>}
                {!loading && error && <tr><td colSpan={6} className="px-6 py-10 text-center text-red-500">{error}</td></tr>}
                {!loading && !error && paginated.length === 0 && (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No procurements match your filters.</td></tr>
                )}
                {!loading && !error && paginated.map((item) => (
                  <tr
                    key={item.id}
                    onClick={() => navigate(`/procurement/${item.id}`)}
                    className="hover:bg-[#EEF8FB] transition-colors cursor-pointer"
                    title="View procurement details"
                  >
                    <td className="px-5 py-3 text-[#c0392b] font-semibold whitespace-nowrap">{item.procurement_no}</td>
                    <td className="px-5 py-3 font-medium max-w-[200px] truncate">{item.title}</td>
                    <td className="px-5 py-3 text-gray-600">{item.procurement_mode?.name || item.mode_of_procurement || "—"}</td>
                    <td className="px-5 py-3 text-gray-600">{item.project_record?.name || item.project || "—"}</td>
                    <td className="px-5 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                        {capitalize(item.status)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{formatDate(item.updated_at || item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Rows per page:</span>
              <select value={pageSize} onChange={(e) => setPageSize(Number(e.target.value))} className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none">
                {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span className="ml-2 text-gray-500">
                {filtered.length === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`} of {filtered.length}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(1)} disabled={page === 1} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">«</button>
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">‹</button>
              <span className="px-3 py-1 text-sm font-medium">{page} / {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">›</button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors">»</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Downloadable Template Documents
// ─────────────────────────────────────────────────────────────────────────────
const TEMPLATE_DOCS = [
  {
    id: 1,
    title: "Project Procurement\nManagement Plan",
    description: "Standard format for annual procurement planning.",
    filename: "NGPA_PPMP.pdf",
    url: "http://localhost:8000/download/template/NGPA_PPMP.pdf",
  },
  {
    id: 2,
    title: "Statement of Request\nfor Inspection",
    description: "Used for inspection and verification requests.",
    filename: "Statement_of_Request_for_Inspection.pdf",
    url: "http://localhost:8000/download/template/SRFI.pdf",
  },
];

function PdfIconBox() {
  return (
    <div className="flex-shrink-0 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center w-24 h-24">
      <svg viewBox="0 0 56 68" className="w-12 h-14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 0h32l16 16v48a4 4 0 01-4 4H4a4 4 0 01-4-4V4a4 4 0 014-4z" fill="#fff" stroke="#e5e7eb" strokeWidth="1.5" />
        <path d="M36 0l16 16H40a4 4 0 01-4-4V0z" fill="#fecaca" stroke="#e5e7eb" strokeWidth="1.5" />
        <rect x="0" y="36" width="56" height="20" rx="3" fill="#ef4444" />
        <text x="28" y="51" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif" letterSpacing="1">PDF</text>
        <line x1="8" y1="22" x2="34" y2="22" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="8" y1="28" x2="28" y2="28" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function DownloadableTemplates() {
  const [pendingDoc, setPendingDoc] = useState(null);

  const handleConfirm = () => {
    if (!pendingDoc) return;
    const link = document.createElement("a");
    link.href = pendingDoc.url;
    link.download = pendingDoc.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setPendingDoc(null);
  };

  return (
    <div className="mb-8">
      <h2 className="font-bold text-xl mb-4">Downloadable Template Documents</h2>
      <div className="grid grid-cols-2 gap-4">
        {TEMPLATE_DOCS.map((doc) => (
          <div key={doc.id} className="flex items-stretch gap-0">
            <PdfIconBox />
            <div className="flex flex-col justify-center pl-4">
              <p className="font-bold text-gray-900 text-sm leading-snug mb-1 whitespace-pre-line">{doc.title}</p>
              <p className="text-xs text-gray-400 mb-3">{doc.description}</p>
              <button
                onClick={() => setPendingDoc(doc)}
                className="inline-flex items-center gap-1.5 bg-[#1C7293] hover:bg-[#155f7a] text-white text-xs font-semibold px-4 py-1.5 rounded-md transition-colors w-fit"
              >
                Download
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Download Confirmation Modal ── */}
      {pendingDoc && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
            <h3 className="text-base font-bold text-[#1C7293] mb-2">Download Confirmation</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to download the template document?
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setPendingDoc(null)}
                className="px-5 py-1.5 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                className="px-5 py-1.5 text-sm font-semibold text-white bg-[#1C7293] hover:bg-[#155f7a] rounded-md transition-colors"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { filter, search } = useSearch();

  const q = search.trim().toLowerCase();
  const showPR =
    filter === "Purchase Request" ||
    (filter !== "Procurement" && filter !== "PPMP" && q.includes("purchase request"));

  return (
    <div>
      <h1 className="font-bold text-2xl mb-6">Here's an overview of today's report</h1>
      <ProcurementTable cardsOnly={showPR} />
      {showPR && <PurchaseRequestTable />}
    </div>
  );
}