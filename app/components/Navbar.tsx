'use client';

import { FaUserCircle, FaBell } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthProvider';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [hasUnread, setHasUnread] = useState(false);
  const [popupMessage, setPopupMessage] = useState<any>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupLoading, setPopupLoading] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const fetchReply = async () => {
    if (!user?.email) return null;
    const { data } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('email', user.email)
      .not('reply', 'is', null)
      .eq('is_read', false)
      .order('created_at', { ascending: false })
      .limit(1);
    return Array.isArray(data) && data.length ? data[0] : null;
  };

  useEffect(() => {
    fetchReply().then((msg) => setHasUnread(!!msg));
  }, [user]);

  const handleBellClick = async () => {
    if (!user?.email) return;
    if (showPopup) return setShowPopup(false);
    setPopupLoading(true);
    const msg = await fetchReply();
    setPopupMessage(msg);
    setShowPopup(true);
    setPopupLoading(false);
  };

  const handleAction = async (action: 'delete' | 'close') => {
    if (!popupMessage) return;
    if (action === 'delete') {
      await supabase.from('contact_messages').delete().eq('id', popupMessage.id);
    } else {
      await supabase.from('contact_messages').update({ is_read: true }).eq('id', popupMessage.id);
    }
    setPopupMessage(null);
    setShowPopup(false);
    fetchReply().then((msg) => setHasUnread(!!msg));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  const links = [
    { label: 'Home', path: '/' },
    { label: 'Notes', path: '/notes/history' },
    { label: 'About', path: '/about' },
    { label: 'Blog', path: '/blog' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link
          href="/"
          className="text-3xl font-extrabold text-blue-600 tracking-tight hover:opacity-90 transition"
        >
          JuggerNotes
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex space-x-8">
          {links.map(({ label, path }) => (
            <Link
              key={label}
              href={path}
              className="relative text-sm font-semibold text-gray-700 hover:text-blue-600 transition group"
            >
              {label}
              <span className="absolute left-0 -bottom-1 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 group-hover:w-full rounded"></span>
            </Link>
          ))}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-600 focus:outline-none"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        {/* Right Side (Profile + Bell + Auth) */}
        <div className="hidden md:flex items-center space-x-4 relative">
          {!loading && user ? (
            <>
              {/* Bell */}
              <div className="relative">
                <button
                  onClick={handleBellClick}
                  className="relative p-2 rounded-full hover:bg-blue-100 transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  aria-label="View notifications"
                >
                  <FaBell className="text-xl text-gray-600" />
                  {hasUnread && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-semibold rounded-full px-1.5 py-0.5 shadow-sm animate-pulse">
                      1
                    </span>
                  )}
                </button>

                {showPopup && (
                  <div
                    className="absolute right-0 mt-3 w-80 bg-white border border-gray-200 rounded-xl shadow-xl p-5 z-50 animate-fade-in"
                    role="dialog"
                    aria-live="polite"
                  >
                    {popupLoading ? (
                      <div className="text-center text-sm text-gray-500 py-4">Loading...</div>
                    ) : popupMessage ? (
                      <>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-semibold text-blue-700">📩 Admin Reply</h3>
                          <span className="text-xs text-gray-400">
                            {new Date(popupMessage.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-line leading-relaxed">
                          {popupMessage.reply}
                        </p>
                        <div className="flex justify-end gap-3 mt-5">
                          <button
                            onClick={() => handleAction('delete')}
                            className="px-3 py-1.5 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => handleAction('close')}
                            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition"
                          >
                            Close
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center text-sm text-gray-500 py-4">📭 No new messages</div>
                    )}
                  </div>
                )}
              </div>

              {/* Profile */}
              <Link
                href="/profile"
                className="group relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition shadow-sm"
                title="Your Profile"
              >
                <FaUserCircle className="text-2xl" />
                <span className="absolute -bottom-6 text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  Profile
                </span>
              </Link>

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition shadow-sm border border-red-200"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push('/auth/login')}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline font-medium transition"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="text-sm text-purple-600 hover:text-purple-700 hover:underline font-medium transition"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {menuOpen && (
  <div className="md:hidden px-6 pb-4 bg-white border-t border-gray-200 shadow-sm">
    <nav className="flex flex-col space-y-3 pt-2">
      {links.map(({ label, path }) => (
        <Link
          key={label}
          href={path}
          onClick={() => setMenuOpen(false)}
          className="text-sm font-medium text-gray-700 hover:text-blue-600 transition"
        >
          {label}
        </Link>
      ))}

      {/* Mobile user actions */}
      {!loading && user ? (
        <>
          <button
            onClick={handleBellClick}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition"
          >
            <FaBell className="text-lg" />
            Notifications
            {hasUnread && (
              <span className="ml-auto bg-red-500 text-white text-xs font-semibold rounded-full px-2 py-0.5 shadow-sm animate-pulse">
                1
              </span>
            )}
          </button>

          <Link
            href="/profile"
            onClick={() => setMenuOpen(false)}
            className="flex items-center gap-2 text-sm text-gray-700 hover:text-blue-600 transition"
          >
            <FaUserCircle className="text-lg" />
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm text-red-600 hover:text-red-700 transition"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => {
              setMenuOpen(false);
              router.push('/auth/login');
            }}
            className="text-sm text-blue-600 hover:text-blue-700 transition"
          >
            Login
          </button>
          <button
            onClick={() => {
              setMenuOpen(false);
              router.push('/auth/signup');
            }}
            className="text-sm text-purple-600 hover:text-purple-700 transition"
          >
            Sign Up
          </button>
        </>
      )}
    </nav>
  </div>
)}
    </header>
  );
}