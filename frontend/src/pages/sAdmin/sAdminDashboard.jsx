import { useEffect, useState, useMemo } from "react";
import { useSearch } from "../../context/SearchContext";

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
// Purchase Request Table (sAdmin)
// Uses /super-admin/data/purchase-requests — accessible under the shared auth session
// ─────────────────────────────────────────────────────────────────────────────
function PurchaseRequestTable() {
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
        // sAdmin can read all purchase requests via the shared auth data endpoint
        fetch("/sadmin/purchase-requests", {
            headers: { Accept: "application/json" },
            credentials: "include",
        })
            .then((r) => { if (!r.ok) throw new Error(`Failed to load purchase requests (${r.status})`); return r.json(); })
            .then((data) => {
                if (!mounted) return;
                const list = Array.isArray(data) ? data
                    : Array.isArray(data?.data) ? data.data
                        : [];
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
            {/* Filters */}
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
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#134C62]"
                        />
                        <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                    <select
                        value={filterOffice}
                        onChange={(e) => setFilterOffice(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#134C62]"
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
                            <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">No purchase requests found.</td></tr>
                        )}
                        {!loading && !error && paginated.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
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
// Procurement Table (sAdmin) — no stat cards here, they live in the root
// ─────────────────────────────────────────────────────────────────────────────
function ProcurementTable() {
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
        fetch("/sadmin/procurements", {
            headers: { Accept: "application/json" },
            credentials: "include",
        })
            .then((r) => { if (!r.ok) throw new Error("Failed to load procurements."); return r.json(); })
            .then((data) => {
                if (!mounted) return;
                const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
                setAll(list);
            })
            .catch((err) => { if (mounted) setError(err.message || "Unable to load data."); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, []);

    const modeOptions = useMemo(() =>
        [...new Set(all.map((p) => p.mode_of_procurement || p.procurementMode?.name).filter(Boolean))].sort()
        , [all]);

    const projectOptions = useMemo(() =>
        [...new Set(all.map((p) => p.project || p.projectRecord?.name).filter(Boolean))].sort()
        , [all]);

    const filtered = useMemo(() => {
        return all.filter((item) => {
            const statusMatch = !filterStatus || (item.status || "").toLowerCase() === filterStatus;
            const modeVal = item.mode_of_procurement || item.procurementMode?.name || "";
            const modeMatch = !filterMode || modeVal === filterMode;
            const projectVal = item.project || item.projectRecord?.name || "";
            const projectMatch = !filterProject || projectVal === filterProject;
            const q = search.toLowerCase();
            const searchMatch = !q || [item.procurement_no, item.title, modeVal, projectVal, item.requested_by_name]
                .some((v) => String(v || "").toLowerCase().includes(q));
            return statusMatch && modeMatch && projectMatch && searchMatch;
        });
    }, [all, filterStatus, filterMode, filterProject, search]);

    useEffect(() => { setPage(1); }, [filterStatus, filterMode, filterProject, search, pageSize]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
    const hasFilters = filterStatus || filterMode || filterProject || search;

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Procurement</h3>
                    {hasFilters && (
                        <button onClick={() => { setFilterStatus(""); setFilterMode(""); setFilterProject(""); setSearch(""); }} className="text-xs text-red-500 hover:underline">
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
                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#134C62]"
                        />
                        <svg className="absolute left-2.5 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                        </svg>
                    </div>
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#134C62]">
                        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                    <select value={filterMode} onChange={(e) => setFilterMode(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#134C62]">
                        <option value="">All Modes</option>
                        {modeOptions.map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#134C62]">
                        <option value="">All Projects</option>
                        {projectOptions.map((p) => <option key={p} value={p}>{p}</option>)}
                    </select>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            {["Proc. No.", "Title", "Mode of Procurement", "Project", "Requested By", "Status", "Date"].map((h) => (
                                <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wide">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading && <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">Loading procurements…</td></tr>}
                        {!loading && error && <tr><td colSpan={7} className="px-6 py-10 text-center text-red-500">{error}</td></tr>}
                        {!loading && !error && paginated.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-10 text-center text-gray-400">No procurements match your filters.</td></tr>
                        )}
                        {!loading && !error && paginated.map((item) => (
                            <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-5 py-3 text-[#c0392b] font-semibold whitespace-nowrap">{item.procurement_no}</td>
                                <td className="px-5 py-3 font-medium max-w-[180px] truncate">{item.title}</td>
                                <td className="px-5 py-3 text-gray-600">{item.mode_of_procurement || item.procurementMode?.name || "—"}</td>
                                <td className="px-5 py-3 text-gray-600">{item.project || item.projectRecord?.name || "—"}</td>
                                <td className="px-5 py-3 text-gray-500">{item.requested_by_name || "sAdmin"}</td>
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
// sAdminDashboard root
// Stats cards are here — always visible regardless of active table
// ─────────────────────────────────────────────────────────────────────────────
export default function SAdminDashboard() {
    const { filter, search } = useSearch();

    // Fetch summary stats independently so cards always show
    const [stats, setStats] = useState({ ongoing: 0, approved: 0, disapproved: 0 });
    const [userCount, setUserCount] = useState("—");

    useEffect(() => {
        // Procurement stats
        fetch("/sadmin/procurements", { headers: { Accept: "application/json" }, credentials: "include" })
            .then((r) => r.ok ? r.json() : Promise.reject())
            .then((data) => {
                const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
                const t = { ongoing: 0, approved: 0, disapproved: 0 };
                list.forEach((item) => {
                    const s = (item.status || "").toLowerCase();
                    if (["pending", "ongoing", "on-going"].includes(s)) t.ongoing++;
                    else if (["approved", "accepted"].includes(s)) t.approved++;
                    else if (["rejected", "disapproved"].includes(s)) t.disapproved++;
                });
                setStats(t);
            })
            .catch(() => { });

        // User count
        fetch("/sadmin/users", { headers: { Accept: "application/json" }, credentials: "include" })
            .then((r) => r.ok ? r.json() : Promise.reject())
            .then((data) => {
                const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
                setUserCount(list.length);
            })
            .catch(() => { });
    }, []);

    const q = search.trim().toLowerCase();
    const showPR =
        filter === "Purchase Request" ||
        (filter !== "Procurement" && filter !== "PPMP" && q.includes("purchase request"));

    const statCards = [
        { number: stats.ongoing, label: "On-going", sublabel: "Procurements", color: "text-yellow-500" },
        { number: stats.approved, label: "Approved", sublabel: "Procurements", color: "text-teal-600" },
        { number: stats.disapproved, label: "Disapproved", sublabel: "Procurements", color: "text-red-400" },
        { number: userCount, label: "Total", sublabel: "Users", color: "text-[#134C62]" },
    ];

    return (
        <div>
            <h1 className="font-bold text-2xl mb-6">Here's an overview of today's report</h1>

            {/* Stats cards — always visible */}
            <div className="grid grid-cols-4 gap-6 mb-8">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-white border-2 border-gray-200 rounded-2xl p-8 text-center shadow-sm">
                        <div className={`text-6xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                        <div className="text-lg font-semibold">{stat.label}</div>
                        <div className="text-lg font-semibold text-gray-500">{stat.sublabel}</div>
                    </div>
                ))}
            </div>

            {/* Table — switches based on header filter/search */}
            {showPR ? <PurchaseRequestTable /> : <ProcurementTable />}
        </div>
    );
}