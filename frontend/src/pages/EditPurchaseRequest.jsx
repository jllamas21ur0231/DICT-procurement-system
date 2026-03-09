import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";

const formatPeso = (n) =>
    Number(n || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const EMPTY_ITEM = {
    id: null, // null = new (not yet saved)
    item_no: "",
    stock_no: "",
    unit: "",
    item_description: "",
    item_inclusions: "",
    quantity: "",
    unit_cost: "",
};

export default function EditPurchaseRequest() {
    const { id: procurementId, prId } = useParams();
    const navigate = useNavigate();

    // ── PR fields ─────────────────────────────────────────────────────────────
    const [office, setOffice] = useState("");
    const [fundCluster, setFundCluster] = useState("");
    const [responsibilityCenterCode, setResponsibilityCenterCode] = useState("");
    const [purpose, setPurpose] = useState("");
    const [dateCreated, setDateCreated] = useState("");
    const [prNumber, setPrNumber] = useState("");

    // ── Items ─────────────────────────────────────────────────────────────────
    const [items, setItems] = useState([]);
    const [deletedItemIds, setDeletedItemIds] = useState([]); // existing item IDs to delete

    // ── Requested by ─────────────────────────────────────────────────────────
    const [signature, setSignature] = useState("");
    const [printedName, setPrintedName] = useState("");
    const [designation, setDesignation] = useState("");

    // ── State ─────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    // ── Load PR ───────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!prId) return;
        setLoading(true);
        fetch(`/purchase-requests/${prId}`, {
            headers: { Accept: "application/json" },
            credentials: "include",
        })
            .then((r) => { if (!r.ok) throw new Error("Failed to load purchase request."); return r.json(); })
            .then((data) => {
                setOffice(data.office || "");
                setFundCluster(data.fund_cluster || "");
                setResponsibilityCenterCode(data.responsibility_center_code || "");
                setPurpose(data.purpose || "");
                setPrNumber(data.purchase_request_number || "");
                setDateCreated(
                    data.date_created
                        ? new Date(data.date_created).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
                        : ""
                );
                // Map existing items — keep their server id for update/delete
                setItems(
                    (data.items || []).map((item) => ({
                        id: item.id,
                        item_no: String(item.item_no || ""),
                        stock_no: item.stock_no || "",
                        unit: item.unit || "",
                        item_description: item.item_description || "",
                        item_inclusions: item.item_inclusions || "",
                        quantity: String(item.quantity || ""),
                        unit_cost: String(item.unit_cost || ""),
                    }))
                );
            })
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [prId]);

    // ── Item helpers ──────────────────────────────────────────────────────────
    const addItem = () =>
        setItems((prev) => [
            ...prev,
            { ...EMPTY_ITEM, item_no: String(prev.length + 1) },
        ]);

    const updateItem = (idx, field, value) =>
        setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

    const removeItem = (idx) => {
        const item = items[idx];
        if (item.id) {
            // Mark existing server item for deletion
            setDeletedItemIds((prev) => [...prev, item.id]);
        }
        setItems((prev) =>
            prev.filter((_, i) => i !== idx).map((it, i) => ({ ...it, item_no: String(i + 1) }))
        );
    };

    const totalCost = items.reduce(
        (sum, item) => sum + (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0),
        0
    );

    // ── Save ──────────────────────────────────────────────────────────────────
    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError("");

        try {
            // 1. Update PR fields
            const prRes = await fetch(`/purchase-requests/${prId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    office,
                    responsibility_center_code: responsibilityCenterCode,
                    purpose,
                }),
            });
            if (!prRes.ok) {
                const d = await prRes.json().catch(() => ({}));
                const firstErr = d?.errors ? Object.values(d.errors)[0]?.[0] : null;
                throw new Error(firstErr || d.message || "Failed to update purchase request.");
            }

            // 2. Delete removed items
            for (const itemId of deletedItemIds) {
                await fetch(`/purchase-requests/${prId}/items/${itemId}`, {
                    method: "DELETE",
                    headers: { Accept: "application/json" },
                    credentials: "include",
                });
            }

            // 3. Update existing items / create new ones
            for (const item of items) {
                const payload = {
                    item_no: item.item_no,
                    stock_no: item.stock_no || null,
                    unit: item.unit,
                    item_description: item.item_description,
                    item_inclusions: item.item_inclusions || null,
                    quantity: parseFloat(item.quantity),
                    unit_cost: parseFloat(item.unit_cost),
                };

                if (item.id) {
                    // Update existing
                    await fetch(`/purchase-requests/${prId}/items/${item.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json", Accept: "application/json" },
                        credentials: "include",
                        body: JSON.stringify(payload),
                    });
                } else {
                    // Create new
                    await fetch(`/purchase-requests/${prId}/items`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Accept: "application/json" },
                        credentials: "include",
                        body: JSON.stringify(payload),
                    });
                }
            }

            navigate(`/procurement/${procurementId}`);
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-gray-500 text-sm animate-pulse">Loading purchase request…</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-6xl mx-auto px-6 py-8">

                {/* Back */}
                <button onClick={() => navigate(-1)}
                    className="flex items-center gap-1 text-gray-600 hover:text-[#03445D] mb-6 transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 8 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                            d="M7 1 1.3 6.326a.91.91 0 0 0 0 1.348L7 13" />
                    </svg>
                </button>

                <h1 className="text-2xl font-bold text-gray-900 mb-8">Edit Purchase Request</h1>

                {error && (
                    <div className="mb-6 px-4 py-3 bg-red-50 border border-red-300 rounded-lg text-sm text-red-700">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-8">

                    {/* ── Top meta row ── */}
                    <div className="grid grid-cols-2 gap-x-16 gap-y-6">
                        {/* Entity Name */}
                        <div>
                            <p className="text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">Entity Name</p>
                            <p className="text-sm text-gray-700">Department of Information and Communications Technology</p>
                        </div>

                        {/* Fund Cluster */}
                        <div>
                            <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Fund Cluster
                            </label>
                            <input
                                type="text"
                                value={fundCluster}
                                onChange={(e) => setFundCluster(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                            />
                        </div>

                        {/* Office / Section */}
                        <div>
                            <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Office / Section
                            </label>
                            <input
                                type="text"
                                value={office}
                                onChange={(e) => setOffice(e.target.value)}
                                required
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                            />
                        </div>

                        {/* Purchase Request Number */}
                        <div>
                            <p className="text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Purchase Request Number
                            </p>
                            <p className="text-sm text-gray-700 py-2">{prNumber || "Auto-generated"}</p>
                        </div>

                        {/* Date */}
                        <div>
                            <p className="text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">Date</p>
                            <p className="text-sm text-gray-700">{dateCreated}</p>
                        </div>

                        {/* Responsibility Center Code */}
                        <div>
                            <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                                Responsibility Center Code
                            </label>
                            <input
                                type="text"
                                value={responsibilityCenterCode}
                                onChange={(e) => setResponsibilityCenterCode(e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                            />
                        </div>
                    </div>

                    {/* ── Items Table ── */}
                    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-[#EEF8FB]">
                                    <tr>
                                        {["Item No.", "Stock No.", "Unit", "Item Description", "Item Inclusions", "Quantity", "Unit Cost", "Total Cost", ""].map((h) => (
                                            <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-[#1C7293] whitespace-nowrap">{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {items.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-6 py-8 text-center text-sm text-gray-400 italic">
                                                No items yet. Click "+ Add new row" to add one.
                                            </td>
                                        </tr>
                                    )}
                                    {items.map((item, idx) => {
                                        const rowTotal = (parseFloat(item.quantity) || 0) * (parseFloat(item.unit_cost) || 0);
                                        return (
                                            <tr key={idx} className="hover:bg-gray-50">
                                                <td className="px-3 py-2 w-12">
                                                    <input
                                                        className="w-10 border border-gray-200 rounded px-1 py-1 text-center text-sm bg-gray-50"
                                                        value={item.item_no}
                                                        readOnly
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        className="w-24 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C7293]"
                                                        value={item.stock_no}
                                                        onChange={(e) => updateItem(idx, "stock_no", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        required
                                                        className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C7293]"
                                                        value={item.unit}
                                                        onChange={(e) => updateItem(idx, "unit", e.target.value)}
                                                        placeholder="pc"
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <textarea
                                                        required
                                                        rows={2}
                                                        className="w-48 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C7293] resize-none"
                                                        value={item.item_description}
                                                        onChange={(e) => updateItem(idx, "item_description", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <textarea
                                                        rows={2}
                                                        className="w-40 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C7293] resize-none"
                                                        value={item.item_inclusions}
                                                        onChange={(e) => updateItem(idx, "item_inclusions", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min="0.01"
                                                        step="any"
                                                        required
                                                        className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C7293]"
                                                        value={item.quantity}
                                                        onChange={(e) => updateItem(idx, "quantity", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="any"
                                                        required
                                                        className="w-28 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#1C7293]"
                                                        value={item.unit_cost}
                                                        onChange={(e) => updateItem(idx, "unit_cost", e.target.value)}
                                                    />
                                                </td>
                                                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-700">
                                                    {formatPeso(rowTotal)}
                                                </td>
                                                <td className="px-3 py-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeItem(idx)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Delete row"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Add row + Total */}
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                            <button
                                type="button"
                                onClick={addItem}
                                className="flex items-center gap-1 text-sm font-semibold text-white bg-[#1C7293] hover:bg-[#155a7a] px-3 py-1.5 rounded-md transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Add new row
                            </button>
                            <span className="text-sm font-bold text-gray-800">
                                TOTAL &nbsp; Php {formatPeso(totalCost)}
                            </span>
                        </div>
                    </div>

                    {/* ── Purpose ── */}
                    <div>
                        <label className="block text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-1">
                            Purpose
                        </label>
                        <textarea
                            value={purpose}
                            onChange={(e) => setPurpose(e.target.value)}
                            rows={4}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293] resize-y"
                        />
                    </div>

                    {/* ── Signatures ── */}
                    <div className="grid grid-cols-2 gap-16">
                        {/* Requested by */}
                        <div>
                            <p className="text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-4">Requested by:</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Signature</label>
                                    <input
                                        type="text"
                                        value={signature}
                                        onChange={(e) => setSignature(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Printed Name</label>
                                    <input
                                        type="text"
                                        value={printedName}
                                        onChange={(e) => setPrintedName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-700 mb-1">Designation</label>
                                    <input
                                        type="text"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1C7293]"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Approved by + Funds Available */}
                        <div className="space-y-10">
                            <div>
                                <p className="text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-4">Approved by:</p>
                                <div className="border-b border-gray-400 w-56 mb-2" />
                                <p className="font-semibold text-sm text-gray-800">ENGR. REY M. PARNACIO</p>
                                <p className="text-sm text-gray-500">OIC, Regional Director</p>
                            </div>

                            <div>
                                <p className="text-xs font-semibold text-[#1C7293] uppercase tracking-wide mb-4">Funds Available</p>
                                <div className="border-b border-gray-400 w-56 mb-2" />
                                <p className="font-semibold text-sm text-gray-800">Shiena Ann M. Bravo</p>
                                <p className="text-sm text-gray-500">Budget Officer</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Actions ── */}
                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(`/procurement/${procurementId}`)}
                            className="px-6 py-2.5 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg text-sm transition-colors"
                        >
                            Cancel
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
        </div>
    );
}