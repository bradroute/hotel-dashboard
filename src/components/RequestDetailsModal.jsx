import { BadgeAlert, BadgeCheck } from "lucide-react";

export default function RequestDetailsModal({ request, onClose }) {
  if (!request) return null;
  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-operon-charcoal">Request Details</h2>
        <button
          onClick={onClose}
          aria-label="Close details modal"
          className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="mt-4 space-y-3">
        <div>
          <span className="font-semibold">Summary: </span>
          <span>{request.summary || <em>No summary available</em>}</span>
        </div>
        <div>
          <span className="font-semibold">Root Cause: </span>
          <span>{request.root_cause || <em>N/A</em>}</span>
        </div>
        <div>
          <span className="font-semibold">Sentiment: </span>
          <span className={
            request.sentiment === "positive"
              ? "text-green-600"
              : request.sentiment === "negative"
              ? "text-red-600"
              : "text-gray-700"
          }>
            {request.sentiment || <em>N/A</em>}
          </span>
        </div>
        <div>
          <span className="font-semibold">AI Priority: </span>
          <span className={
            request.priority === "high"
              ? "text-red-600"
              : request.priority === "low"
              ? "text-yellow-500"
              : "text-gray-700"
          }>
            {request.priority}
          </span>
        </div>
        <div>
          <span className="font-semibold">Needs Management Attention: </span>
          <span>
            {request.needs_attention
              ? <span className="inline-flex items-center text-red-600 font-bold"><BadgeAlert className="w-4 h-4 mr-1"/>Yes</span>
              : <span className="inline-flex items-center text-green-600 font-bold"><BadgeCheck className="w-4 h-4 mr-1"/>No</span>
            }
          </span>
        </div>
        <div>
          <span className="font-semibold">Original Message:</span>
          <div className="bg-gray-100 rounded p-2 mt-1 text-gray-700">{request.message}</div>
        </div>
      </div>
    </>
  );
}
