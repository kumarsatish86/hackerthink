'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Inquiry {
  id: number;
  sender_name: string;
  sender_email: string;
  subject: string;
  message_content: string;
  inquiry_type: string;
  status: string;
  assigned_to: number | null;
  assigned_to_name?: string;
  ip_address: string;
  received_at: string;
  resolved_at: string | null;
}

interface Note {
  id: number;
  note_content: string;
  user_name?: string;
  created_at: string;
}

export default function ContactInquiryDetail({ inquiryId }: { inquiryId: string }) {
  const router = useRouter();
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState('');
  const [status, setStatus] = useState('');
  const [assignedTo, setAssignedTo] = useState<number | null>(null);

  useEffect(() => {
    fetchInquiry();
  }, [inquiryId]);

  const fetchInquiry = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/contact/${inquiryId}`);
      if (!response.ok) throw new Error('Failed to fetch inquiry');

      const data = await response.json();
      setInquiry(data.inquiry);
      setNotes(data.notes || []);
      setStatus(data.inquiry.status);
      setAssignedTo(data.inquiry.assigned_to);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load inquiry');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const response = await fetch(`/api/admin/contact/${inquiryId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          assignedTo,
          note: newNote.trim() || undefined,
        }),
      });

      if (!response.ok) throw new Error('Failed to update inquiry');

      toast.success('Inquiry updated');
      setNewNote('');
      fetchInquiry();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update inquiry');
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      new: 'bg-blue-100 text-blue-800',
      in_progress: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      archived: 'bg-gray-100 text-gray-800',
    };
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${colors[status] || colors.new}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  if (!inquiry) {
    return <div className="p-8 text-center text-red-500">Inquiry not found</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <Link href="/admin/contact" className="text-red-600 hover:text-red-700 mb-2 inline-block transition-colors duration-200">
            ← Back to Inquiries
          </Link>
          <h1 className="text-3xl font-bold">Contact Inquiry #{inquiry.id}</h1>
        </div>
        <div className="flex gap-2">
          <a
            href={`mailto:${inquiry.sender_email}?subject=Re: ${inquiry.subject}`}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
          >
            Reply via Email
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Inquiry Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-semibold">Inquiry Details</h2>
              {getStatusBadge(inquiry.status)}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">From</label>
                <div className="mt-1">
                  <div className="text-lg font-medium">{inquiry.sender_name}</div>
                  <div className="text-sm text-gray-600">{inquiry.sender_email}</div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Subject</label>
                <div className="mt-1 text-lg">{inquiry.subject}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Type</label>
                <div className="mt-1">{inquiry.inquiry_type}</div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Message</label>
                <div className="mt-1 p-4 bg-gray-50 rounded-lg whitespace-pre-wrap">
                  {inquiry.message_content}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-gray-500">Received</label>
                  <div>{new Date(inquiry.received_at).toLocaleString()}</div>
                </div>
                {inquiry.resolved_at && (
                  <div>
                    <label className="text-gray-500">Resolved</label>
                    <div>{new Date(inquiry.resolved_at).toLocaleString()}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Notes</h2>
            <div className="space-y-4">
              {notes.map((note) => (
                <div key={note.id} className="border-l-4 border-red-500 pl-4">
                  <div className="text-sm text-gray-500 mb-1">
                    {note.user_name || 'System'} • {new Date(note.created_at).toLocaleString()}
                  </div>
                  <div className="text-gray-900">{note.note_content}</div>
                </div>
              ))}
              {notes.length === 0 && (
                <div className="text-gray-500 text-sm">No notes yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Management */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Manage</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="new">New</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Add Note</label>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border rounded-lg"
                  placeholder="Add a note about this inquiry..."
                />
              </div>

              <button
                onClick={handleUpdate}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
              >
                Update Inquiry
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Information</h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-500">IP Address:</span>{' '}
                <span className="font-mono">{inquiry.ip_address || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Inquiry ID:</span> {inquiry.id}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
