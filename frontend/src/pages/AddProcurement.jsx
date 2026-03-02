import { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';

export default function AddProcurement() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileType, setFileType] = useState('');
  const fileInputRef = useRef(null);

  // Reference data from backend
  const [projects, setProjects] = useState([]);
  const [modes, setModes] = useState([]);
  const [refLoading, setRefLoading] = useState(true);
  const [refError, setRefError] = useState(null);

  useEffect(() => {
    setRefLoading(true);
    Promise.all([api.getProjects(), api.getProcurementModes()])
      .then(([projectsData, modesData]) => {
        setProjects(projectsData);
        setModes(modesData);
      })
      .catch((err) => {
        setRefError(err.message || 'Failed to load form data.');
      })
      .finally(() => setRefLoading(false));
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedFile(null);
    setFileType('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleAttach = () => {
    if (!selectedFile || !fileType) {
      alert('Please select both a file type and a file.');
      return;
    }

    console.log('Attaching file:', {
      type: fileType,
      fileName: selectedFile.name,
      sizeKB: (selectedFile.size / 1024).toFixed(1),
      lastModified: new Date(selectedFile.lastModified).toLocaleString(),
    });

    closeModal();
  };

  return (
    <div>
      <a href="/procurement" className="inline-flex items-center mb-6 text-gray-700 hover:text-[#03445D]">
        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 8 14">
          <path stroke="black" strokeLinecap="round" strokeLinejoin="round" stroke-width="2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
        </svg>
      </a>

      <div className="">
        <h1 className="text-2xl font-bold text-black mb-8">New Procurement</h1>

        <div className="space-y-8">
          {refError && (
            <div className="px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
              ⚠️ {refError} — Please refresh the page or check your connection.
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              <label htmlFor="procurement_title" className="block mb-1.5 text-sm font-medium text-[#03445D]">
                Procurement Title
              </label>
              <input
                type="text"
                id="procurement_title"
                name="procurement_title"
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none"
                required
              />
            </div>

            <div className="md:col-span-4">
              <label htmlFor="mode_of_procurement" className="block mb-1.5 text-sm font-medium text-[#03445D]">
                Mode of Procurement
              </label>
              <select
                id="mode_of_procurement"
                name="procurement_mode_id"
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none disabled:opacity-60"
                disabled={refLoading}
                required
              >
                <option value="">Select mode...</option>
                {modes.map((mode) => (
                  <option key={mode.id} value={mode.id}>
                    {mode.name}{mode.code ? ` (${mode.code})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="project_id" className="block mb-1.5 text-sm font-medium text-[#03445D]">
                Project
              </label>
              <select
                id="project_id"
                name="project_id"
                className="w-full px-4 py-2.5 bg-gray-50 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-black outline-none disabled:opacity-60"
                disabled={refLoading}
                required
              >
                <option value="">Select project...</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1">
              <label className="block mb-1.5 text-sm font-medium text-[#03445D]">
                Date
              </label>
              <div className="py-2.5 text-sm text-gray-700">03-12-2026</div>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block mb-1.5 text-sm font-medium text-[#03445D]">
              Detailed Description
            </label>
            <textarea
              id="description"
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border border-black rounded-lg text-sm focus:ring-2 focus:ring-black focus:border-[#1C7293] outline-none resize-y min-h-[120px]"
              placeholder="Detailed description of the document"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="md:col-span-8">
              <div className="bg-[#D3EAED]/60 rounded-lg p-2 border border-[#D3EAED]">
                <p className="text-sm font-medium text-black mb-2">File Name</p>
              </div>
              <div className="min-h-[80px] flex items-center justify-center text-sm text-gray-500 italic">
                No files attached yet
              </div>
            </div>

            <div className="md:col-span-4">
              <p className="text-sm font-medium text-black mb-3">Files to be uploaded</p>

              <div className="space-y-3 mb-6">
                {[
                  { value: 'sub_allotment_release_order', label: 'Sub Allotment Release Order', required: true },
                  { value: 'annual_procurement_plan', label: 'Annual Procurement Plan', required: true },
                  { value: 'project_procurement_management_plan', label: 'Project Procurement Management Plan', required: true },
                  { value: 'market_study', label: 'Market Study / Request for Information', required: true },
                  { value: 'technical_specification', label: 'Technical Specification', required: false },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="files"
                      value={item.value}
                      className="h-4 w-4 text-[#1C7293] border-gray-300 rounded focus:ring-[#1C7293]"
                      required={item.required}
                    />
                    <span className="text-sm text-gray-800">
                      {item.label} {item.required && <span className="text-red-600">*</span>}
                    </span>
                  </label>
                ))}
              </div>

              <button
                type="button"
                onClick={openModal}
                className="w-80 px-6 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white font-medium rounded-lg transition-colors shadow-sm"
              >
                + Add Files
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full">
            {/* Close × */}
            <button
              className="absolute top-4 right-5 text-gray-500 hover:text-gray-800 text-2xl font-bold"
              onClick={closeModal}
            >
              ×
            </button>

            <div className="p-6 pt-10">
              <h2 className="text-lg font-semibold text-[#03445D] text-center mb-6">
                Attach Supporting File
              </h2>

              {/* Upload zone */}
              <label
                htmlFor="file-upload"
                className="cursor-pointer block border-2 border-dashed border-gray-400 rounded-lg p-10 text-center hover:border-[#1C7293] hover:bg-gray-50/50 transition-all mb-6"
              >
                <div className="mx-auto w-14 h-14 mb-4 text-gray-500">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" />
                    <path d="M12 12v9" />
                    <path d="m16 16-4-4-4 4" />
                  </svg>
                </div>
                <div className="text-gray-600 text-sm">
                  Click to upload file
                  <br />
                  <span className="text-xs text-gray-400">or drag and drop</span>
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
                <div className="text-center text-sm text-gray-700 mb-6">
                  <strong className="block truncate">{selectedFile.name}</strong>
                  <span className="text-gray-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}

              {/* Type dropdown */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-[#03445D] text-center mb-2">
                  Type of File
                </label>
                <select
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                  value={fileType}
                  onChange={(e) => setFileType(e.target.value)}
                >
                  <option value="" disabled>Select type...</option>
                  <option value="sub_allotment_release_order">Sub Allotment Release Order (SARO)</option>
                  <option value="annual_procurement_plan">Annual Procurement Plan (APP)</option>
                  <option value="project_procurement_management_plan">Project Procurement Management Plan (PPMP)</option>
                  <option value="market_study">Market Study / Request for Information</option>
                  <option value="technical_specification">Technical Specification</option>
                </select>
              </div>

              {/* Buttons */}
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
                  disabled={!selectedFile || !fileType}
                  className="px-8 py-2.5 bg-[#1C7293] hover:bg-[#155a7a] text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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