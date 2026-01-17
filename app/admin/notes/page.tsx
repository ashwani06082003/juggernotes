'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createPortal } from 'react-dom';

export function ToastPortal({ children }: { children: React.ReactNode }) {
  if (typeof window === 'undefined') return null;
  return createPortal(children, document.body);
}


type Note = {
  id: string;
  subject: string;
  main_heading: string;
  sub_heading: string;
  file_url: string;
  downloads: number;
  created_at: string;
};

export default function NotesAdmin() {
  const [subject, setSubject] = useState('');
  const [mainHeading, setMainHeading] = useState('');
  const [subHeading, setSubHeading] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Note | null>(null);


  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase.from('notes').select('*').order('created_at', { ascending: false });
      if (!error) setNotes(data || []);
      else console.error(error.message);
      setLoading(false);
    })();
  }, []);

  const showMessage = (text: string, type: 'success' | 'error' = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage(null), 3000);
  };

  // move this outside so you can reuse it
  const fetchNotes = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error) setNotes(data || []);
    else console.error(error.message);
    setLoading(false);
  };

  const handleUpload = async () => {

    const { data: user } = await supabase.auth.getUser();
    console.log(user);


    if (!subject || !mainHeading || !subHeading || !file)
      return showMessage('❗ Fill all fields', 'error');

    setUploading(true);

    // Create storage path: subject/filename.pdf
    const safeName = file.name.replace(/\s+/g, '_');
    const fileName = `${Date.now()}-${safeName}`;
    const storagePath = `${subject}/${fileName}`;

    // 1️⃣ Upload PDF to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from('notes')
      .upload(storagePath, file, { upsert: false });

    if (uploadError) {
      setUploading(false);
      return showMessage('❗ File upload failed', 'error');
    }

    // 2️⃣ Get public URL
    const { data } = supabase.storage
      .from('notes')
      .getPublicUrl(storagePath);

    // 3️⃣ Insert DB record
    const payload = {
      subject,
      main_heading: mainHeading,
      sub_heading: subHeading,
      file_url: storagePath,
      preview_url: data.publicUrl,
      download_url: `${data.publicUrl}?download`,
      downloads: 0,
    };

    const { error } = await supabase.from('notes').insert(payload);

    if (error) {
      showMessage('❗ Database insert failed', 'error');
    } else {
      showMessage('✅ Note uploaded successfully!');
      setSubject('');
      setMainHeading('');
      setSubHeading('');
      setFile(null);
      await fetchNotes();
    }

    setUploading(false);
  };


  const handleUpdate = async () => {
    if (!selectedNote) return;
    const { error } = await supabase.from('notes').update(selectedNote).eq('id', selectedNote.id);
    error
      ? showMessage('❗ Update failed', 'error')
      : (showMessage('✅ Note updated!'),
        setNotes(prev => prev.map(n => (n.id === selectedNote.id ? selectedNote : n))),
        setSelectedNote(null));
  };

  const handleDelete = async (note: Note) => {
    const { error: e1 } = await supabase.from('notes').delete().eq('id', note.id);
    const { error: e2 } = await supabase.storage.from('notes').remove([note.file_url]);
    e1 || e2
      ? showMessage('❗ Delete failed', 'error')
      : (showMessage('✅ Note deleted'),
        setNotes(prev => prev.filter(n => n.id !== note.id)),
        selectedNote?.id === note.id && setSelectedNote(null));
  };

  const filteredNotes = notes.filter(n => n.main_heading.toLowerCase().includes(search.toLowerCase()));
  const inputClass =
    'input bg-gray-50 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition';

  return (
    <div className="space-y-10 px-6 py-10 max-w-6xl mx-auto">
      <h1 className="text-3xl font-extrabold text-blue-700">📚 Upload & Manage Notes</h1>

      {/* Toast Message */}
      {message && (
        <ToastPortal>
          <div
            className={`fixed top-6 right-6 z-[99999]
      flex items-center gap-3 px-5 py-3 rounded-lg shadow-xl text-white
      ${message.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
          >
            <span>{message.text}</span>
            <button
              onClick={() => setMessage(null)}
              className="text-white text-lg leading-none hover:opacity-80"
            >
              ×
            </button>
          </div>
        </ToastPortal>
      )}

      {deleteTarget && (
        <ToastPortal>
          <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-800">
                🗑️ Delete Note?
              </h3>

              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete
                <span className="font-medium"> “{deleteTarget.main_heading}”</span>?
                <br />
                This action cannot be undone.
              </p>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setDeleteTarget(null);
                    showMessage('❌ Deletion cancelled', 'error');
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
                >
                  No
                </button>

                <button
                  onClick={async () => {
                    await handleDelete(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition font-semibold"
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        </ToastPortal>
      )}



      {/* Upload Form */}
      <div className="bg-white border rounded-2xl shadow-lg p-8 grid grid-cols-1 md:grid-cols-2 gap-6 hover:shadow-xl transition">
        {/* Subject Dropdown */}
        <select
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className={inputClass}
        >
          <option value="">Select Subject</option>
          <option value="biology">Biology</option>
          <option value="chemistry">Chemistry</option>
          <option value="physics">Physics</option>
          <option value="history">History</option>
          <option value="polity">Polity</option>
          <option value="economics">Economics</option>
          <option value="geography">Geography</option>
          <option value="math">Math</option>
          <option value="english">English</option>
        </select>

        <input
          placeholder="Main Heading"
          value={mainHeading}
          onChange={(e) => setMainHeading(e.target.value)}
          className={inputClass}
        />

        <input
          placeholder="Sub Heading"
          value={subHeading}
          onChange={(e) => setSubHeading(e.target.value)}
          className={inputClass}
        />

        {/* PDF File Picker */}
        <input
          type="file"
          accept="application/pdf"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className={inputClass}
          style={{ cursor: 'pointer' }}
        />
        {file && (
          <p className="text-sm text-gray-600">
            Selected file: <strong>{file.name}</strong>
          </p>
        )}



        <button
          onClick={handleUpload}
          disabled={uploading}
          className="col-span-1 md:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg hover:from-blue-700 hover:to-blue-800 font-semibold transition"
        >
          {uploading ? 'Uploading...' : '🚀 Upload Note'}
        </button>
      </div>

      {/* Search */}
      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="🔍 Search by main heading..."
        className="input w-full max-w-md bg-white border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 transition"
      />

      {/* Notes Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg border mt-6">
        <table className="min-w-full bg-white text-sm">
          <thead className="bg-blue-50">
            <tr className="text-blue-700 font-semibold">
              {['Subject', 'Main', 'Sub', 'Downloads', 'Actions'].map(h => (
                <th key={h} className="px-6 py-3 text-left">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </td>
              </tr>
            ) : !filteredNotes.length ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-gray-500">
                  No notes found
                </td>
              </tr>
            ) : (
              filteredNotes.map(n => (
                <tr
                  key={n.id}
                  className="border-t hover:bg-blue-50 transition cursor-pointer"
                >
                  <td className="px-6 py-4">{n.subject}</td>
                  <td className="px-6 py-4">{n.main_heading}</td>
                  <td className="px-6 py-4">{n.sub_heading}</td>
                  <td className="px-6 py-4">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                      {n.downloads}
                    </span>
                  </td>
                  <td className="px-6 py-4 space-x-3">
                    <button
                      onClick={() => setSelectedNote(n)}
                      className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(n)}
                      className="text-sm text-red-600 hover:text-red-800 font-medium transition"
                    >
                      Delete
                    </button>

                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit Form */}
      {selectedNote && (
        <div className="bg-white p-6 rounded-xl shadow space-y-4 mt-6 animate-fadeIn">
          <h2 className="text-lg font-semibold text-blue-600">✏️ Edit Note</h2>
          {['subject', 'main_heading', 'sub_heading'].map((f, i) => (
            <input
              key={i}
              value={selectedNote[f as keyof Note] as string}
              onChange={e => setSelectedNote({ ...selectedNote, [f]: e.target.value })}
              className={inputClass}
              placeholder={f.replace('_', ' ')}
            />
          ))}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleUpdate}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
            >
              Save Changes
            </button>
            <button
              onClick={() => setSelectedNote(null)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}