import { Search, Bell, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

function PurchaseRequest() {

    const navigate = useNavigate();

    const handleCreate = () => {
       navigate("/create-purchase-request");

    };

    const data = [
        {
            id: "R1-2023-02-004",
            title: "Document 1",
            status: "On-going",
            updated: "March 12, 2023",
        },
        {
            id: "R1-2023-02-005",
            title: "Document 2",
            status: "Disapproved",
            updated: "March 17, 2023",
        },
        {
            id: "R1-2023-02-006",
            title: "Document 3",
            status: "On-going",
            updated: "March 21, 2023",
        },
        {
            id: "R1-2023-02-007",
            title: "Document 4",
            status: "On-going",
            updated: "March 26, 2023",
        },
        {
            id: "R1-2023-02-008",
            title: "Document 5",
            status: "Approved",
            updated: "March 27, 2023",
        },
    ];

    const statusStyle = (status) => {
        if (status === "On-going") return "bg-yellow-400 text-black";
        if (status === "Disapproved") return "bg-red-500 text-white";
        if (status === "Approved") return "bg-teal-600 text-white";
        return "";
    };

    return (
        <div className="min-h-screen bg-gray-100 p-10">

       
            
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold">Purchase Request</h1>

               
            </div>

          
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#EEF8FB] text-gray-700 text-sm">
                        <tr>
                            <th className="p-4">Proc No.</th>
                            <th className="p-4">Purpose</th>
                            <th className="p-4">Status</th>
                            <th className="p-4">Last Updated</th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={index}
                                className="border-t hover:bg-gray-50 transition"
                            >
                                <td className="p-4 text-[#FF5959] font-bold">
                                    {item.id}
                                </td>
                                <td className="p-4 font-bold">{item.title}</td>

                                <td className="p-4">
                                    <span
                                        className={`px-3 py-1 rounded-full text-sm font-bold ${statusStyle(
                                            item.status
                                        )}`}
                                    >
                                        {item.status}
                                    </span>
                                </td>

                                <td className="p-4 text-gray-600 font-bold">
                                    {item.updated}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

         
            <div className="flex justify-center mt-6 text-sm text-gray-600">
                <span className="cursor-pointer px-2">&lt;</span>
                <span className="px-2">Page 1 of 3</span>
                <span className="cursor-pointer px-2">&gt;</span>
            </div>
        </div>
    );
}

export default PurchaseRequest;
