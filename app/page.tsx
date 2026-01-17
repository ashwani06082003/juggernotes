'use client';

import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useAuth } from '@/context/AuthProvider';

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="bg-gradient-to-r from-blue-100 to-blue-50 py-20 sm:py-24 px-4 sm:px-6 text-center"
      >
        <h2 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4">
          Welcome to JuggerNotes
        </h2>
        <p className="text-base sm:text-lg text-gray-700 max-w-2xl mx-auto">
          Your unstoppable source for exam-ready notes, smart preparation, and downloadable resources.
        </p>

        {user ? (
          <>
            <p className="mt-4 text-sm text-green-700">
              Logged in as <strong>{user.email}</strong>. You can now explore and download notes.
            </p>
            <a href="/notes/history">
              <button className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300">
                Explore Notes
              </button>
            </a>
          </>
        ) : (
          <div className="mt-6 space-y-4">
            <p className="text-sm sm:text-md text-gray-700">
              <strong>Want to use JuggerNotes?</strong><br />
              Sign in or Sign up now to access downloads.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => router.push('/auth/login')}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
              >
                Login
              </button>
              <button
                onClick={() => router.push('/auth/signup')}
                className="px-6 py-2 bg-gray-100 text-blue-600 rounded hover:bg-gray-200 transition"
              >
                Sign Up
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Quick Notes Section */}
      <section id="quick-notes" className="py-16 sm:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-10 sm:mb-12">
            Mostly Downloaded Notes
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: 'History',
                desc: 'Concise summaries of key events and timelines.',
                href: '/notes/history',
              },
              {
                title: 'Polity',
                desc: 'Clear breakdowns of constitutional concepts.',
                href: '/notes/polity',
              },
              {
                title: 'Geography',
                desc: 'Visual maps and topic-wise notes.',
                href: '/notes/geography',
              },
              {
                title: 'Economics',
                desc: 'Simplified concepts for fast revision.',
                href: '/notes/economics',
              },
            ].map((note, idx) => (
              <a
                key={idx}
                href={note.href}
                className="group block bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition duration-300 border border-gray-100 hover:border-blue-500"
              >
                <h4 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600 mb-2">
                  {note.title}
                </h4>
                <p className="text-sm text-gray-600">{note.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section id="why-juggernotes" className="bg-gray-100 py-16 sm:py-20 px-4 sm:px-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-10 sm:mb-12">
          Why JuggerNotes?
        </h3>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {[
            {
              title: 'Curated Notes',
              desc: 'Every note is handpicked and organized for maximum clarity and relevance.',
            },
            {
              title: 'Exam-Focused',
              desc: 'Built around SSC, UPSC, and State PSCs with topic-wise breakdowns.',
            },
            {
              title: 'Free & Accessible',
              desc: 'No paywalls. Just clean, downloadable content for every student.',
            },
            {
              title: 'Built by Learners',
              desc: 'Created by students who understand what real prep feels like.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-xl shadow hover:shadow-2xl transform hover:-translate-y-1 transition duration-300"
            >
              <h4 className="text-lg font-bold mb-2">{item.title}</h4>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6">
        <h3 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-800 mb-10 sm:mb-12">
          About JuggerNotes
        </h3>
        <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow text-center">
          <p className="text-base sm:text-lg text-gray-700 mb-6">
            <i>
              JuggerNotes is built for students who want clarity, speed, and confidence in their exam prep.
              We curate high-quality notes, organize them by subject, and make them downloadable for offline study.
              Whether you're preparing for SSC, UPSC, or State PSCs, we’ve got your back.
            </i>
          </p>
          <a
            href="/about"
            className="inline-flex items-center gap-2 text-blue-600 font-medium group transition duration-300"
          >
            <span className="relative">
              <span className="transition-colors duration-300 group-hover:text-blue-800">
                <b>View More</b>
              </span>
              <span
                className="absolute left-0 bottom-0 h-0.5 w-full bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
              />
            </span>
            <svg
              className="w-4 h-4 transform group-hover:translate-x-1 transition duration-300 text-blue-600 group-hover:text-blue-800"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}