import { useEffect, useState } from "react";

export default function Procurement() {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProcurements = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch("/procurements", {
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load procurements");
        }

        const data = await response.json();
        const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];

        if (isMounted) {
          setProcurements(list);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Unable to load procurements");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProcurements();

    return () => {
      isMounted = false;
    };
  }, []);

  const getStatusStyle = (status) => {
    switch (status) {
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
    const s = String(status);
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const d = new Date(timestamp);
    if (Number.isNaN(d.getTime())) return timestamp;
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <div>
          <div className="rounded-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-bold">Procurement</h3>
              <a href="/add-procurement" className="ml-210 button rounded bg-[#1C7293] p-2 pl-5 pr-5 text-white">Create</a>
              <button className="text-sm text-black-600 flex items-center gap-1">
                View All <span>›</span>
              </button>
            </div>
            
            <div className="overflow-x-auto bg-white shadow-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#EEF8FB] text-gray-700 text-sm text-left border-b">
                  <tr>
                      <th className="pl-12">Proc No.</th>
                      <th className="p-4">Procurement Title</th>
                      <th className="pl-17">Mode</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Last Updated</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                        Loading procurements...
                      </td>
                    </tr>
                  )}

                  {!loading && error && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-red-600">
                        {error}
                      </td>
                    </tr>
                  )}

                  {!loading && !error && procurements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-6 text-center text-gray-500">
                        No procurements found.
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    !error &&
                    procurements.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4 text-red-500 font-semibold">
                          {item.procurement_no}
                        </td>
                        <td className="px-6 py-4 font-medium">{item.title}</td>
                        <td className="px-6 py-4 text-black-700">
                          {item.mode_of_procurement}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                              item.status
                            )}`}
                          >
                            {formatStatus(item.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-black-700">
                          {formatDate(item.updated_at || item.created_at)}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}