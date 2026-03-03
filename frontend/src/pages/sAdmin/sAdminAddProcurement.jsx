import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SAdminAddProcurement() {
    const navigate = useNavigate();

    // Form fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [modeId, setModeId] = useState("");
    const [projectId, setProjectId] = useState("");

    // Reference data
    const [projects, setProjects] = useState([]);
    const [modes, setModes] = useState([]);
    const [refLoading, setRefLoading] = useState(true);
    const [refError, setRefError] = useState(null);

    // File attachment
    const [attachedFiles, setAttachedFiles] = useState([]);
    const [isFileModalOpen, setIsFileModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileType, setFileType] = useState("");
    const fileInputRef = useRef(null);

    // Inline create modals
    const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
    const [isAddModeOpen, setIsAddModeOpen] = useState(false);

    // New project form
    const [newProjectName, setNewProjectName] = useState("");
    const [newProjectDesc, setNewProjectDesc] = useState("");
    const [projectSaving, setProjectSaving] = useState(false);
    const [projectSaveError, setProjectSaveError] = useState("");

    // New mode form
    const [newModeName, setNewModeName] = useState("");
    const [newModeCode, setNewModeCode] = useState("");
    const [newModeDesc, setNewModeDesc] = useState("");
    const [modeSaving, setModeSaving] = useState(false);
    const [modeSaveError, setModeSaveError] = useState("");

    // Submission state
    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");

    // ── Fetch projects + modes on mount ──────────────────────────────────────────
    const loadRefData = () => {
        setRefLoading(true);
        Promise.all([
            fetch("/sadmin/projects", { headers: { Accept: "application/json" }, credentials: "include" }).then((r) => r.json()),
            fetch("/sadmin/procurement-modes", { headers: { Accept: "application/json" }, credentials: "include" }).then((r) => r.json()),
        ])
            .then(([p, m]) => {
                setProjects(Array.isArray(p) ? p : []);
                setModes(Array.isArray(m) ? m : []);
            })
            .catch((err) => setRefError(err.message || "Failed to load form data."))
            .finally(() => setRefLoading(false));
    };

    useEffect(() => { loadRefData(); }, []);

    // ── Create Project inline ─────────────────────────────────────────────────────
    const handleCreateProject = async (e) => {
        e.preventDefault();
        setProjectSaveError("");
        setProjectSaving(true);
        try {
            const res = await fetch("/sadmin/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newProjectName, description: newProjectDesc }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create project.");
            }
            const created = await res.json();
            setProjects((prev) => [...prev, created]);
            setProjectId(String(created.id));
            setNewProjectName("");
            setNewProjectDesc("");
            setIsAddProjectOpen(false);
        } catch (err) {
            setProjectSaveError(err.message);
        } finally {
            setProjectSaving(false);
        }
    };

    // ── Create Mode inline ────────────────────────────────────────────────────────
    const handleCreateMode = async (e) => {
        e.preventDefault();
        setModeSaveError("");
        setModeSaving(true);
        try {
            const res = await fetch("/sadmin/procurement-modes", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify({ name: newModeName, code: newModeCode, description: newModeDesc }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.message || "Failed to create mode.");
            }
            const created = await res.json();
            setModes((prev) => [...prev, created]);
            setModeId(String(created.id));
            setNewModeName("");
            setNewModeCode("");
            setNewModeDesc("");
            setIsAddModeOpen(false);
        } catch (err) {
            setModeSaveError(err.message);
        } finally {
            setModeSaving(false);
        }
    };

    // ── File attachment ───────────────────────────────────────────────────────────
    const FILE_TYPE_LABELS = {
        sub_allotment_release_order: 'Sub Allotment Release Order (SARO)',
        annual_procurement_plan: 'Annual Procurement Plan (APP)',
        project_procurement_management_plan: 'Project Procurement Management Plan (PPMP)',
        market_study: 'Market Study / Request for Information',
        technical_specification: 'Technical Specification',
    };
    const handleFileChange = (e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]); };
    const removeAttached = (idx) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx));
    const handleAttach = () => {
        if (!selectedFile || !fileType) { alert("Please select both a file type and a file."); return; }
        setAttachedFiles(prev => [...prev, { file: selectedFile, fileType, label: FILE_TYPE_LABELS[fileType] || fileType }]);
        setIsFileModalOpen(false);
        setSelectedFile(null);
        setFileType("");
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    // ── Submit procurement ────────────────────────────────────────────────────────
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError("");
        setSubmitting(true);
        try {
            const res = await fetch("/sadmin/procurements", {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    title,
                    description: description || null,
                    procurement_mode_id: parseInt(modeId),
                    project_id: parseInt(projectId),
                }),
            });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
                throw new Error(firstError || data.message || "Failed to create procurement.");
            }
            const { procurement } = await res.json();
            const procId = procurement.id;

            // Upload attached files via the existing attachment endpoint
            for (const { file, fileType: ft } of attachedFiles) {
                const form = new FormData();
                form.append('file', file);
                form.append('checklist', JSON.stringify({ type: ft }));
                form.append('file_name', file.name);
                await fetch(`/sadmin/procurements/${procId}/attachments`, {
                    method: 'POST',
                    headers: { Accept: 'application/json' },
                    credentials: 'include',
                    body: form,
                });
            }

            navigate("/sadmin/procurement");
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // ── Shared inline-modal style ─────────────────────────────────────────────────
    const ModalOverlay = ({ children, onClose }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 relative" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );

    return (
        <div>
            {/* Back link */}
            <button
                onClick={() => navigate("/sadmin/procurement")}
                className="inline-flex items-center mb-6 text-gray-700 hover:text-[#134C62] gap-1"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 8 14">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
                </svg>
                Back
            </button>

            <h1 className="text-2xl font-bold text-black mb-8">New Procurement</h1>

            {refError && (
                <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                    ⚠️ {refError}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Row 1: Title / Mode / Project / Date */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    {/* Title */}
                    <div className="md:col-span-5">
                        <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Procurement Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#134C62]"
                        />
                    </div>

                    {/* Mode of Procurement */}
                    <div className="md:col-span-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-[#03445D]">Mode of Procurement</label>
                            <button
                                type="button"
                                onClick={() => setIsAddModeOpen(true)}
                                className="text-xs text-[#134C62] hover:underline font-medium"
                            >
                                + Add Mode
                            </button>
                        </div>
                        <select
                            value={modeId}
                            onChange={(e) => setModeId(e.target.value)}
                            disabled={refLoading}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#134C62] disabled:opacity-60"
                        >
                            <option value="">Select mode...</option>
                            {modes.map((m) => (
                                <option key={m.id} value={m.id}>{m.name}{m.code ? ` (${m.code})` : ""}</option>
                            ))}
                        </select>
                    </div>

                    {/* Project */}
                    <div className="md:col-span-2">
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-sm font-medium text-[#03445D]">Project</label>
                            <button
                                type="button"
                                onClick={() => setIsAddProjectOpen(true)}
                                className="text-xs text-[#134C62] hover:underline font-medium"
                            >
                                + Add Project
                            </button>
                        </div>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            disabled={refLoading}
                            required
                            className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#134C62] disabled:opacity-60"
                        >
                            <option value="">Select project...</option>
                            {projects.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div className="md:col-span-1">
                        <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Date</label>
                        <div className="py-2.5 text-sm text-gray-700">
                            {new Date().toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Detailed Description</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="w-full px-4 py-3 bg-gray-50 border border-black rounded-lg text-sm outline-none resize-y min-h-[120px] focus:ring-2 focus:ring-[#134C62]"
                        placeholder="Detailed description of the procurement"
                    />
                </div>

                {/* Files section */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    <div className="md:col-span-8">
                        <div className="bg-[#D3EAED]/60 rounded-lg p-3 border border-[#D3EAED] mb-2">
                            <p className="text-sm font-medium text-black">File Name</p>
                        </div>
                        {attachedFiles.length === 0 ? (
                            <div className="min-h-[80px] flex items-center justify-center text-sm text-gray-400 italic border border-dashed border-gray-300 rounded-lg">
                                No files attached yet
                            </div>
                        ) : (
                            <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                                {attachedFiles.map(({ file, label }, idx) => (
                                    <li key={idx} className="flex items-center justify-between px-4 py-2.5 bg-white hover:bg-gray-50">
                                        <div>
                                            <p className="text-sm font-medium text-gray-800 truncate max-w-xs">{file.name}</p>
                                            <p className="text-xs text-gray-500">{label} · {(file.size / 1024).toFixed(1)} KB</p>
                                        </div>
                                        <button type="button" onClick={() => removeAttached(idx)}
                                            className="text-red-400 hover:text-red-600 ml-4 text-lg font-bold leading-none" title="Remove">×</button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    <div className="md:col-span-4">
                        <p className="text-sm font-medium text-black mb-3">Files to be uploaded</p>
                        <div className="space-y-2 mb-5">
                            {Object.entries(FILE_TYPE_LABELS).map(([value, label]) => {
                                const attached = attachedFiles.some(f => f.fileType === value);
                                const req = value !== 'technical_specification';
                                return (
                                    <label key={value} className="flex items-center gap-2">
                                        <input type="checkbox" readOnly checked={attached} className="h-4 w-4 text-[#134C62] border-gray-300 rounded" />
                                        <span className="text-sm text-gray-800">{label} {req && <span className="text-red-600">*</span>}</span>
                                    </label>
                                );
                            })}
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsFileModalOpen(true)}
                            className="w-full px-6 py-2.5 bg-[#134C62] hover:bg-[#0e3a4d] text-white font-medium rounded-lg transition-colors"
                        >
                            + Add Files
                        </button>
                    </div>
                </div>

                {submitError && (
                    <p className="text-red-600 text-sm">{submitError}</p>
                )}

                {/* Submit */}
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={() => navigate("/sadmin/procurement")}
                        className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-2.5 bg-[#134C62] hover:bg-[#0e3a4d] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60"
                    >
                        {submitting ? "Submitting..." : "Submit Procurement"}
                    </button>
                </div>
            </form>

            {/* ── File Modal ────────────────────────────────────────────────────────── */}
            {isFileModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
                        <button
                            className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                            onClick={() => setIsFileModalOpen(false)}
                        >×</button>
                        <div className="p-6 pt-10">
                            <h2 className="text-lg font-semibold text-[#03445D] text-center mb-6">Attach Supporting File</h2>
                            <label
                                htmlFor="sadmin-file-upload"
                                className="cursor-pointer block border-2 border-dashed border-gray-400 rounded-lg p-10 text-center hover:border-[#134C62] hover:bg-gray-50/50 transition-all mb-6"
                            >
                                <div className="mx-auto w-14 h-14 mb-4 text-gray-500">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                                        <path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
                                    </svg>
                                </div>
                                <div className="text-gray-600 text-sm">Click to upload file<br /><span className="text-xs text-gray-400">or drag and drop</span></div>
                                <input id="sadmin-file-upload" ref={fileInputRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} />
                            </label>
                            {selectedFile && (
                                <div className="text-center text-sm text-gray-700 mb-6">
                                    <strong className="block truncate">{selectedFile.name}</strong>
                                    <span className="text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                                </div>
                            )}
                            <div className="mb-8">
                                <label className="block text-sm font-medium text-[#03445D] text-center mb-2">Type of File</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm" value={fileType} onChange={(e) => setFileType(e.target.value)}>
                                    <option value="" disabled>Select type...</option>
                                    <option value="sub_allotment_release_order">Sub Allotment Release Order (SARO)</option>
                                    <option value="annual_procurement_plan">Annual Procurement Plan (APP)</option>
                                    <option value="project_procurement_management_plan">Project Procurement Management Plan (PPMP)</option>
                                    <option value="market_study">Market Study / Request for Information</option>
                                    <option value="technical_specification">Technical Specification</option>
                                </select>
                            </div>
                            <div className="flex justify-center gap-4">
                                <button type="button" onClick={() => setIsFileModalOpen(false)} className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium">Cancel</button>
                                <button type="button" onClick={handleAttach} disabled={!selectedFile || !fileType} className="px-8 py-2.5 bg-[#134C62] hover:bg-[#0e3a4d] text-white rounded-lg font-medium disabled:opacity-50">Attach File</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Add Project Modal ─────────────────────────────────────────────────── */}
            {isAddProjectOpen && (
                <ModalOverlay onClose={() => setIsAddProjectOpen(false)}>
                    <h3 className="text-lg font-bold text-[#134C62] mb-4">Add New Project</h3>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                            <input
                                type="text"
                                value={newProjectName}
                                onChange={(e) => setNewProjectName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#134C62]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={newProjectDesc}
                                onChange={(e) => setNewProjectDesc(e.target.value)}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-[#134C62]"
                            />
                        </div>
                        {projectSaveError && <p className="text-red-600 text-sm">{projectSaveError}</p>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAddProjectOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={projectSaving} className="px-5 py-2 text-sm bg-[#134C62] text-white rounded-lg hover:bg-[#0e3a4d] disabled:opacity-60">
                                {projectSaving ? "Saving..." : "Save Project"}
                            </button>
                        </div>
                    </form>
                </ModalOverlay>
            )}

            {/* ── Add Mode Modal ────────────────────────────────────────────────────── */}
            {isAddModeOpen && (
                <ModalOverlay onClose={() => setIsAddModeOpen(false)}>
                    <h3 className="text-lg font-bold text-[#134C62] mb-4">Add Mode of Procurement</h3>
                    <form onSubmit={handleCreateMode} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mode Name *</label>
                            <input
                                type="text"
                                value={newModeName}
                                onChange={(e) => setNewModeName(e.target.value)}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#134C62]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Code (optional)</label>
                            <input
                                type="text"
                                value={newModeCode}
                                onChange={(e) => setNewModeCode(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#134C62]"
                                placeholder="e.g. CB, DC"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                value={newModeDesc}
                                onChange={(e) => setNewModeDesc(e.target.value)}
                                rows={2}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none resize-none focus:ring-2 focus:ring-[#134C62]"
                            />
                        </div>
                        {modeSaveError && <p className="text-red-600 text-sm">{modeSaveError}</p>}
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setIsAddModeOpen(false)} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                            <button type="submit" disabled={modeSaving} className="px-5 py-2 text-sm bg-[#134C62] text-white rounded-lg hover:bg-[#0e3a4d] disabled:opacity-60">
                                {modeSaving ? "Saving..." : "Save Mode"}
                            </button>
                        </div>
                    </form>
                </ModalOverlay>
            )}
        </div>
    );
}
