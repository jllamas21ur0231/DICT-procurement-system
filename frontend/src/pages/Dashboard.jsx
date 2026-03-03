import { useEffect, useState, useMemo } from "react";
import "../css/Dashboard.css";

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

export default function Dashboard() {
  const [all, setAll] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("");
  const [filterMode, setFilterMode] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [search, setSearch] = useState("");

  // ── Pagination ────────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // ── Fetch all procurements once ───────────────────────────────────────────────
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

  // ── Derived: unique modes & projects for filter dropdowns ─────────────────────
  const modeOptions = useMemo(() => {
    const names = [...new Set(all.map((p) => p.procurement_mode?.name || p.mode_of_procurement).filter(Boolean))];
    return names.sort();
  }, [all]);

  const projectOptions = useMemo(() => {
    const names = [...new Set(all.map((p) => p.project_record?.name || p.project).filter(Boolean))];
    return names.sort();
  }, [all]);

  // ── Derived: stats ────────────────────────────────────────────────────────────
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

  // ── Derived: filtered rows ────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return all.filter((item) => {
      const statusMatch = !filterStatus || (item.status || "").toLowerCase() === filterStatus;
      const modeVal = item.procurement_mode?.name || item.mode_of_procurement || "";
      const modeMatch = !filterMode || modeVal === filterMode;
      const projectVal = item.project_record?.name || item.project || "";
      const projectMatch = !filterProject || projectVal === filterProject;
      const searchLower = search.toLowerCase();
      const searchMatch = !search || [
        item.procurement_no, item.title, modeVal, projectVal,
      ].some((v) => String(v || "").toLowerCase().includes(searchLower));
      return statusMatch && modeMatch && projectMatch && searchMatch;
    });
  }, [all, filterStatus, filterMode, filterProject, search]);

  // Reset to page 1 whenever filters change
  useEffect(() => { setPage(1); }, [filterStatus, filterMode, filterProject, search, pageSize]);

  // ── Derived: paginated rows ───────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const clearFilters = () => {
    setFilterStatus(""); setFilterMode(""); setFilterProject(""); setSearch("");
  };
  const hasFilters = filterStatus || filterMode || filterProject || search;

  const statCards = [
    { number: stats.ongoing, label: "On-going", sublabel: "Procurements", color: "text-yellow-500" },
    { number: stats.approved, label: "Approved", sublabel: "Procurements", color: "text-teal-600" },
    { number: stats.disapproved, label: "Disapproved", sublabel: "Procurements", color: "text-red-400" },
  ];

  return (
    <div>
      <h1 className="font-bold text-2xl mb-4">Here's an overview of today's report</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className={`text-6xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
            <div className="text-lg font-semibold">{stat.label}</div>
            <div className="text-lg font-semibold text-gray-500">{stat.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Procurement DataTable */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

        {/* Table header + filters */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">Procurement</h3>
            {hasFilters && (
              <button onClick={clearFilters} className="text-xs text-red-500 hover:underline">
                Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* Search */}
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

            {/* Status filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
            >
              {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>

            {/* Mode filter */}
            <select
              value={filterMode}
              onChange={(e) => setFilterMode(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
            >
              <option value="">All Modes</option>
              {modeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>

            {/* Project filter */}
            <select
              value={filterProject}
              onChange={(e) => setFilterProject(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
            >
              <option value="">All Projects</option>
              {projectOptions.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
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
              {loading && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">Loading procurements…</td></tr>
              )}
              {!loading && error && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-red-500">{error}</td></tr>
              )}
              {!loading && !error && paginated.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-gray-400">No procurements match your filters.</td></tr>
              )}
              {!loading && !error && paginated.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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

        {/* Pagination footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none"
            >
              {PAGE_SIZE_OPTIONS.map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
            <span className="ml-2 text-gray-500">
              {filtered.length === 0 ? "0" : `${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, filtered.length)}`} of {filtered.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors"
            >«</button>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors"
            >‹</button>
            <span className="px-3 py-1 text-sm font-medium">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors"
            >›</button>
            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className="px-2 py-1 rounded text-sm disabled:opacity-40 hover:bg-gray-200 transition-colors"
            >»</button>
          </div>
        </div>
      </div>
    </div>
  );
}