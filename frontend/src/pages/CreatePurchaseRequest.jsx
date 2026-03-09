import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Plus, X } from "lucide-react";
import SuccessModal from "../modal/SuccessModal";

// ── helpers ───────────────────────────────────────────────────────────────────
const FILE_TYPE_LABELS = {
    sub_allotment_release_order: "Sub Allotment Release Order",
    annual_procurement_plan: "Annual Procurement Plan",
    project_procurement_management_plan: "Project Procurement Management Plan",
    market_study: "Market Study / Request for Information",
    technical_specification: "Technical Specification",
};

const resolveFileType = (pdf) => {
    const checklist = pdf.checklist;
    if (!checklist) return pdf.file_name || "Document";
    const typeVal = typeof checklist === "object"
        ? checklist.type || checklist.file_type || ""
        : String(checklist);
    return FILE_TYPE_LABELS[typeVal] || typeVal || pdf.file_name || "Document";
};

const formatPeso = (n) =>
    Number(n).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const emptyItem = (idx = 0) => ({
    item_no: String(idx + 1),
    stock_no: "", unit: "",
    item_description: "", item_inclusions: "",
    quantity: "", unit_cost: "",
});

// ─────────────────────────────────────────────────────────────────────────────
function CreatePurchaseRequest() {
    const location = useLocation();
    const navigate = useNavigate();
    // pre = data passed via navigate(..., { state: {...} }) from ProcurementDetails
    const pre = location.state || {};

    const [showSuccess, setShowSuccess] = useState(false);

    // ── Procurement fields ────────────────────────────────────────────────────
    const [title, setTitle] = useState(pre.title || "");
    const [modeName] = useState(pre.modeName || "Small Value Procurement");
    const [projectName, setProjectName] = useState(pre.projectName || "");
    const [description, setDescription] = useState(pre.description || "");
    const pdfs = pre.pdfs || [];

    // ── Purchase request fields ───────────────────────────────────────────────
    const [office, setOffice] = useState(pre.office || "");
    const [fundCluster, setFundCluster] = useState(pre.fund_cluster || "");
    const [prNumber] = useState(pre.purchase_request_number || "PR-2023-03-0001");
    const [respCode, setRespCode] = useState(pre.responsibility_center_code || "");
    const [dateCreated, setDateCreated] = useState(
        pre.date_created
            ? new Date(pre.date_created).toISOString().split("T")[0]
            : ""
    );
    const [purpose, setPurpose] = useState(pre.purpose || "");

    // ── Items ─────────────────────────────────────────────────────────────────
    const [items, setItems] = useState(
        pre.items && pre.items.length > 0
            ? pre.items.map((item, idx) => ({ ...emptyItem(idx), ...item }))
            : [emptyItem(0)]
    );

    // ── Signature fields — ALWAYS BLANK even when duplicating ─────────────────
    const [sigPrintedName, setSigPrintedName] = useState("");
    const [sigDesignation, setSigDesignation] = useState("");

    // ── Item helpers ──────────────────────────────────────────────────────────
    const updateItem = (idx, field, value) =>
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

    const addItemAfter = (idx) =>
        setItems((prev) => {
            const next = [...prev];
            next.splice(idx + 1, 0, emptyItem(idx + 1));
            return next.map((item, i) => ({ ...item, item_no: String(i + 1) }));
        });

    const removeItem = (idx) =>
        setItems((prev) => {
            const next = prev.filter((_, i) => i !== idx);
            return next.length === 0
                ? [emptyItem(0)]
                : next.map((item, i) => ({ ...item, item_no: String(i + 1) }));
        });

    const totalCost = items.reduce(
        (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0), 0
    );

    const handleCreate = () => setShowSuccess(true);

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex-1 p-10">

                {/* ── Header ── */}
                <div className="flex items-center gap-3 mb-1">
                    <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-900">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 8 14">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth="2.2" d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
                        </svg>
                    </button>
                    <h1 className="text-2xl font-bold">
                        {pre.isDuplicate ? "Duplicate Purchase Request" : "New Purchase Request"}
                    </h1>
                </div>
                <p className="text-gray-600 mb-8 ml-8">Procurement Details</p>

                {/* ── Two-column form ── */}
                <div className="grid grid-cols-2 gap-10">

                    {/* Left column */}
                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="font-semibold">Procurement Title</label>
                            <input className="w-full border rounded-md p-2 mt-1"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)} />
                        </div>
                        <div>
                            <label className="font-semibold">Mode of Procurement</label>
                            <input className="w-full border rounded-md p-2 mt-1 bg-gray-50"
                                value={modeName} readOnly />
                        </div>
                        <div>
                            <label className="font-semibold">Project</label>
                            <input className="w-full border rounded-md p-2 mt-1"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)} />
                        </div>
                        <div>
                            <label className="font-semibold">Entity Name</label>
                            <input className="w-full border rounded-md p-2 mt-1 bg-gray-50"
                                value="Department of Information and Communications Technology"
                                readOnly />
                        </div>
                        <div>
                            <label className="font-semibold">Office / Section</label>
                            <input className="w-full border rounded-md p-2 mt-1"
                                value={office}
                                onChange={(e) => setOffice(e.target.value)} />
                        </div>
                        <div>
                            <label className="font-semibold">Date</label>
                            <input type="date" className="w-full border rounded-md p-2 mt-1"
                                value={dateCreated}
                                onChange={(e) => setDateCreated(e.target.value)} />
                        </div>
                        <div>
                            <label className="font-semibold">Description</label>
                            <textarea className="w-full border rounded-md p-2 mt-1" rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)} />
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="font-semibold">Files Uploaded</label>
                            {pdfs.length === 0 ? (
                                <ul className="mt-2 text-sm text-gray-700 space-y-2">
                                    <li>📄 Sub Allotment Release Order</li>
                                    <li>📄 Annual Procurement Plan</li>
                                    <li>📄 Project Procurement Management Plan</li>
                                    <li>📄 Market Study</li>
                                </ul>
                            ) : (
                                <ul className="mt-2 space-y-2">
                                    {pdfs.map((pdf, idx) => (
                                        <li key={idx} className="flex items-center gap-2 text-sm text-gray-700">
                                            <div className="w-8 h-8 bg-red-50 border border-red-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-red-500" viewBox="0 0 24 24" fill="none"
                                                    stroke="currentColor" strokeWidth="1.5">
                                                    <path strokeLinecap="round" strokeLinejoin="round"
                                                        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                                </svg>
                                            </div>
                                            {resolveFileType(pdf)}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div>
                            <label className="font-semibold">Fund Cluster</label>
                            <input className="w-full border rounded-md p-2 mt-1"
                                value={fundCluster}
                                onChange={(e) => setFundCluster(e.target.value)} />
                        </div>
                        <div>
                            <label className="font-semibold">Purchase Request Number</label>
                            <input className="w-full border rounded-md p-2 mt-1 bg-gray-50"
                                value={prNumber} readOnly />
                        </div>
                        <div>
                            <label className="font-semibold">Responsibility Center Code</label>
                            <input className="w-full border rounded-md p-2 mt-1"
                                value={respCode}
                                onChange={(e) => setRespCode(e.target.value)} />
                        </div>
                    </div>
                </div>

                {/* ── Items table ── */}
                <div className="mt-10 bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#EEF8FB]">
                            <tr>
                                {["Item No.", "Stock No.", "Unit", "Item Description", "Item Inclusions",
                                    "Quantity", "Unit Cost", "Total Cost", ""].map((h) => (
                                        <th key={h} className="p-3 text-left text-xs font-semibold text-[#1C7293]">{h}</th>
                                    ))}
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => {
                                const rowTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
                                return (
                                    <tr key={idx} className="border-t">
                                        <td className="p-2 w-14">
                                            <input className="w-full border rounded p-1 text-center text-sm"
                                                value={item.item_no}
                                                onChange={(e) => updateItem(idx, "item_no", e.target.value)} />
                                        </td>
                                        <td className="p-2 w-24">
                                            <input className="w-full border rounded p-1 text-sm"
                                                value={item.stock_no}
                                                onChange={(e) => updateItem(idx, "stock_no", e.target.value)} />
                                        </td>
                                        <td className="p-2 w-20">
                                            <input className="w-full border rounded p-1 text-sm"
                                                value={item.unit}
                                                onChange={(e) => updateItem(idx, "unit", e.target.value)} />
                                        </td>
                                        <td className="p-2">
                                            <textarea className="w-full border rounded p-1 text-sm resize-none" rows={2}
                                                value={item.item_description}
                                                onChange={(e) => updateItem(idx, "item_description", e.target.value)} />
                                        </td>
                                        <td className="p-2">
                                            <textarea className="w-full border rounded p-1 text-sm resize-none" rows={2}
                                                value={item.item_inclusions}
                                                onChange={(e) => updateItem(idx, "item_inclusions", e.target.value)} />
                                        </td>
                                        <td className="p-2 w-20">
                                            <input type="number" min="0" className="w-full border rounded p-1 text-sm"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(idx, "quantity", e.target.value)} />
                                        </td>
                                        <td className="p-2 w-24">
                                            <input type="number" min="0" className="w-full border rounded p-1 text-sm"
                                                value={item.unit_cost}
                                                onChange={(e) => updateItem(idx, "unit_cost", e.target.value)} />
                                        </td>
                                        <td className="p-2 w-28 text-gray-700 text-sm whitespace-nowrap">
                                            {formatPeso(rowTotal)}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex gap-2 items-center">
                                                <X className="text-red-500 cursor-pointer" size={18}
                                                    onClick={() => removeItem(idx)} />
                                                <Plus className="text-[#1C7293] cursor-pointer" size={18}
                                                    onClick={() => addItemAfter(idx)} />
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="flex justify-end p-4 font-semibold text-sm border-t">
                        TOTAL &nbsp;&nbsp; Php {formatPeso(totalCost)}
                    </div>
                </div>

                {/* ── Purpose ── */}
                <div className="mt-8">
                    <label className="font-semibold">Purpose</label>
                    <textarea className="w-full border rounded-md p-3 mt-2" rows={4}
                        value={purpose}
                        onChange={(e) => setPurpose(e.target.value)} />
                </div>

                {/* ── Signatures ── */}
                <div className="grid grid-cols-2 gap-20 mt-10">
                    {/* Requested by — signature always blank even when duplicating */}
                    <div>
                        <h3 className="font-semibold mb-4">Requested by:</h3>
                        <div className="mb-3">
                            <label className="text-sm">Signature</label>
                            <input className="w-full border rounded-md p-2 mt-1 bg-gray-50 cursor-not-allowed"
                                disabled placeholder="—" />
                        </div>
                        <div className="mb-3">
                            <label className="text-sm">Printed Name</label>
                            <select className="w-full border rounded-md p-2 mt-1"
                                value={sigPrintedName}
                                onChange={(e) => setSigPrintedName(e.target.value)}>
                                <option value="">Select name</option>
                            </select>
                        </div>
                        <div>
                            <label className="text-sm">Designation</label>
                            <select className="w-full border rounded-md p-2 mt-1"
                                value={sigDesignation}
                                onChange={(e) => setSigDesignation(e.target.value)}>
                                <option value="">Select designation</option>
                            </select>
                        </div>
                    </div>

                    {/* Approved by — hardcoded */}
                    <div>
                        <h3 className="font-semibold mb-4">Approved by:</h3>
                        <div className="border-b w-64 mb-2" />
                        <p className="font-semibold">ENGR. REY M. PARNACIO</p>
                        <p className="text-sm text-gray-600">OIC, Regional Director</p>
                    </div>
                </div>

                {/* ── Funds Available ── */}
                <div className="mt-10">
                    <h3 className="font-semibold mb-3">Funds Available</h3>
                    <div className="border-b w-64 mb-2" />
                    <p className="font-semibold">Shiena Ann M. Bravo</p>
                    <p className="text-sm text-gray-600">Budget Officer</p>
                </div>

                {/* ── Create button ── */}
                <div className="flex justify-end mt-10">
                    <button onClick={handleCreate}
                        className="bg-[#1C7293] text-white px-6 py-2 rounded-md hover:bg-teal-700 font-semibold">
                        Create
                    </button>
                </div>

            </div>

            <SuccessModal show={showSuccess} onClose={() => navigate("/procurement")} />
        </div>
    );
}

export default CreatePurchaseRequest; 