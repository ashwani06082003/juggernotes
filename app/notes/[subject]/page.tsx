'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import SubNavbar from '@/components/SubNavbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthProvider';
import PdfModal from '@/components/PdfModal';
import dynamic from 'next/dynamic';

const PdfViewerClient = dynamic(() => import('@/components/PdfViewerClient'), {
  ssr: false,
});

type Topic = {
  id: string;
  title: string;
  description: string;
  preview_url: string;
  download_url: string;
};

export default function SubjectNotesPage() {
  const { subject } = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const [topics, setTopics] = useState<Topic[]>([]);
  const [popupMessage, setPopupMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!subject) return;

      // Case-insensitive match for subject
      const { data, error } = await supabase
        .from('notes')
        .select('id, main_heading, sub_heading, file_url')
        .ilike('subject', subject as string);

      if (error) {
        console.error('Error fetching notes:', error.message);
        return;
      }

      const mapped = (data || []).map((note) => {
        const { data: urlData } = supabase.storage.from('notes').getPublicUrl(note.file_url);
        const publicUrl = urlData?.publicUrl || '';

        return {
          id: note.id,
          title: note.main_heading,
          description: note.sub_heading,
          preview_url: publicUrl,
          download_url: `${publicUrl}?download`,
        };
      });

      setTopics(mapped);
    };

    fetchNotes();
  }, [subject]);

  const showPopup = (msg: string) => {
    setPopupMessage(msg);
    setTimeout(() => setPopupMessage(''), 3000);
  };

  const handleDownload = async (url: string, noteId: string) => {
    if (!user?.email) return showPopup('Please sign in to download this file.');

    // ✅ Update user's download count
    const { data: userData } = await supabase
      .from('users')
      .select('downloads')
      .eq('email', user.email)
      .single();

    const currentDownloads = userData?.downloads || 0;
    await supabase
      .from('users')
      .update({ downloads: currentDownloads + 1 })
      .eq('email', user.email);

    // ✅ Update note's download count
    const { data: noteData } = await supabase
      .from('notes')
      .select('downloads')
      .eq('id', noteId) // or use .eq('uuid', noteUuid) if you're using UUIDs
      .single();

    const noteDownloads = noteData?.downloads || 0;
    await supabase
      .from('notes')
      .update({ downloads: noteDownloads + 1 })
      .eq('id', noteId); // match the same field used above

    // ✅ Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = '';
    link.click();
  };

  const handlePreview = (url: string) => {
    if (!url || url.includes('undefined') || url.includes('null')) {
      showPopup('No preview available for this topic.');
      return;
    }
    setPreviewUrl(url);
  };
  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col relative">
      <Navbar />
      <SubNavbar />

      {/* Popup Message */}
      {popupMessage && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-white border border-red-200 shadow px-6 py-3 rounded-lg text-center text-sm text-red-600 font-medium z-50 animate-fadeIn">
          {popupMessage}
        </div>
      )}

      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="relative bg-white w-11/12 h-5/6 rounded-lg shadow-lg overflow-y-auto p-4">
            <button
              onClick={() => setPreviewUrl(null)}
              className="absolute top-3 right-3 text-gray-600 hover:text-red-600 text-2xl font-bold"
            >
              ×
            </button>

            <PdfViewerClient url={previewUrl} />
          </div>
        </div>
      )}


      <main className="flex-grow py-16 px-6">
        <div className="max-w-5xl mx-auto space-y-10">
          {/* Header */}
          <header className="text-center">
            <h1 className="text-4xl font-extrabold text-blue-700 mb-2 capitalize">
              {subject} Notes
            </h1>
            <p className="text-gray-600 text-lg">
              Explore curated topics and download high-quality notes.
            </p>

            {user ? (
              <div className="mt-4 text-sm text-gray-600">
                Logged in as <strong>{user.email}</strong>
              </div>
            ) : (
              <div className="mt-6 text-center space-y-4">
                <p className="text-gray-700 font-medium">Want to use JuggerNotes?</p>
                <p className="text-gray-500 text-sm">
                  Sign in or Sign up now to access downloads.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => router.push('/auth/signup')}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            )}
          </header>

          {/* Topics Grid */}
          <section className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {topics.length === 0 ? (
              <p className="col-span-2 text-center text-gray-500 italic">
                No notes available for {subject}.
              </p>
            ) : (
              topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition border border-gray-100 hover:border-blue-500 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      onClick={() => handlePreview(topic.preview_url)}
                      className="px-4 py-1.5 bg-blue-50 text-blue-600 text-sm font-medium rounded-md hover:bg-blue-100 transition"
                    >
                      Preview
                    </button>
                    {user ? (
                      <button
                        onClick={() => handleDownload(topic.download_url, topic.id)}
                        className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition"
                      >
                        Download
                      </button>
                    ) : (
                      <p className="text-sm text-gray-400 italic mt-2">
                        Sign in to download
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>
      {previewUrl && <PdfModal url={previewUrl} onClose={() => setPreviewUrl(null)} />}

      <Footer />
    </div>
  );
}