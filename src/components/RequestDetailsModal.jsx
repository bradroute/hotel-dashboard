// src/components/RequestDetailsModal.jsx
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { BadgeAlert, BadgeCheck, BadgeHelpCircle } from "lucide-react";

export default function RequestDetailsModal({ open, onClose, request }) {
  if (!request) return null;

  // You can add icons/colors for attention/sentiment if you want
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full rounded-2xl shadow-xl p-6">
        <DialogTitle>Request Details</DialogTitle>
        <DialogDescription>
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
            {/* Add more fields as you enrich further */}
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
