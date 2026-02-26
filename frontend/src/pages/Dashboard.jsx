<<<<<<< HEAD
import '../css/Dashboard.css'

export default function Dashboard() {
  const stats = [
    { number: 30, label: 'On-going', sublabel: 'Procurements', color: 'text-yellow-500' },
    { number: 40, label: 'Approved', sublabel: 'Procurements', color: 'text-teal-600' },
    { number: 10, label: 'Disapproved', sublabel: 'Procurements', color: 'text-red-400' }
  ];

  const procurements = [
    { id: 'RI-2023-02-004', doc: 'Document 1', type: 'Small Value Procurement', status: 'On-going', date: 'March 12, 2023' },
    { id: 'RI-2023-01-005', doc: 'Document 2', type: 'Small Value Procurement', status: 'Disapproved', date: 'March 17, 2023' },
    { id: 'RI-2023-02-006', doc: 'Document 3', type: 'Small Value Procurement', status: 'On-going', date: 'March 21, 2023' },
    { id: 'RI-2023-02-007', doc: 'Document 4', type: 'Small Value Procurement', status: 'On-going', date: 'March 26, 2023' },
    { id: 'RI-2023-02-004', doc: 'Document 1', type: 'Small Value Procurement', status: 'Approved', date: 'March 27, 2023' },
    { id: 'RI-2023-01-005', doc: 'Document 2', type: 'Small Value Procurement', status: 'On-going', date: 'March 29, 2023' }
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'On-going':
        return 'bg-yellow-400 text-black';
      case 'Approved':
        return 'bg-teal-600 text-white';
      case 'Disapproved':
        return 'bg-red-500 text-white';
      default:
        return '';
    }
  };

=======
import { useEffect, useState } from "react";
import "../css/Dashboard.css";

export default function Dashboard() {
  const [procurements, setProcurements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({
    ongoing: 0,
    approved: 0,
    disapproved: 0,
  });

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

        if (!isMounted) return;

        setProcurements(list);

        const totals = { ongoing: 0, approved: 0, disapproved: 0 };

        list.forEach((item) => {
          const status = (item.status || "").toLowerCase();

          if (["pending", "ongoing", "on-going"].includes(status)) {
            totals.ongoing += 1;
          } else if (["approved", "accepted"].includes(status)) {
            totals.approved += 1;
          } else if (["rejected", "disapproved"].includes(status)) {
            totals.disapproved += 1;
          }
        });

        setStats(totals);
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
    const value = (status || "").toLowerCase();
    switch (value) {
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

  const statCards = [
    { number: stats.ongoing, label: "On-going", sublabel: "Procurements", color: "text-yellow-500" },
    { number: stats.approved, label: "Approved", sublabel: "Procurements", color: "text-teal-600" },
    { number: stats.disapproved, label: "Disapproved", sublabel: "Procurements", color: "text-red-400" },
  ];

>>>>>>> fe and be
  return (
    <div>
        {/* Dashboard Content */}
        <div>
           <h1 className='font-bold text-2xl mb-4'>Here's an overview of today's report</h1>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
<<<<<<< HEAD
            {stats.map((stat, index) => (
=======
            {statCards.map((stat, index) => (
>>>>>>> fe and be
              <div key={index} className="bg-white border-2 border-black-300 rounded-2xl p-8 text-center">
                <div className={`text-6xl font-bold ${stat.color} mb-2`}>{stat.number}</div>
                <div className="text-lg font-semibold">{stat.label}</div>
                <div className="text-lg font-semibold">{stat.sublabel}</div>
              </div>
            ))}
          </div>

          {/* Procurement Table */}
          <div className="rounded-lg">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="text-xl font-bold">Procurement</h3>
              <button className="text-sm text-black-600 flex items-center gap-1">
                View All <span>›</span>
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
<<<<<<< HEAD
                  {procurements.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="px-6 py-4 text-red-500 font-semibold">{item.id}</td>
                      <td className="px-6 py-4 font-medium">{item.doc}</td>
                      <td className="px-6 py-4 text-black-700">{item.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-4 py-1 rounded-full text-sm font-medium ${getStatusStyle(item.status)}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-black-700">{item.date}</td>
=======
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

                  {!loading && !error && procurements.map((item) => (
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
>>>>>>> fe and be
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
    </div>
  );
}