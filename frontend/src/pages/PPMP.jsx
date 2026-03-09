export default function PPMP() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-8">
      <div className="flex items-center justify-between w-full max-w-4xl gap-12">

        {/* Left: Text */}
        <div className="flex-1">
          <h1 className="text-7xl font-black text-gray-900 leading-none mb-3">Oops!</h1>
          <h2 className="text-3xl font-bold text-gray-900 mb-5">Under construction</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            This PPMP detail view is temporarily unavailable.<br />
            The feature is currently being finalized by the system administrator.<br />
            Thank you for your understanding.
          </p>
        </div>

        {/* Right: Construction Image */}
        <div className="flex-shrink-0 w-96">
          <img
            src="src/components/images/construction.png"
            alt="Under construction illustration"
            className="w-full"
          />
        </div>

      </div>
    </div>
  );
}