import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Copy, Pencil } from "lucide-react";

// ── helpers ───────────────────────────────────────────────────────────────────
const formatDate = (ts) => {
    if (!ts) return "";
    const d = new Date(ts);
    return isNaN(d) ? ts : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

const formatPeso = (n) =>
    Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const FILE_TYPE_LABELS = {
    sub_allotment_release_order: "Sub Allotment Release Order",
    annual_procurement_plan: "Annual Procurement Plan",
    project_procurement_management_plan: "Project Procurement Management Plan",
    market_study: "Market Study / Request for Information",
    technical_specification: "Technical Specification",
};

const getStatusStyle = (status) => {
    const v = (status || "").toLowerCase();
    if (["pending", "ongoing", "on-going"].includes(v)) return "bg-yellow-400 text-black";
    if (["approved", "accepted"].includes(v)) return "bg-teal-600 text-white";
    if (["rejected", "disapproved"].includes(v)) return "bg-red-500 text-white";
    return "bg-gray-300 text-gray-800";
};

const capitalize = (s) => (!s ? "" : String(s).charAt(0).toUpperCase() + String(s).slice(1));

const resolveFileType = (pdf) => {
    const checklist = pdf.checklist;
    if (!checklist) return pdf.file_name || "Document";
    const typeVal = typeof checklist === "object"
        ? checklist.type || checklist.file_type || ""
        : String(checklist);
    return FILE_TYPE_LABELS[typeVal] || typeVal || pdf.file_name || "Document";
};

// ── Reusable teal-label field ─────────────────────────────────────────────────
const F = ({ label, value }) => (
    <div className="mb-5">
        <p className="text-sm font-semibold text-[#1C7293] mb-0.5">{label}</p>
        <p className="text-sm text-gray-800">{value || ""}</p>
    </div>
);

// ── PDF icon ──────────────────────────────────────────────────────────────────
const PdfIcon = () => (
    <div className="w-9 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
        <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
    </div>
);

// ─────────────────────────────────────────────────────────────────────────────
export default function ProcurementDetails() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [procurement, setProcurement] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [toast, setToast] = useState(null);
    const [lastEditorName, setLastEditorName] = useState(null);

    useEffect(() => {
        if (!id) return;
        setLoading(true);
        setError("");

        Promise.allSettled([
            fetch(`/procurements/${id}`, { headers: { Accept: "application/json" }, credentials: "include" }),
            fetch(`/procurements/${id}/revisions?per_page=1`, { headers: { Accept: "application/json" }, credentials: "include" }),
        ])
            .then(async ([procResult, revResult]) => {
                if (procResult.status === "rejected" || !procResult.value.ok)
                    throw new Error("Failed to load procurement details.");

                const procData = await procResult.value.json();
                setProcurement(procData);

                // Last editor — eager-loaded lastRevision.actor
                const actorFromModel = procData?.last_revision?.actor;
                if (actorFromModel) {
                    const name = [actorFromModel.first_name, actorFromModel.last_name].filter(Boolean).join(" ");
                    if (name) { setLastEditorName(name); return; }
                }
                // Fallback: revisions endpoint
                if (revResult.status === "fulfilled" && revResult.value.ok) {
                    const revData = await revResult.value.json();
                    const rows = Array.isArray(revData) ? revData : revData?.data ?? revData?.items ?? [];
                    const actor = rows[0]?.actor;
                    if (actor) {
                        const name = [actor.first_name, actor.last_name].filter(Boolean).join(" ");
                        if (name) setLastEditorName(name);
                    }
                }
            })
            .catch((err) => setError(err.message || "Unable to load procurement."))
            .finally(() => setLoading(false));
    }, [id]);

    const showToast = (type, message, duration = 3000) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), duration);
    };

    const handleDuplicate = () => {
        if (!procurement) return;
        // Navigate to Create Purchase Request, passing all current data as state.
        // Signature fields (printed name, designation) are intentionally NOT passed
        // so they start blank on the create form.
        navigate("/create-purchase-request", {
            state: {
                isDuplicate: true,
                // Procurement
                title: procurement.title || "",
                procurement_mode_id: procurement.procurement_mode_id || "",
                modeName: procurement.procurement_mode?.name || "",
                project_id: procurement.project_id || "",
                projectName: procurement.project_record?.name || "",
                description: procurement.description || "",
                pdfs: (procurement.pdfs || []),
                // Purchase request
                office: procurement.purchase_request?.office || "",
                fund_cluster: procurement.purchase_request?.fund_cluster || "",
                purchase_request_number: procurement.purchase_request?.purchase_request_number || "",
                responsibility_center_code: procurement.purchase_request?.responsibility_center_code || "",
                date_created: procurement.purchase_request?.date_created || "",
                purpose: procurement.purchase_request?.purpose || "",
                items: (procurement.purchase_request?.items || []).map((item, idx) => ({
                    item_no: item.item_no || String(idx + 1),
                    stock_no: item.stock_no || "",
                    unit: item.unit || "",
                    item_description: item.item_description || "",
                    item_inclusions: item.item_inclusions || "",
                    quantity: item.quantity ?? "",
                    unit_cost: item.unit_cost ?? "",
                })),
            },
        });
    };

    const handleDelete = async () => {
        if (!window.confirm("Delete this procurement?")) return;
        try {
            const res = await fetch(`/procurements/${id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) throw new Error("Failed to delete.");
            navigate(-1);
        } catch (err) {
            showToast("error", err.message || "Failed to delete.");
        }
    };

    const handleEdit = () => navigate(`/procurement/${id}/edit`);

    // ── Loading / error ───────────────────────────────────────────────────────
    if (loading) return (
        <div className="flex items-center justify-center min-h-64">
            <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
        </div>
    );

    if (error) return (
        <div className="px-6 py-10 text-center">
            <p className="text-red-500 mb-3">{error}</p>
            <button onClick={() => navigate(-1)} className="text-sm text-[#1C7293] hover:underline">← Go back</button>
        </div>
    );

    if (!procurement) return null;

    // ── Derived values ────────────────────────────────────────────────────────
    const pr = procurement.purchase_request;
    const pdfs = procurement.pdfs || [];
    const modeName = procurement.procurement_mode?.name || "—";
    const projectName = procurement.project_record?.name || "—";
    const requester = procurement.requester;

    const requesterFullName = requester
        ? [requester.first_name, requester.middle_name, requester.last_name].filter(Boolean).join(" ")
        : "";
    const requesterDesignation = requester?.role?.designation || requester?.role?.position || "";

    const totalCost = (pr?.items || []).reduce(
        (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0), 0
    );

    return (
        <div className="min-h-screen bg-white">

            {/* ── Toast ── */}
            {toast && (
                <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === "success" ? "bg-teal-600 text-white" : "bg-red-500 text-white"}`}>
                    <span>{toast.message}</span>
                    <button onClick={() => setToast(null)} className="opacity-70 hover:opacity-100 ml-1 text-base leading-none">✕</button>
                </div>
            )}

            <div className="max-w-5xl mx-auto px-8 py-8">

                {/* ── Top nav ── */}
                <div className="flex items-center justify-between mb-8">
                    <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 8 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2"
                                d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
                        </svg>
                    </button>
                    <div className="flex items-center gap-3">
                        <span className={`px-5 py-1.5 rounded-full text-sm font-bold ${getStatusStyle(procurement.status)}`}>
                            {capitalize(procurement.status)}
                        </span>
                        <button title="Duplicate" onClick={handleDuplicate}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-gray-500">
                            <Copy size={15} />
                        </button>
                        <button title="Edit" onClick={handleEdit}
                            className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors text-gray-500">
                            <Pencil size={15} />
                        </button>
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════
                    SECTION 1 — PROCUREMENT DETAILS
                ════════════════════════════════════════════════════════════ */}
                <h2 className="text-base font-bold text-gray-900 mb-5">Procurement Details</h2>

                {lastEditorName && (
                    <p className="text-xs text-gray-400 -mt-3 mb-5">
                        Last edited by: <span className="text-gray-600">{lastEditorName}</span>
                    </p>
                )}

                {/* Two-column: fields left, files right */}
                <div className="grid grid-cols-2 gap-x-16 mb-10">
                    {/* Left — procurement fields */}
                    <div>
                        <F label="Procurement Title" value={procurement.title} />
                        <F label="Mode of Procurement" value={modeName} />
                        <F label="Project" value={projectName} />
                        {procurement.description && (
                            <F label="Description" value={procurement.description} />
                        )}
                    </div>

                    {/* Right — uploaded files */}
                    <div>
                        <p className="text-sm font-semibold text-gray-800 mb-3">Files Uploaded</p>
                        {pdfs.length === 0 ? (
                            <p className="text-sm text-gray-400 italic">No files attached</p>
                        ) : (
                            <ul className="space-y-3">
                                {pdfs.map((pdf, idx) => (
                                    <li key={idx} className="flex items-center gap-3">
                                        <PdfIcon />
                                        <span className="text-sm text-gray-700">{resolveFileType(pdf)}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* ════════════════════════════════════════════════════════════
                    SECTION 2 — PURCHASE REQUEST
                ════════════════════════════════════════════════════════════ */}
                {pr ? (
                    <>
                        {/* Divider */}
                        <div className="border-t border-gray-200 mb-8" />

                        {/* Entity + Fund Cluster */}
                        <div className="grid grid-cols-2 gap-x-16">
                            <F label="Entity Name"
                                value="Department of Information and Communications Technology" />
                            <F label="Fund Cluster" value={pr.fund_cluster} />
                        </div>

                        {/* Office + PR Number */}
                        <div className="grid grid-cols-2 gap-x-16">
                            <F label="Office / Section" value={pr.office} />
                            <F label="Purchase Request Number" value={pr.purchase_request_number} />
                        </div>

                        {/* Date + Resp Center Code */}
                        <div className="grid grid-cols-2 gap-x-16 mb-6">
                            <F label="Date" value={formatDate(pr.date_created)} />
                            <F label="Responsibility Center Code" value={pr.responsibility_center_code} />
                        </div>

                        {/* Items table */}
                        <div className="overflow-x-auto mb-2">
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-[#EEF8FB]">
                                        {["Item No.", "Stock No.", "Unit", "Item Description", "Item Inclusions", "Quantity", "Unit Cost", "Total Cost"].map((h) => (
                                            <th key={h}
                                                className="px-3 py-3 text-left text-xs font-semibold text-[#1C7293] border border-gray-200 whitespace-nowrap">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {pr.items && pr.items.length > 0 ? pr.items.map((item, idx) => {
                                        const rowTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
                                        return (
                                            <tr key={idx}>
                                                <td className="px-3 py-3 text-gray-700 border border-gray-200 align-top">{item.item_no || idx + 1}</td>
                                                <td className="px-3 py-3 text-gray-600 border border-gray-200 align-top">{item.stock_no || ""}</td>
                                                <td className="px-3 py-3 text-gray-600 border border-gray-200 align-top">{item.unit || ""}</td>
                                                <td className="px-3 py-3 text-gray-800 border border-gray-200 align-top max-w-[180px]">{item.item_description || ""}</td>
                                                <td className="px-3 py-3 text-gray-600 border border-gray-200 align-top max-w-[160px]">
                                                    {item.item_inclusions
                                                        ? item.item_inclusions.split("\n").filter(Boolean).map((line, i) => (
                                                            <div key={i} className="flex items-start gap-1.5 mb-0.5">
                                                                <span className="mt-[5px] w-1.5 h-1.5 rounded-full bg-gray-500 flex-shrink-0" />
                                                                <span>{line}</span>
                                                            </div>
                                                        ))
                                                        : ""}
                                                </td>
                                                <td className="px-3 py-3 text-gray-700 border border-gray-200 align-top">{item.quantity ?? ""}</td>
                                                <td className="px-3 py-3 text-gray-700 border border-gray-200 align-top whitespace-nowrap">{formatPeso(item.unit_cost || 0)}</td>
                                                <td className="px-3 py-3 text-gray-800 font-medium border border-gray-200 align-top whitespace-nowrap">{formatPeso(rowTotal)}</td>
                                            </tr>
                                        );
                                    }) : (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-6 text-center text-sm text-gray-400 italic border border-gray-200">
                                                No items in this purchase request.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* TOTAL */}
                        <div className="flex justify-end items-center gap-10 mb-8 pt-2">
                            <span className="text-sm font-bold text-gray-700 tracking-wide">TOTAL</span>
                            <span className="text-sm font-bold text-gray-900">Php {formatPeso(totalCost)}</span>
                        </div>

                        {/* Purpose */}
                        {pr.purpose && (
                            <div className="mb-10">
                                <p className="text-sm font-semibold text-[#1C7293] mb-1">Purpose</p>
                                <p className="text-sm text-gray-700 leading-relaxed">{pr.purpose}</p>
                            </div>
                        )}

                        {/* Signatures */}
                        <div className="grid grid-cols-2 gap-x-16 mb-10">
                            {/* Requested by */}
                            <div>
                                <p className="text-sm font-bold text-[#1C7293] mb-5">Requested by:</p>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 w-28 flex-shrink-0">Signature</span>
                                        <div className="flex-1 border-b border-gray-400" />
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm text-gray-600 w-28 flex-shrink-0 pt-0.5">Printed Name</span>
                                        <span className="text-sm font-semibold text-gray-900">{requesterFullName}</span>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <span className="text-sm text-gray-600 w-28 flex-shrink-0 pt-0.5">Designation</span>
                                        <span className="text-sm text-gray-700">{requesterDesignation}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Approved by */}
                            <div>
                                <p className="text-sm font-bold text-[#1C7293] mb-5">Approved by:</p>
                                <div className="w-48 border-b border-gray-400 mb-2" />
                                <p className="text-sm font-semibold text-gray-900">ENGR. REY M. PARNACIO</p>
                                <p className="text-sm text-gray-600">OIC, Regional Director</p>
                            </div>
                        </div>

                        {/* Funds available */}
                        <div className="mb-10">
                            <p className="text-sm font-bold text-[#1C7293] mb-5">Funds Available</p>
                            <div className="w-48 border-b border-gray-400 mb-2" />
                            <p className="text-sm font-semibold text-gray-900">Shiena Ann M. Bravo</p>
                            <p className="text-sm text-gray-600">Budget Officer</p>
                        </div>
                    </>
                ) : (
                    <p className="text-sm text-gray-400 italic py-10 text-center border-t border-gray-100 mt-4">
                        No purchase request linked to this procurement.
                    </p>
                )}

                {/* ── Action buttons ── */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                    <button onClick={handleDelete}
                        className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 active:bg-red-700 text-white text-sm font-semibold transition-colors">
                        Delete
                    </button>
                    <button onClick={handleEdit}
                        className="px-6 py-2.5 rounded-lg bg-[#134C62] hover:bg-[#0e3a4c] active:bg-[#0a2e3d] text-white text-sm font-semibold transition-colors">
                        Edit
                    </button>
                </div>

            </div>
        </div>
    );
}