export default function ArticleForm({ articleData, onClose }) {
  if (!articleData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-gray-300 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-600 hover:text-red-500 text-2xl"
          >
            ✖
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">{articleData.text}</h1>
          
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
            <span>Source: {articleData.source}</span>
            <span>|</span>
            <span>By: {articleData.by}</span>
            <span>|</span>
            <span>Time: {articleData.time || "Not specified"}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-100 p-3 rounded-lg">
              <h3 className="font-medium text-gray-700">Fact Verification</h3>
              <p className={`${
                articleData.fact_verdict === "False" ? "text-red-600" : "text-gray-800"
              }`}>
                {articleData.fact_verdict}
              </p>
              {articleData.fact_confidence && (
                <p className="text-sm text-gray-600">
                  Confidence: {Math.round(articleData.fact_confidence * 100)}%
                </p>
              )}
            </div>

            <div className="bg-gray-100 p-3 rounded-lg">
              <h3 className="font-medium text-gray-700">Disaster Status</h3>
              <p className="text-gray-800">{articleData.is_disaster === "yes" ? "Confirmed Disaster" : "Unverified"}</p>
            </div>
          </div>

          <div className="bg-gray-100 p-4 rounded-lg mb-4">
            <h3 className="font-medium text-gray-700 mb-2">Additional Information</h3>
            <p className="text-gray-800">
              {articleData.description?.trim() || "No additional description available"}
            </p>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
