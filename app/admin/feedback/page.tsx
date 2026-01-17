'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function FeedbackPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching messages:', error.message);
      } else {
        setMessages(data || []);
      }
      setLoading(false);
    };

    fetchMessages();
  }, []);

  const handleSendReply = async (msg: any) => {
    const reply = replyText[msg.id];
    if (!reply) {
      setStatus('❗ Reply cannot be empty.');
      return;
    }

    const { error } = await supabase
      .from('contact_messages')
      .update({ reply, is_read: false })
      .eq('id', msg.id);

    if (error) {
      setStatus('❗ Failed to send message.');
    } else {
      setStatus('✅ Message sent successfully!');
      setReplyText((prev) => ({ ...prev, [msg.id]: '' }));
    }
  };

  return (
    <div className="space-y-6 px-4 md:px-8 py-6">
      <h1 className="text-2xl font-bold text-blue-700">Feedback & Reports</h1>

      {status && (
        <p
          className={`text-sm font-medium ${
            status.startsWith('✅') ? 'text-green-600' : 'text-red-600'
          }`}
        >
          {status}
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-xl shadow-sm">
          <thead className="bg-gray-100 text-gray-700 text-sm">
            <tr>
              <th className="px-4 py-2 text-left whitespace-nowrap">Name</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Email</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Message</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Reply</th>
              <th className="px-4 py-2 text-left whitespace-nowrap">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  Loading messages...
                </td>
              </tr>
            ) : messages.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-400">
                  No messages found.
                </td>
              </tr>
            ) : (
              messages.map((msg) => (
                <tr key={msg.id} className="border-t text-sm align-top">
                  <td className="px-4 py-3 font-medium whitespace-nowrap">{msg.name}</td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{msg.email}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-xs break-words">{msg.message}</td>
                  <td className="px-4 py-3 min-w-[200px]">
                    <textarea
                      placeholder="Type your reply..."
                      value={replyText[msg.id] || ''}
                      onChange={(e) =>
                        setReplyText((prev) => ({
                          ...prev,
                          [msg.id]: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm resize-none"
                    />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <button
                      onClick={() => handleSendReply(msg)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Send
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}