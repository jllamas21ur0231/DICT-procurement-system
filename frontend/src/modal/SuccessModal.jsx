export default function SuccessModal({ show, onClose }) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
            <div className="bg-white rounded-xl shadow-lg w-[360px] p-6 text-center animate-scaleIn">

                {/* Check Icon */}
                <div className="flex justify-center mb-3">
                    <div className="w-16 h-16 rounded-full border-4 border-green-500 flex items-center justify-center">
                        <svg
                            className="w-8 h-8 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                </div>

                {/* Text */}
                <h2 className="text-2xl font-semibold text-green-600">Success!</h2>
                <p className="text-gray-600 mt-2 text-sm">
                    Your purchase request was created successfully.
                </p>

                {/* Button */}
                <button
                    onClick={onClose}
                    className="mt-5 bg-[#1C7293] hover:bg-teal-700 text-white px-6 py-2 rounded-lg transition"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
