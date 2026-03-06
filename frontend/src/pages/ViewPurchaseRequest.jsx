import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

const formatDate = (ts) => {
    if (!ts) return "—";
    const d = new Date(ts);
    return isNaN(d) ? ts : d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

const formatCurrency = (val) => {
    if (val === null || val === undefined || val === "") return "—";
    return Number(val).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const getStatusStyle = (status) => {
    const v = (status || "").toLowerCase();
    if (["pending", "ongoing", "on-going"].includes(v)) return "bg-yellow-400 text-white";
    if (["approved", "accepted"].includes(v)) return "bg-teal-600 text-white";
    if (["rejected", "disapproved"].includes(v)) return "bg-red-500 text-white";
    return "bg-gray-400 text-white";
};

const capitalize = (s) => (!s ? "" : String(s).charAt(0).toUpperCase() + String(s).slice(1));

export default function ViewPurchaseRequest() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [pr, setPr] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        let mounted = true;
        setLoading(true);
        fetch(`/purchase-requests/${id}`, {
            headers: { Accept: "application/json" },
            credentials: "include",
        })
            .then((r) => {
                if (!r.ok) throw new Error("Failed to load purchase request.");
                return r.json();
            })
            .then((data) => {
                if (mounted) setPr(data);
            })
            .catch((err) => { if (mounted) setError(err.message); })
            .finally(() => { if (mounted) setLoading(false); });
        return () => { mounted = false; };
    }, [id]);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            const res = await fetch(`/purchase-requests/${id}`, {
                method: "DELETE",
                headers: { Accept: "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete.");
            navigate(-1);
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    // ── Loading ──────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
                Loading purchase request…
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────────────────────
    if (error || !pr) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
                <p className="text-red-500 text-sm">{error || "Purchase request not found."}</p>
                <button onClick={() => navigate(-1)} className="text-sm text-[#1C7293] hover:underline">← Go back</button>
            </div>
        );
    }

    const items = pr.items || [];
    const total = items.reduce((sum, item) => sum + (Number(item.quantity || 0) * Number(item.unit_cost || 0)), 0);
    const requester = pr.procurement?.requester;
    const status = pr.procurement?.status || pr.status || "";

    return (
        <div className="pb-24">

            {/* ── Top bar ── */}
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-gray-100 transition-colors"
                >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {status && (
                    <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getStatusStyle(status)}`}>
                        {capitalize(status)}
                    </span>
                )}
            </div>

            {/* ── Title ── */}
            <h1 className="text-2xl font-bold mb-8">Purchase Request</h1>

            {/* ── Info Grid ── */}
            <div className="grid grid-cols-2 gap-x-16 gap-y-6 mb-8">
                {/* Entity Name */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-1">Entity Name</p>
                    <p className="text-sm text-gray-700">{pr.entity_name || "Department of Information and Communications Technology"}</p>
                </div>
                {/* Fund Cluster */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-1">Fund Cluster</p>
                    <p className="text-sm text-gray-700">{pr.fund_cluster || "—"}</p>
                </div>
                {/* Office / Section */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-1">Office / Section</p>
                    <p className="text-sm text-gray-700">{pr.office || "—"}</p>
                </div>
                {/* Purchase Request Number */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-1">Purchase Request Number</p>
                    <p className="text-sm text-gray-700">{pr.purchase_request_number || "—"}</p>
                </div>
                {/* Date */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-1">Date</p>
                    <p className="text-sm text-gray-700">{formatDate(pr.date_created)}</p>
                </div>
                {/* Responsibility Center Code */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-1">Responsibility Center Code</p>
                    <p className="text-sm text-gray-700">{pr.responsibility_center_code || "—"}</p>
                </div>
            </div>

            {/* ── Items Table ── */}
            <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-[#EEF8FB]">
                            {["Item No.", "Stock No.", "Unit", "Item Description", "Item Inclusions", "Quantity", "Unit Cost", "Total Cost"].map((h) => (
                                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#1C7293]">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {items.length === 0 && (
                            <tr>
                                <td colSpan={8} className="px-4 py-8 text-center text-gray-400">No items found.</td>
                            </tr>
                        )}
                        {items.map((item) => {
                            const itemTotal = Number(item.quantity || 0) * Number(item.unit_cost || 0);
                            const inclusions = item.item_inclusions
                                ? item.item_inclusions.split("\n").filter(Boolean)
                                : [];
                            return (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 text-gray-700 align-top">{item.item_no || "—"}</td>
                                    <td className="px-4 py-3 text-gray-600 align-top">{item.stock_no || ""}</td>
                                    <td className="px-4 py-3 text-gray-700 align-top">{item.unit || "—"}</td>
                                    <td className="px-4 py-3 text-gray-700 align-top max-w-[200px]">{item.item_description || "—"}</td>
                                    <td className="px-4 py-3 text-gray-600 align-top">
                                        {inclusions.length > 0 ? (
                                            <ul className="list-disc list-inside space-y-0.5">
                                                {inclusions.map((inc, i) => (
                                                    <li key={i} className="text-xs">{inc}</li>
                                                ))}
                                            </ul>
                                        ) : (
                                            <span className="text-gray-400">—</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-gray-700 align-top text-right">{item.quantity}</td>
                                    <td className="px-4 py-3 text-gray-700 align-top text-right">{formatCurrency(item.unit_cost)}</td>
                                    <td className="px-4 py-3 text-gray-700 align-top text-right">{formatCurrency(itemTotal)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Total row */}
                <div className="flex justify-end items-center px-4 py-3 border-t border-gray-200 bg-gray-50">
                    <span className="text-sm font-bold text-gray-700 mr-8">TOTAL</span>
                    <span className="text-sm font-bold text-gray-800">Php {formatCurrency(total)}</span>
                </div>
            </div>

            {/* ── Purpose ── */}
            <div className="mb-8">
                <p className="text-sm font-semibold text-[#1C7293] mb-2">Purpose</p>
                <p className="text-sm text-gray-700 leading-relaxed">{pr.purpose || "—"}</p>
            </div>

            {/* ── Signatures ── */}
            <div className="grid grid-cols-2 gap-x-16 mb-8">
                {/* Requested by */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-4">Requested by:</p>
                    <div className="mb-1">
                        <p className="text-xs text-gray-500">Signature</p>
                    </div>
                    <div className="border-b border-gray-400 w-48 mb-2 mt-4" />
                    <div className="flex items-start gap-2 mt-1">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Printed Name</span>
                        <span className="text-xs font-semibold text-gray-800 ml-2">
                            {requester
                                ? [requester.first_name, requester.middle_name, requester.last_name, requester.suffix].filter(Boolean).join(" ").toUpperCase()
                                : pr.requested_by_name || "—"}
                        </span>
                    </div>
                    <div className="flex items-start gap-2 mt-1">
                        <span className="text-xs text-gray-500 whitespace-nowrap">Designation</span>
                        <span className="text-xs text-gray-700 ml-2">{requester?.designation || pr.requested_by_designation || "—"}</span>
                    </div>
                </div>

                {/* Approved by */}
                <div>
                    <p className="text-sm font-semibold text-[#1C7293] mb-4">Approved by:</p>
                    <div className="border-b border-gray-400 w-48 mb-2 mt-8" />
                    <p className="text-xs font-semibold text-gray-800">{pr.approved_by_name || "—"}</p>
                    <p className="text-xs text-gray-600">{pr.approved_by_designation || "—"}</p>
                </div>
            </div>

            {/* ── Funds Available ── */}
            <div className="mb-10">
                <p className="text-sm font-semibold text-[#1C7293] mb-4">Funds Available</p>
                <div className="border-b border-gray-400 w-48 mb-2" />
                <p className="text-xs font-semibold text-gray-800">{pr.budget_officer_name || "—"}</p>
                <p className="text-xs text-gray-600">{pr.budget_officer_designation || "Budget Officer"}</p>
            </div>

            {/* ── Action Buttons ── */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-8 py-4 flex justify-end gap-3 z-10">
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    Delete
                </button>
                <button
                    onClick={() => navigate(`/purchase-requests/${id}/edit`)}
                    className="px-6 py-2.5 bg-[#1C7293] hover:bg-[#155f7a] text-white text-sm font-semibold rounded-lg transition-colors"
                >
                    Edit
                </button>
            </div>

            {/* ── Delete Confirmation Modal ── */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl p-6 w-80">
                        <h3 className="text-base font-bold text-gray-800 mb-2">Delete Purchase Request?</h3>
                        <p className="text-sm text-gray-500 mb-6">
                            This will mark the purchase request and all its items as deleted. This action can be undone later.
                        </p>
                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-60 rounded-lg transition-colors"
                            >
                                {deleting ? "Deleting…" : "Yes, Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}