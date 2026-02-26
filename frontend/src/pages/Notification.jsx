import React, { useState } from "react";
import { Tag, X } from "lucide-react";

export default function Notification({ isOpen, onClose }) {
  const [showFullModal, setShowFullModal] = useState(false);

  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: "Signature required for New Purchase Request",
      message: "Your signature is required for the approval of",
      prNumber: "PR-2023-03-0003",
      time: "22 hours ago",
    },
    {
      id: 2,
      title: "Signature required for New Purchase Request",
      message: "Your signature is required for the approval of",
      prNumber: "PR-2023-03-0002",
      time: "03-07-2023",
    },
  ];

  const handleSeeAll = () => {
    setShowFullModal(true);
  };

  const handleCloseFullModal = () => {
    setShowFullModal(false);
  };

  const handleCloseAll = () => {
    setShowFullModal(false);
    onClose();
  };

 
  if (showFullModal) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={handleCloseAll}
      >
       
        <div className="absolute inset-0 bg-black/50"></div>

      
        <div
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
        
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            <button
              onClick={handleCloseAll}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-700" />
            </button>
          </div>

       
          <div className="max-h-[500px] overflow-y-auto">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-teal-900 rounded-lg flex items-center justify-center">
                      <Tag className="w-5 h-5 text-white" />
                    </div>
                  </div>

                 
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-teal-900 leading-tight">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}{" "}
                      <span className="text-red-600 font-medium">
                        {notification.prNumber}.
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  
  return (
    <div className="fixed inset-0 z-50" onClick={onClose}>
      <div className="absolute inset-0 bg-black/10"></div>

      <div
        className="absolute top-20 right-10 w-[300px] bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
       
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
        </div>

       
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="px-5 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Tag className="w-4 h-4 text-gray-700" />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1 leading-tight">
                    {notification.title}
                  </h3>
                  <p className="text-xs text-gray-600 mb-1">
                    {notification.message}{" "}
                    <span className="text-red-600 font-medium">
                      {notification.prNumber}.
                    </span>
                  </p>
                  <p className="text-xs text-gray-400">{notification.time}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

    
        <div className="px-5 py-3 text-center border-t border-gray-100">
          <button
            onClick={handleSeeAll}
            className="text-sm font-semibold text-teal-600 hover:text-teal-700 transition-colors"
          >
            See All
          </button>
        </div>
      </div>
    </div>
  );
}