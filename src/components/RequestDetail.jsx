// src/components/RequestDetail.jsx
import RequestNotes from './RequestNotes';
import RequestHistory from './RequestHistory';

export default function RequestDetail({ request }) {
  if (!request) return null;
  return (
    <div className="space-y-6 p-4">
      <div>
        <h3 className="text-lg font-semibold">Notes</h3>
        <RequestNotes requestId={request.id} />
      </div>
      <div>
        <h3 className="text-lg font-semibold">History</h3>
        <RequestHistory requestId={request.id} />
      </div>
    </div>
  );
}
