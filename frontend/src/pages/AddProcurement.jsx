import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X } from 'lucide-react';
import { api } from '../lib/api';

const FILE_TYPES = [
  { value: 'sub_allotment_release_order', label: 'Sub Allotment Release Order (SARO)', required: true },
  { value: 'annual_procurement_plan', label: 'Annual Procurement Plan (APP)', required: true },
  { value: 'project_procurement_management_plan', label: 'Project Procurement Management Plan (PPMP)', required: true },
  { value: 'market_study', label: 'Market Study / Request for Information', required: true },
  { value: 'technical_specification', label: 'Term of references/Project Proposal/Program of works/ program instructions', required: false },
];

const EMPTY_ITEM = {
  item_no: '',
  stock_no: '',
  unit: '',
  item_description: '',
  item_inclusions: '',
  quantity: '',
  unit_cost: '',
};

// ─────────────────────────────────────────────────────────────────────────────
// STEP 1 — Procurement Info + File Attachments
// ─────────────────────────────────────────────────────────────────────────────
function StepProcurement({ data, setData, modes, projects, refLoading, onNext, onCancel }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const [showValidationModal, setShowValidationModal] = useState(false);
  const fileInputRef = useRef(null);

  const today = new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });

  // Validation checks
  const requiredFileTypes = FILE_TYPES.filter(f => f.required).map(f => f.value);
  const missingFiles = requiredFileTypes.filter(
    type => !data.attachedFiles.some(f => f.fileType === type)
  ).map(type => FILE_TYPES.find(f => f.value === type)?.label || type);

  const missingFields = [];
  if (!data.title.trim()) missingFields.push('Procurement Title');
  if (!data.modeId) missingFields.push('Mode of Procurement');
  if (!data.projectId) missingFields.push('Project');

  const isComplete = missingFields.length === 0 && missingFiles.length === 0;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setFileType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAttach = () => {
    if (!selectedFile || !fileType) { alert('Please select both a file type and a file.'); return; }
    const typeLabel = FILE_TYPES.find(t => t.value === fileType)?.label || fileType;
    setData(prev => ({ ...prev, attachedFiles: [...prev.attachedFiles, { file: selectedFile, fileType, label: typeLabel }] }));
    closeModal();
  };

  const removeAttached = (idx) =>
    setData(prev => ({ ...prev, attachedFiles: prev.attachedFiles.filter((_, i) => i !== idx) }));

  const handleNext = (e) => {
    e.preventDefault();
    if (!isComplete) {
      setShowValidationModal(true);
      return;
    }
    onNext();
  };

  return (
    <div>
      <button type="button" onClick={onCancel}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-[#03445D]">
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 8 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
        </svg>
        Back
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#1C7293] text-white flex items-center justify-center text-sm font-bold">1</span>
          <span className="text-sm font-semibold text-[#1C7293]">Procurement Info</span>
        </div>
        <div className="h-px w-10 bg-gray-300" />
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">2</span>
          <span className="text-sm text-gray-400">Purchase Request</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold text-black mb-8">New Procurement</h1>

      <form onSubmit={handleNext} className="space-y-8">
        {/* Row: Title / Mode / Project / Date */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Procurement Title *</label>
            <input type="text" value={data.title} onChange={e => setData(p => ({ ...p, title: e.target.value }))}
              required className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293]" />
          </div>
          <div className="md:col-span-4">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Mode of Procurement *</label>
            <select value={data.modeId} onChange={e => setData(p => ({ ...p, modeId: e.target.value }))}
              disabled={refLoading} required
              className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293] disabled:opacity-60">
              <option value="">Select mode...</option>
              {modes.map(m => <option key={m.id} value={m.id}>{m.name}{m.code ? ` (${m.code})` : ''}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Project *</label>
            <select value={data.projectId} onChange={e => setData(p => ({ ...p, projectId: e.target.value }))}
              disabled={refLoading} required
              className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#1C7293] disabled:opacity-60">
              <option value="">Select project...</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="md:col-span-1">
            <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Date</label>
            <div className="py-2.5 text-sm text-gray-700">{today}</div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-[#03445D]">Detailed Description</label>
          <textarea value={data.description} onChange={e => setData(p => ({ ...p, description: e.target.value }))}
            rows={4} placeholder="Provide complete details of the requested items, including specifications, quantity, and purpose. (Ex. 5 laptops with 8GB RAM for new staff use)."
            className="w-full px-4 py-3 bg-gray-50 border border-black rounded-lg text-sm outline-none resize-y min-h-[100px] focus:ring-2 focus:ring-[#1C7293]" />
        </div>

        {/* Files */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <div className="bg-[#D3EAED]/60 rounded-lg p-3 border border-[#D3EAED] mb-2">
              <p className="text-sm font-medium text-black">File Name</p>
            </div>
            {data.attachedFiles.length === 0 ? (
              <div className="min-h-[80px] flex items-center justify-center text-sm text-gray-400 italic border border-dashed border-gray-300 rounded-lg">
                No files attached yet
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                {data.attachedFiles.map(({ file, label }, idx) => (
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
              {FILE_TYPES.map(({ value, label, required: req }) => {
                const attached = data.attachedFiles.some(f => f.fileType === value);
                return (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" readOnly checked={attached} className="h-4 w-4 text-[#1C7293] border-gray-300 rounded" />
                    <span className="text-sm text-gray-800">{label} {req && <span className="text-red-600">*</span>}</span>
                  </label>
                );
              })}
            </div>
            <button type="button" onClick={openModal}
              className="w-full px-6 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white font-medium rounded-lg transition-colors shadow-sm">
              + Add Files
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button
            type="submit"
            onClick={!isComplete ? (e) => { e.preventDefault(); setShowValidationModal(true); } : undefined}
            className={`px-8 py-2.5 font-semibold rounded-lg text-sm transition-colors
              ${isComplete
                ? 'bg-[#1C7293] hover:bg-[#155a7a] text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
          >
            Next: Purchase Request →
          </button>
        </div>
      </form>

      {/* Validation Modal */}
      {showValidationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-gray-800">Incomplete Submission</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Please complete all required fields and upload all required files before proceeding.
            </p>
            {missingFields.length > 0 && (
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Missing Fields</p>
                <ul className="space-y-1">
                  {missingFields.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {missingFiles.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">Missing Files</p>
                <ul className="space-y-1">
                  {missingFiles.map((f, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-red-600">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setShowValidationModal(false)}
                className="px-6 py-2 bg-[#1C7293] hover:bg-[#155a7a] text-white text-sm font-semibold rounded-lg transition-colors"
              >
                OK, Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Attach Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
            <button className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-2xl font-bold" onClick={closeModal}>×</button>
            <div className="p-6 pt-10">
              <h2 className="text-lg font-semibold text-[#03445D] text-center mb-6">Attach Supporting File</h2>
              <label htmlFor="file-upload"
                className="cursor-pointer block border-2 border-dashed border-gray-400 rounded-lg p-10 text-center hover:border-[#1C7293] hover:bg-gray-50/50 transition-all mb-6">
                <div className="mx-auto w-14 h-14 mb-4 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" /><path d="m16 16-4-4-4 4" />
                  </svg>
                </div>
                <div className="text-gray-600 text-sm">
                  Click to upload file<br /><span className="text-xs text-gray-400">PDF, DOC, DOCX, XLS, XLSX</span>
                </div>
                <input id="file-upload" ref={fileInputRef} type="file" className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={e => e.target.files?.[0] && setSelectedFile(e.target.files[0])} />
              </label>

              {selectedFile && (
                <div className="text-center text-sm text-gray-700 mb-5">
                  <strong className="block truncate">{selectedFile.name}</strong>
                  <span className="text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</span>
                </div>
              )}

              <div className="mb-8">
                <label className="block text-sm font-medium text-[#03445D] text-center mb-2">Type of File</label>
                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                  value={fileType} onChange={e => setFileType(e.target.value)}>
                  <option value="" disabled>Select type…</option>
                  {FILE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="flex justify-center gap-4">
                <button type="button" onClick={closeModal}
                  className="px-8 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">Cancel</button>
                <button type="button" onClick={handleAttach} disabled={!selectedFile || !fileType}
                  className="px-8 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
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

// ─────────────────────────────────────────────────────────────────────────────
// STEP 2 — Purchase Request Details
// ─────────────────────────────────────────────────────────────────────────────
function StepPurchaseRequest({ procData, prData, setPrData, submitting, submitError, onBack, onSubmit }) {
  const today = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  const addItem = () =>
    setPrData(p => ({ ...p, items: [...p.items, { ...EMPTY_ITEM, item_no: String(p.items.length + 1) }] }));

  const removeItem = (idx) =>
    setPrData(p => ({
      ...p,
      items: p.items.filter((_, i) => i !== idx).map((item, i) => ({ ...item, item_no: String(i + 1) })),
    }));

  const updateItem = (idx, field, value) =>
    setPrData(p => ({ ...p, items: p.items.map((item, i) => i === idx ? { ...item, [field]: value } : item) }));

  const totalCost = prData.items.reduce((sum, item) => {
    const qty = parseFloat(item.quantity) || 0;
    const cost = parseFloat(item.unit_cost) || 0;
    return sum + qty * cost;
  }, 0);

  const formatPeso = (n) => n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div>
      <button type="button" onClick={onBack}
        className="inline-flex items-center mb-6 text-gray-700 hover:text-[#03445D]">
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 8 14">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
        </svg>
        Back
      </button>

      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold">✓</span>
          <span className="text-sm text-gray-500">Procurement Info</span>
        </div>
        <div className="h-px w-10 bg-gray-300" />
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-[#1C7293] text-white flex items-center justify-center text-sm font-bold">2</span>
          <span className="text-sm font-semibold text-[#1C7293]">Purchase Request</span>
        </div>
      </div>

      <h1 className="text-2xl font-bold mb-2">New Purchase Request</h1>
      <p className="text-gray-500 mb-8">
        For procurement: <span className="font-medium text-gray-700">{procData.title}</span>
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Two-column details */}
        <div className="grid grid-cols-2 gap-10">
          {/* Left column */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="font-semibold text-sm">Procurement Title</label>
              <input className="w-full border rounded-md p-2 mt-1 bg-gray-50 text-gray-600" value={procData.title} readOnly />
            </div>
            <div>
              <label className="font-semibold text-sm">Mode of Procurement</label>
              <input className="w-full border rounded-md p-2 mt-1 bg-gray-50 text-gray-600" value="Small Value Procurement" readOnly />
            </div>
            <div>
              <label className="font-semibold text-sm">Entity Name</label>
              <input className="w-full border rounded-md p-2 mt-1 bg-gray-50 text-gray-600"
                value="Department of Information and Communications Technology" readOnly />
            </div>
            <div>
              <label className="font-semibold text-sm">Office / Section *</label>
              <input className="w-full border rounded-md p-2 mt-1" required
                value={prData.office} onChange={e => setPrData(p => ({ ...p, office: e.target.value }))}
                placeholder="e.g. DICT Regional Office I" />
            </div>
            <div>
              <label className="font-semibold text-sm">Date</label>
              <input type="text" className="w-full border rounded-md p-2 mt-1 bg-gray-50 text-gray-600" value={today} readOnly />
            </div>
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-5">
            <div>
              <label className="font-semibold text-sm">Files Uploaded</label>
              <ul className="mt-2 text-sm text-gray-700 space-y-1">
                {procData.attachedFiles.length === 0
                  ? <li className="text-gray-400 italic">No files attached</li>
                  : procData.attachedFiles.map(({ file, label }, i) => (
                    <li key={i}>📄 {label}</li>
                  ))}
              </ul>
            </div>
            <div>
              <label className="font-semibold text-sm">Fund Cluster</label>
              <input className="w-full border rounded-md p-2 mt-1"
                value={prData.fundCluster} onChange={e => setPrData(p => ({ ...p, fundCluster: e.target.value }))} />
            </div>
            <div>
              <label className="font-semibold text-sm">Purchase Request Number</label>
              <input className="w-full border rounded-md p-2 mt-1 bg-gray-50 text-gray-600"
                value="Auto-generated on save" readOnly />
            </div>
            <div>
              <label className="font-semibold text-sm">Responsibility Center Code *</label>
              <input className="w-full border rounded-md p-2 mt-1" required
                value={prData.responsibilityCenterCode}
                onChange={e => setPrData(p => ({ ...p, responsibilityCenterCode: e.target.value }))}
                placeholder="e.g. 0801-00" />
            </div>
          </div>
        </div>

        {/* Items table */}
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[#EEF8FB]">
              <tr>
                <th className="p-3 text-left whitespace-nowrap">Item No.</th>
                <th className="p-3 text-left whitespace-nowrap">Stock No.</th>
                <th className="p-3 text-left whitespace-nowrap">Unit</th>
                <th className="p-3 text-left whitespace-nowrap">Item Description</th>
                <th className="p-3 text-left whitespace-nowrap">Item Inclusions</th>
                <th className="p-3 text-left whitespace-nowrap">Quantity</th>
                <th className="p-3 text-left whitespace-nowrap">Unit Cost</th>
                <th className="p-3 text-left whitespace-nowrap">Total Cost</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {prData.items.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-6 text-center text-gray-400 italic text-sm">
                    No items added yet. Click the + button to add an item.
                  </td>
                </tr>
              )}
              {prData.items.map((item, idx) => {
                const rowTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
                return (
                  <tr key={idx} className="border-t">
                    <td className="p-2 w-12">
                      <input className="w-12 border rounded px-1 py-1 text-center text-sm bg-gray-50" value={item.item_no} readOnly />
                    </td>
                    <td className="p-2">
                      <input className="w-24 border rounded px-2 py-1 text-sm" value={item.stock_no}
                        onChange={e => updateItem(idx, 'stock_no', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <input className="w-20 border rounded px-2 py-1 text-sm" required value={item.unit}
                        onChange={e => updateItem(idx, 'unit', e.target.value)} placeholder="pc" />
                    </td>
                    <td className="p-2">
                      <input className="w-44 border rounded px-2 py-1 text-sm" required value={item.item_description}
                        onChange={e => updateItem(idx, 'item_description', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <input className="w-36 border rounded px-2 py-1 text-sm" value={item.item_inclusions}
                        onChange={e => updateItem(idx, 'item_inclusions', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <input type="number" min="0.01" step="any" className="w-20 border rounded px-2 py-1 text-sm" required
                        value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                    </td>
                    <td className="p-2">
                      <input type="number" min="0" step="any" className="w-28 border rounded px-2 py-1 text-sm" required
                        value={item.unit_cost} onChange={e => updateItem(idx, 'unit_cost', e.target.value)} />
                    </td>
                    <td className="p-2 whitespace-nowrap text-sm text-gray-700">
                      Php {formatPeso(rowTotal)}
                    </td>
                    <td className="p-2 flex gap-2 items-center pt-3">
                      <button type="button" onClick={() => removeItem(idx)} title="Remove item">
                        <X className="text-red-500 hover:text-red-700 cursor-pointer" size={18} />
                      </button>
                      {idx === prData.items.length - 1 && (
                        <button type="button" onClick={addItem} title="Add item">
                          <Plus className="text-[#1C7293] hover:text-[#155a7a] cursor-pointer" size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {prData.items.length === 0 && (
            <div className="flex justify-start p-3 border-t">
              <button type="button" onClick={addItem}
                className="flex items-center gap-1 text-sm text-[#1C7293] hover:text-[#155a7a] font-medium">
                <Plus size={16} /> Add First Item
              </button>
            </div>
          )}

          <div className="flex justify-end p-4 font-semibold border-t">
            TOTAL: Php {formatPeso(totalCost)}
          </div>
        </div>

        {/* Purpose */}
        <div>
          <label className="font-semibold text-sm">Purpose *</label>
          <textarea className="w-full border rounded-md p-3 mt-2" rows={4} required
            value={prData.purpose} onChange={e => setPrData(p => ({ ...p, purpose: e.target.value }))}
            placeholder="State the purpose of this purchase request" />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-20">
          <div>
            <h3 className="font-semibold mb-4">Requested by:</h3>
            <div className="mb-3">
              <label className="text-sm">Signature</label>
              <input className="w-full border rounded-md p-2 mt-1"
                value={prData.requestedSignature}
                onChange={e => setPrData(p => ({ ...p, requestedSignature: e.target.value }))} />
            </div>
            <div className="mb-3">
              <label className="text-sm">Printed Name</label>
              <input className="w-full border rounded-md p-2 mt-1"
                value={prData.requestedName}
                onChange={e => setPrData(p => ({ ...p, requestedName: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm">Designation</label>
              <input className="w-full border rounded-md p-2 mt-1"
                value={prData.requestedDesignation}
                onChange={e => setPrData(p => ({ ...p, requestedDesignation: e.target.value }))} />
            </div>
          </div>
          <div>
            <h3 className="font-semibold mb-4">Approved by:</h3>
            <div className="border-b w-64 mb-2"></div>
            <p className="font-semibold">ENGR. REY M. PARNACIO</p>
            <p className="text-sm text-gray-600">OIC, Regional Director</p>
          </div>
        </div>

        {/* Feedback */}
        {submitError && (
          <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
            ⚠️ {submitError}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onBack}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
            ← Back
          </button>
          <button type="submit" disabled={submitting}
            className="px-8 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? 'Submitting…' : 'Create Procurement'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN — orchestrates both steps
// ─────────────────────────────────────────────────────────────────────────────
export default function AddProcurement() {
  const navigate = useNavigate();

  // Step 1 state
  const [step, setStep] = useState(1);
  const [procData, setProcData] = useState({
    title: '',
    modeId: '',
    projectId: '',
    description: '',
    attachedFiles: [],
  });

  // Step 2 state
  const [prData, setPrData] = useState({
    office: '',
    fundCluster: '',
    responsibilityCenterCode: '',
    purpose: '',
    requestedSignature: '',
    requestedName: '',
    requestedDesignation: '',
    items: [],
  });

  // Reference data
  const [projects, setProjects] = useState([]);
  const [modes, setModes] = useState([]);
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState(null);

  // Submission
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    setRefLoading(true);
    Promise.all([api.getProjects(), api.getProcurementModes()])
      .then(([p, m]) => { setProjects(p); setModes(m); })
      .catch(err => setRefError(err.message || 'Failed to load form data.'))
      .finally(() => setRefLoading(false));
  }, []);

  const handleSubmit = async () => {
    setSubmitError('');
    setSubmitting(true);

    try {
      // Step 1: Create procurement + purchase request together
      const res = await fetch('/procurements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: procData.title,
          procurement_mode_id: parseInt(procData.modeId),
          project_id: parseInt(procData.projectId),
          description: procData.description || null,
          purchase_request: {
            office: prData.office,
            date_created: new Date().toISOString().split('T')[0],
            responsibility_center_code: prData.responsibilityCenterCode,
            purpose: prData.purpose,
            items: prData.items.map(item => ({
              item_no: item.item_no,
              stock_no: item.stock_no || null,
              unit: item.unit,
              item_description: item.item_description,
              item_inclusions: item.item_inclusions || null,
              quantity: parseFloat(item.quantity),
              unit_cost: parseFloat(item.unit_cost),
            })),
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

      // Step 2: Upload attachments
      for (const { file, fileType: ft } of procData.attachedFiles) {
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

      navigate('/procurement');
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (refError) {
    return (
      <div className="mb-4 px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
        ⚠️ {refError} — Please refresh the page or check your connection.
      </div>
    );
  }

  return (
    <div>
      {step === 1 && (
        <StepProcurement
          data={procData}
          setData={setProcData}
          modes={modes}
          projects={projects}
          refLoading={refLoading}
          onNext={() => setStep(2)}
          onCancel={() => navigate('/procurement')}
        />
      )}
      {step === 2 && (
        <StepPurchaseRequest
          procData={procData}
          prData={prData}
          setPrData={setPrData}
          submitting={submitting}
          submitError={submitError}
          onBack={() => { setSubmitError(''); setStep(1); }}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}