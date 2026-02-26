import { useState } from "react";
import { Bell, User, Plus, X } from "lucide-react";
import SuccessModal from "../modal/SuccessModal"; 

function CreatePurchaseRequest() {
    const [showSuccess, setShowSuccess] = useState(false);

    const handleCreate = () => {
       
        setShowSuccess(true);
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="flex-1 p-10">
                <h1 className="text-2xl font-bold mb-2">New Purchase Request</h1>
                <p className="text-gray-600 mb-8">Procurement Details</p>

               
                <div className="grid grid-cols-2 gap-10">

                   
                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="font-semibold">Procurement Title</label>
                            <input className="w-full border rounded-md p-2 mt-1" />
                        </div>

                        <div>
                            <label className="font-semibold">Mode of Procurement</label>
                            <input
                                className="w-full border rounded-md p-2 mt-1"
                                value="Small Value Procurement"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="font-semibold">Project</label>
                            <input className="w-full border rounded-md p-2 mt-1" />
                        </div>

                        <div>
                            <label className="font-semibold">Entity Name</label>
                            <input
                                className="w-full border rounded-md p-2 mt-1"
                                value="Department of Information and Communications Technology"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="font-semibold">Office / Section</label>
                            <select className="w-full border rounded-md p-2 mt-1">
                                <option>Select Office</option>
                            </select>
                        </div>

                        <div>
                            <label className="font-semibold">Date</label>
                            <input
                                type="text"
                                className="w-full border rounded-md p-2 mt-1"
                                value="March 10, 2023"
                                readOnly
                            />
                        </div>
                    </div>

                  
                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="font-semibold">Files Uploaded</label>
                            <ul className="mt-2 text-sm text-gray-700 space-y-2">
                                <li>📄 Sub Allotment Release Order</li>
                                <li>📄 Annual Procurement Plan</li>
                                <li>📄 Project Procurement Management Plan</li>
                                <li>📄 Market Study</li>
                            </ul>
                        </div>

                        <div>
                            <label className="font-semibold">Fund Cluster</label>
                            <input className="w-full border rounded-md p-2 mt-1" />
                        </div>

                        <div>
                            <label className="font-semibold">Purchase Request Number</label>
                            <input
                                className="w-full border rounded-md p-2 mt-1"
                                value="PR-2023-03-0001"
                                readOnly
                            />
                        </div>

                        <div>
                            <label className="font-semibold">Responsibility Center Code</label>
                            <input className="w-full border rounded-md p-2 mt-1" />
                        </div>
                    </div>
                </div>

              
                <div className="mt-10 bg-white rounded-xl shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-[#EEF8FB]">
                            <tr>
                                <th className="p-3 text-left">Item No.</th>
                                <th className="p-3 text-left">Stock No.</th>
                                <th className="p-3 text-left">Unit</th>
                                <th className="p-3 text-left">Item Description</th>
                                <th className="p-3 text-left">Item Inclusions</th>
                                <th className="p-3 text-left">Quantity</th>
                                <th className="p-3 text-left">Unit Cost</th>
                                <th className="p-3 text-left">Total Cost</th>
                                <th></th>
                            </tr>
                        </thead>

                        <tbody>
                            <tr className="border-t">
                                <td className="p-3">1</td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3"></td>
                                <td className="p-3 flex gap-2">
                                    <X className="text-red-500 cursor-pointer" size={18} />
                                    <Plus className="text-[#1C7293] cursor-pointer" size={18} />
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div className="flex justify-end p-4 font-semibold">
                        TOTAL: Php 0,000,000.00
                    </div>
                </div>

              
                <div className="mt-8">
                    <label className="font-semibold">Purpose</label>
                    <textarea
                        className="w-full border rounded-md p-3 mt-2"
                        rows={4}
                    ></textarea>
                </div>

               
                <div className="grid grid-cols-2 gap-20 mt-10">
                    <div>
                        <h3 className="font-semibold mb-4">Requested by:</h3>

                        <div className="mb-3">
                            <label>Signature</label>
                            <input className="w-full border rounded-md p-2 mt-1" />
                        </div>

                        <div className="mb-3">
                            <label>Printed Name</label>
                            <input className="w-full border rounded-md p-2 mt-1" />
                        </div>

                        <div>
                            <label>Designation</label>
                            <input className="w-full border rounded-md p-2 mt-1" />
                        </div>
                    </div>

                    <div>
                        <h3 className="font-semibold mb-4">Approved by:</h3>
                        <div className="border-b w-64 mb-2"></div>
                        <p className="font-semibold">ENGR. REY M. PARNACIO</p>
                        <p className="text-sm text-gray-600">OIC, Regional Director</p>
                    </div>
                </div>

              
                <div className="flex justify-end mt-10">
                    <button
                        onClick={handleCreate}
                        className="bg-[#1C7293] text-white px-6 py-2 rounded-md hover:bg-teal-700"
                    >
                        Create
                    </button>
                </div>

            </div>

          
            <SuccessModal
                show={showSuccess}
                onClose={() => setShowSuccess(false)}
            />
        </div>
    );
}

export default CreatePurchaseRequest;
