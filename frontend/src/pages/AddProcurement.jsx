import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

const FILE_TYPES = [
  { value: 'sub_allotment_release_order', label: 'Sub Allotment Release Order (SARO)', required: true },
  { value: 'annual_procurement_plan', label: 'Annual Procurement Plan (APP)', required: true },
  { value: 'project_procurement_management_plan', label: 'Project Procurement Management Plan (PPMP)', required: true },
  { value: 'market_study', label: 'Market Study / Request for Information', required: true },
  { value: 'technical_specification', label: 'Technical Specification', required: false },
];

export default function AddProcurement() {
  const navigate = useNavigate();

  // ── Form fields ──────────────────────────────────────────────────────────────
  const [title, setTitle] = useState('');
  const [modeId, setModeId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [description, setDescription] = useState('');

  // ── Reference data ───────────────────────────────────────────────────────────
  const [projects, setProjects] = useState([]);
  const [modes, setModes] = useState([]);
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState(null);

  // ── Attached files (local list before/after submission) ──────────────────────
  const [attachedFiles, setAttachedFiles] = useState([]); // [{file, fileType, label}]

  // ── File modal state ─────────────────────────────────────────────────────────
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const fileInputRef = useRef(null);

  // ── Submission state ─────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // ── Load projects + modes ────────────────────────────────────────────────────
  useEffect(() => {
    setRefLoading(true);
    Promise.all([api.getProjects(), api.getProcurementModes()])
      .then(([p, m]) => { setProjects(p); setModes(m); })
      .catch((err) => setRefError(err.message || 'Failed to load form data.'))
      .finally(() => setRefLoading(false));
  }, []);

  // ── File modal handlers ──────────────────────────────────────────────────────
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setFileType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) setSelectedFile(e.target.files[0]);
  };

  const handleAttach = () => {
    if (!selectedFile || !fileType) {
      alert('Please select both a file type and a file.');
      return;
    }
    const typeLabel = FILE_TYPES.find(t => t.value === fileType)?.label || fileType;
    setAttachedFiles(prev => [...prev, { file: selectedFile, fileType, label: typeLabel }]);
    closeModal();
  };

  const removeAttached = (idx) => setAttachedFiles(prev => prev.filter((_, i) => i !== idx));

  // ── Submit handler ───────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');
    setSubmitting(true);

    try {
      // Step 1: Create the procurement record
      const res = await fetch('/procurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title,
          procurement_mode_id: parseInt(modeId),
          project_id: parseInt(projectId),
          description: description || null,
          purchase_request: {
            office: 'DICT Regional Office I',
            date_created: new Date().toISOString().split('T')[0],
            responsibility_center_code: 'N/A',
            purpose: title,
            items: [],
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const firstError = data?.errors ? Object.values(data.errors)[0]?.[0] : null;
        throw new Error(firstError || data.message || 'Failed to create procurement.');
      }

      const { procurement } = await res.json();
      const procId = procurement.id;

      // Step 2: Upload each attached file
      for (const { file, fileType: ft } of attachedFiles) {
        const form = new FormData();
        form.append('file', file);
        form.append('checklist', JSON.stringify({ type: ft }));
        form.append('file_name', file.name);

        const upRes = await fetch(`/procurements/${procId}/attachments`, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          credentials: 'include',
          body: form,
        });

        if (!upRes.ok) {
          const d = await upRes.json().catch(() => ({}));
          console.warn('Attachment upload failed:', d.message);
        }
      }

      setSubmitSuccess('Procurement created successfully!');
      setTimeout(() => navigate('/procurement'), 1200);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  return (
    <div>
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate('/procurement')}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-[#03445D]"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 8 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
        </svg>
      </button>

      <h1 className="text-2xl font-bold text-black mb-8">New Procurement</h1>

      {refError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
          ⚠️ {refError} — Please refresh the page or check your connection.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* ── Row 1: Title / Mode / Project / Date ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Procurement Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293]"
            />
          </div>

          <div className="md:col-span-4">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Mode of Procurement *</label>
            <select
              value={modeId}
              onChange={e => setModeId(e.target.value)}
              disabled={refLoading}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293] disabled:opacity-60"
            >
              <option value="">Select mode...</option>
              {modes.map(m => (
                <option key={m.id} value={m.id}>{m.name}{m.code ? ` (${m.code})` : ''}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Project *</label>
            <select
              value={projectId}
              onChange={e => setProjectId(e.target.value)}
              disabled={refLoading}
              required
              className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293] disabled:opacity-60"
            >
              <option value="">Select project...</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-1">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Date</label>
            <div className="py-2.5 text-sm text-gray-700">{today}</div>
          </div>
        </div>

        {/* ── Procurement description ── */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Detailed Description</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-4 py-3 bg-gray-50 border border-black rounded-lg text-sm outline-none resize-y min-h-[100px] focus:ring-2 focus:ring-[#1C7293]"
            placeholder="Detailed description of the procurement"
          />
        </div>

        {/* ── Purchase Request fields (required by backend) ──
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="md:col-span-3 text-sm font-semibold text-[#03445D] mb-1">Purchase Request Details</p>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Office *</label>
            <input
              type="text"
              value={office}
              onChange={e => setOffice(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293]"
              placeholder="e.g. DICT Regional Office I"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Responsibility Center Code *</label>
            <input
              type="text"
              value={rcCode}
              onChange={e => setRcCode(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293]"
              placeholder="e.g. 0801-00"
            />
          </div>
          <div>
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Purpose *</label>
            <input
              type="text"
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              required
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293]"
              placeholder="Purpose of purchase request"
            />
          </div>
        </div> */}

        {/* ── Files section ── */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* File Name list */}
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
                    <button
                      type="button"
                      onClick={() => removeAttached(idx)}
                      className="text-red-400 hover:text-red-600 ml-4 text-lg font-bold leading-none"
                      title="Remove"
                    >×</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Checklist + Add Files button */}
          <div className="md:col-span-4">
            <p className="text-sm font-medium text-black mb-3">Files to be uploaded</p>
            <div className="space-y-2 mb-5">
              {FILE_TYPES.map(({ value, label, required: req }) => {
                const attached = attachedFiles.some(f => f.fileType === value);
                return (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      readOnly
                      checked={attached}
                      className="h-4 w-4 text-[#1C7293] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-800">
                      {label} {req && <span className="text-red-600">*</span>}
                    </span>
                  </label>
                );
              })}
            </div>
            <button
              type="button"
              onClick={openModal}
              className="w-full px-6 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white font-medium rounded-lg transition-colors shadow-sm"
            >
              + Add Files
            </button>
          </div>
        </div>

        {/* ── Feedback ── */}
        {submitError && <p className="text-red-600 text-sm font-medium">{submitError}</p>}
        {submitSuccess && <p className="text-green-600 text-sm font-medium">{submitSuccess}</p>}

        {/* ── Actions ── */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/procurement')}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Submitting…' : 'Create Procurement'}
          </button>
        </div>
      </form>

      {/* ── File Attach Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
            <button
              className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={closeModal}
            >×</button>

            <div className="p-6 pt-10">
              <h2 className="text-lg font-semibold text-[#03445D] text-center mb-6">Attach Supporting File</h2>

              <label
                htmlFor="file-upload"
                className="cursor-pointer block border-2 border-dashed border-gray-400 rounded-lg p-10 text-center hover:border-[#1C7293] hover:bg-gray-50/50 transition-all mb-6"
              >
                <div className="mx-auto w-14 h-14 mb-4 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
                  </svg>
                </div>
                <div className="text-gray-600 text-sm">
                  Click to upload file
                  <br /><span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX</span>
                </div>
                <input
                  id="file-upload"
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx"
                  onChange={handleFileChange}
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
                  value={fileType}
                  onChange={e => setFileType(e.target.value)}
                >
                  <option value="" disabled>Select type…</option>
                  {FILE_TYPES.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center gap-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                >Cancel</button>
                <button
                  type="button"
                  onClick={handleAttach}
                  disabled={!selectedFile || !fileType}
                  className="px-8 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >Attach File</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}