import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

// ── File type constants ───────────────────────────────────────────────────────
const FILE_TYPES = [
    { value: "sub_allotment_release_order", label: "Sub Allotment Release Order", required: true },
    { value: "annual_procurement_plan", label: "Annual Procurement Plan", required: true },
    { value: "project_procurement_management_plan", label: "Project Procurement Management Plan", required: true },
    { value: "market_study", label: "Market Study/Request for Information", required: true },
    { value: "technical_specification", label: "Technical Specification", required: false },
];

const FILE_TYPE_LABELS = {
    sub_allotment_release_order: "Sub Allotment Release Order",
    annual_procurement_plan: "Annual Procurement Plan",
    project_procurement_management_plan: "Project Procurement Management Plan",
    market_study: "Market Study / Request for Information",
    technical_specification: "Technical Specification",
};

const resolveFileLabel = (pdf) => {
    const c = pdf.checklist;
    if (!c) return pdf.file_name || "Document";
    const typeVal = typeof c === "object" ? c.type || c.file_type || "" : String(c);
    return FILE_TYPE_LABELS[typeVal] || typeVal || pdf.file_name || "Document";
};

const resolveFileKey = (pdf) => {
    const c = pdf.checklist;
    if (!c) return null;
    return typeof c === "object" ? c.type || c.file_type || null : null;
};

// ─────────────────────────────────────────────────────────────────────────────
export default function EditProcurement() {
    const { id } = useParams();
    const navigate = useNavigate();

    // ── Reference data (modes + projects) ────────────────────────────────────
    const [modes, setModes] = useState([]);
    const [projects, setProjects] = useState([]);
    const [refLoading, setRefLoading] = useState(true);

    // ── Form fields ───────────────────────────────────────────────────────────
    const [title, setTitle] = useState("");
    const [modeId, setModeId] = useState("");
    const [projectId, setProjectId] = useState("");
    const [description, setDescription] = useState("");
    const [dateDisplay, setDateDisplay] = useState("");

    // ── Files ─────────────────────────────────────────────────────────────────
    const [existingPdfs, setExistingPdfs] = useState([]);
    const [removedPdfIds, setRemovedPdfIds] = useState(new Set());
    const [newFiles, setNewFiles] = useState([]); // { file, fileType, label }

    // ── Modal ─────────────────────────────────────────────────────────────────
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedType, setSelectedType] = useState("");
    const fileInputRef = useRef(null);

    // ── Page state ────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [procurementData, setProcurementData] = useState(null);

    // ── Load modes & projects ─────────────────────────────────────────────────
    useEffect(() => {
        setRefLoading(true);
        Promise.all([
            fetch("/projects", { headers: { Accept: "application/json" }, credentials: "include" }).then((r) => r.json()),
            fetch("/procurement-modes", { headers: { Accept: "application/json" }, credentials: "include" }).then((r) => r.json()),
        ])
            .then(([pData, mData]) => {
                const pList = Array.isArray(pData) ? pData : pData?.data ?? [];
                const mList = Array.isArray(mData) ? mData : mData?.data ?? [];
                setProjects(pList);
                setModes(mList);
            })
            .catch(() => {/* non-fatal — selects will just be empty */ })
            .finally(() => setRefLoading(false));
    }, []);

    // ── Load procurement ──────────────────────────────────────────────────────
    useEffect(() => {
        if (!id) return;
        setLoading(true);
        fetch(`/procurements/${id}`, {
            headers: { Accept: "application/json" },
            credentials: "include",
        })
            .then((r) => { if (!r.ok) throw new Error("Failed to load procurement."); return r.json(); })
            .then((data) => {
                setProcurementData(data);
                setTitle(data.title || "");
                setModeId(String(data.procurement_mode_id || data.procurement_mode?.id || ""));
                setProjectId(String(data.project_id || data.project_record?.id || ""));
                setDescription(data.description || "");
                setDateDisplay(
                    data.created_at
                        ? new Date(data.created_at).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
                        : ""
                );
                setExistingPdfs(data.pdfs || []);
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    // ── Derived ───────────────────────────────────────────────────────────────
    const visibleExisting = existingPdfs.filter((p) => !removedPdfIds.has(p.id));
    const allAttachedKeys = new Set([
        ...visibleExisting.map(resolveFileKey).filter(Boolean),
        ...newFiles.map((f) => f.fileType),
    ]);

    // ── Modal handlers ────────────────────────────────────────────────────────
    const openModal = () => setModalOpen(true);
    const closeModal = () => {
        setModalOpen(false);
        setSelectedFile(null);
        setSelectedType("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const handleAttach = () => {
        if (!selectedFile || !selectedType) { alert("Please select a file and its type."); return; }
        const label = FILE_TYPES.find((t) => t.value === selectedType)?.label || selectedType;
        setNewFiles((prev) => [...prev, { file: selectedFile, fileType: selectedType, label }]);
        closeModal();
    };

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            // 1. Update procurement fields
            const res = await fetch(`/procurements/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    procurement_mode_id: parseInt(modeId),
                    project_id: parseInt(projectId),
                    description: description || null,
                }),
            });
            if (!res.ok) {
                const d = await res.json().catch(() => ({}));
                const firstErr = d?.errors ? Object.values(d.errors)[0]?.[0] : null;
                throw new Error(firstErr || d.message || "Failed to save procurement.");
            }

            // 2. Upload new attachments
            for (const { file, fileType } of newFiles) {
                const form = new FormData();
                form.append("file", file);
                form.append("checklist", JSON.stringify({ type: fileType }));
                form.append("file_name", file.name);
                await fetch(`/procurements/${id}/attachments`, {
                    method: "POST",
                    headers: { Accept: "application/json" },
                    credentials: "include",
                    body: form,
                });
            }

            // 3. Navigate to EditPurchaseRequest (pass PR id in URL)
            const pr = procurementData?.purchase_request;
            if (pr?.id) {
                navigate(`/procurement/${id}/purchase-request/${pr.id}/edit`);
            } else {
                navigate(`/procurement/${id}`);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // ── Delete ────────────────────────────────────────────────────────────────
    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to delete this procurement? This cannot be undone.")) return;
        setDeleting(true);
        try {
            const res = await fetch(`/procurements/${id}`, {
                method: "DELETE",
                headers: { Accept: "application/json" },
                credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to delete procurement.");
            navigate("/procurement");
        } catch (err) {
            setError(err.message);
        } finally {
            setDeleting(false);
        }
    };

    // ── Loading / error states ────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-gray-500 text-sm animate-pulse">Loading…</div>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Back */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-gray-600 hover:text-[#03445D] mb-6 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 8 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
                    </svg>
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">Procurement</h1>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-8">

                    {/* ── Info row ── */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                        {/* Title */}
                        <div className="md:col-span-4">
                            <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Procurement Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                            />
                        </div>

                        {/* Mode */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Mode of Procurement
                            </label>
                            <select
                                value={modeId}
                                onChange={(e) => setModeId(e.target.value)}
                                disabled={refLoading}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293] disabled:opacity-60"
                            >
                                <option value="">Select mode…</option>
                                {modes.map((m) => (
                                    <option key={m.id} value={m.id}>
                                        {m.name}{m.code ? ` (${m.code})` : ""}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Project */}
                        <div className="md:col-span-3">
                            <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Project
                            </label>
                            <select
                                value={projectId}
                                onChange={(e) => setProjectId(e.target.value)}
                                disabled={refLoading}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293] disabled:opacity-60"
                            >
                                <option value="">Select project…</option>
                                {projects.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date read-only */}
                        <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Date
                            </label>
                            <p className="text-sm text-gray-700 py-2">{dateDisplay}</p>
                        </div>
                    </div>

                    {/* ── Description ── */}
                    <div>
                        <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                            Detailed Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={5}
                            placeholder="Provide complete details of the requested items, including specifications, quantity, and purpose. (Ex. 5 laptops with 8GB RAM for new staff use)."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293] resize-y"
                        />
                    </div>

                    {/* ── Files ── */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                        {/* File list */}
                        <div className="md:col-span-8">
                            <div className="bg-[#D3EAED]/50 rounded-t-lg px-4 py-3 border border-[#D3EAED]">
                                <p className="text-sm font-semibold text-gray-800">File Name</p>
                            </div>

                            {visibleExisting.length === 0 && newFiles.length === 0 ? (
                                <div className="border border-t-0 border-gray-200 rounded-b-lg px-4 py-8 text-center text-sm text-gray-400 italic bg-white">
                                    No files attached
                                </div>
                            ) : (
                                <ul className="border border-t-0 border-gray-200 rounded-b-lg bg-white divide-y divide-gray-100 overflow-hidden">
                                    {/* Existing server PDFs */}
                                    {visibleExisting.map((pdf) => (
                                        <li key={pdf.id} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex-shrink-0 w-9 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                    </svg>
                                                </div>
                                                <span className="text-sm text-gray-800 truncate">{resolveFileLabel(pdf)}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setRemovedPdfIds((prev) => new Set([...prev, pdf.id]))}
                                                className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Remove"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}

                                    {/* Newly added local files */}
                                    {newFiles.map(({ file, label }, idx) => (
                                        <li key={`new-${idx}`} className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50 bg-green-50/30">
                                            <div className="flex items-center gap-3 min-w-0">
                                                <div className="flex-shrink-0 w-9 h-9 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center">
                                                    <svg className="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm text-gray-800 truncate">{label}</p>
                                                    <p className="text-xs text-gray-400 truncate">{file.name}</p>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setNewFiles((prev) => prev.filter((_, i) => i !== idx))}
                                                className="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
                                                title="Remove"
                                            >
                                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <button
                                type="button"
                                onClick={openModal}
                                className="mt-3 text-sm text-[#1C7293] hover:text-[#155a7a] font-medium flex items-center gap-1"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add file
                            </button>
                        </div>

                        {/* Checklist */}
                        <div className="md:col-span-4">
                            <p className="text-sm font-semibold text-gray-800 mb-3">Files to be uploaded</p>
                            <div className="space-y-2">
                                {FILE_TYPES.map(({ value, label, required }) => (
                                    <label key={value} className="flex items-center gap-2.5 cursor-default">
                                        <input
                                            type="checkbox"
                                            readOnly
                                            checked={allAttachedKeys.has(value)}
                                            className="h-4 w-4 text-[#1C7293] border-gray-300 rounded pointer-events-none"
                                        />
                                        <span className="text-sm text-gray-700">
                                            {label}{required && <span className="text-red-600 ml-0.5">*</span>}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={deleting}
                            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                        >
                            {deleting ? "Deleting…" : "Delete"}
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>
                    </div>
                </form>
            </div>

            {/* ── File Attach Modal ── */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                        >×</button>

                        <div className="p-6 pt-10">
                            <h2 className="text-lg font-semibold text-[#03445D] text-center mb-6">Attach Supporting File</h2>

                            <label
                                htmlFor="edit-file-upload"
                                className="cursor-pointer block border-2 border-dashed border-gray-400 rounded-lg p-10 text-center hover:border-[#1C7293] hover:bg-gray-50/50 transition-all mb-6"
                            >
                                <div className="mx-auto w-14 h-14 mb-4 text-gray-500">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                        <path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
                                    </svg>
                                </div>
                                <div className="text-gray-600 text-sm">
                                    Click to upload file<br />
                                    <span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX</span>
                                </div>
                                <input
                                    id="edit-file-upload"
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx"
                                    onChange={(e) => e.target.files?.[0] && setSelectedFile(e.target.files[0])}
                                />
                            </label>

                            {selectedFile && (
                                <div className="text-center text-sm text-gray-700 mb-5">
                                    <strong className="block truncate">{selectedFile.name}</strong>
                                    <span className="text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            )}

                            <div className="mb-8">
                                <label className="block text-sm font-medium text-[#03445D] text-center mb-2">Type of File</label>
                                <select
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    <option value="" disabled>Select type…</option>
                                    {FILE_TYPES.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={handleAttach}
                                    disabled={!selectedFile || !selectedType}
                                    className="px-8 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    Attach File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}