// src/components/RequestDetailsModal.jsx

import React from "react";
import { BadgeAlert, BadgeCheck } from "lucide-react";

export default function RequestDetailsModal({ open, onClose, request }) {
  if (!open || !request) return null;

  // Modal backdrop & panel, using Tailwind and framer-motion-like classes for smoothness
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm z-50 transition-opacity duration-200"
        onClick={onClose}
      />
      {/* Modal Panel */}
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-white p-6 rounded-2xl shadow-2xl w-11/12 md:w-3/4 lg:w-1/2 pointer-events-auto max-w-md">
          {/* Header */}
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-operon-charcoal">
              Request Details
            </h2>
            <button
              onClick={onClose}
              aria-label="Close details modal"
              className="text-gray-500 hover:text-gray-800 text-2xl leading-none"
            >
              ×
            </button>
          </div>
          {/* Details */}
          <div className="mt-2 space-y-3">
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
              <span
                className={
                  request.sentiment === "positive"
                    ? "text-green-600"
                    : request.sentiment === "negative"
                    ? "text-red-600"
                    : "text-gray-700"
                }
              >
                {request.sentiment || <em>N/A</em>}
              </span>
            </div>
            <div>
              <span className="font-semibold">AI Priority: </span>
              <span
                className={
                  request.priority === "high"
                    ? "text-red-600"
                    : request.priority === "low"
                    ? "text-yellow-500"
                    : "text-gray-700"
                }
              >
                {request.priority}
              </span>
            </div>
            <div>
              <span className="font-semibold">Needs Management Attention: </span>
              <span>
                {request.needs_attention ? (
                  <span className="inline-flex items-center text-red-600 font-bold">
                    <BadgeAlert className="w-4 h-4 mr-1" />
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center text-green-600 font-bold">
                    <BadgeCheck className="w-4 h-4 mr-1" />
                    No
                  </span>
                )}
              </span>
            </div>
            <div>
              <span className="font-semibold">Original Message:</span>
              <div className="bg-gray-100 rounded p-2 mt-1 text-gray-700">
                {request.message}
              </div>
            </div>
          </div>
          {/* Footer */}
          <div className="mt-6 flex justify-end">
            <button
              className="bg-operon-blue text-white rounded px-4 py-2 hover:bg-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
