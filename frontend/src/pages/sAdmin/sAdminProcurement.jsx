import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SAdminProcurement() {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const fetchProcurements = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/sadmin/procurements", {
          headers: { Accept: "application/json" },
          credentials: "include",
        });

        if (!response.ok) throw new Error("Failed to load procurements");

        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

        if (isMounted) setProcurements(list);
      } catch (err) {
        if (isMounted) setError(err.message || "Unable to load procurements");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProcurements();
    return () => { isMounted = false; };
  }, []);

  const getStatusStyle = (status) => {
    switch ((status || "").toLowerCase()) {
      case "pending":
      case "ongoing":
      case "on-going":
        return "bg-yellow-400 text-black";
      case "approved":
      case "accepted":
        return "bg-teal-600 text-white";
      case "rejected":
      case "disapproved":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-800";
    }
  };

  const formatStatus = (status) => {
    if (!status) return "";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return timestamp;
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  };

  return (
    <div>
      <div className="rounded-lg">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-xl font-bold">Procurement</h3>
          <button
            onClick={() => navigate("/sadmin/add-procurement")}
            className="px-5 py-2 rounded-lg bg-[#134C62] text-white text-sm font-semibold hover:bg-[#0e3a4d] transition-colors"
          >
            + Create
          </button>
        </div>

        <div className="overflow-x-auto bg-white shadow-md">
          <table className="w-full">
            <thead className="bg-[#EAF4F8] text-gray-700 text-sm text-left border-b">
              <tr>
                <th className="px-6 py-4 font-semibold">Proc No.</th>
                <th className="px-6 py-4 font-semibold">Procurement Title</th>
                <th className="px-6 py-4 font-semibold">Mode</th>
                <th className="px-6 py-4 font-semibold">Project</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                    Loading procurements...
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}

              {!loading && !error && procurements.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-6 text-center text-gray-500">
                    No procurements found.
                  </td>
                </tr>
              )}

              {!loading && !error && procurements.map((item) => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4 text-red-500 font-semibold">{item.procurement_no}</td>
                  <td className="px-6 py-4 font-medium">{item.title}</td>
                  <td className="px-6 py-4 text-gray-700">{item.mode_of_procurement}</td>
                  <td className="px-6 py-4 text-gray-700">{item.project}</td>
                  <td className="px-6 py-4">
                    <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(item.status)}`}>
                      {formatStatus(item.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-700">
                    {formatDate(item.updated_at || item.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}