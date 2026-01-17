'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthProvider';

export default function ContactPage() {
  const { user, loading } = useAuth();
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async () => {
    if (!user || !user.email || !message.trim()) {
      setStatus('❗ You must be logged in and provide a message.');
      return;
    }

    const name = user.user_metadata?.name || 'Registered User';
    const email = user.email;

    const { error } = await supabase.from('contact_messages').insert({
      name,
      email,
      message: message.trim(),
      status: 'pending',
    });

    if (error) {
      setStatus('❗ Failed to send message.');
    } else {
      setStatus('✅ Message sent successfully!');
      setMessage('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-white to-blue-200 text-gray-800 flex flex-col">
      <Navbar />

      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Side */}
          <div className="text-center md:text-left">
            <h2 className="text-5xl font-extrabold text-blue-700 mb-6 leading-tight">
              Let’s Connect
            </h2>
            <p className="text-gray-600 text-lg">
              <b>
                <i>
                  Whether you're a student with feedback or an official looking to collaborate, we’re here to listen.
                  Fill out the form and we’ll get back to you shortly. Your voice helps us grow.
                </i>
              </b>
            </p>
          </div>

          {/* Right Side */}
          <div className="bg-white p-8 rounded-2xl shadow-xl backdrop-blur-md border border-blue-100">
            <div className="space-y-6">
              {!user && !loading ? (
                <p className="text-sm text-red-600 font-medium">
                  You must be logged in to send a message.
                </p>
              ) : (
                <>
                  <div className="text-sm text-gray-500">
                    Logged in as: <span className="font-medium text-blue-700">{user?.email}</span>
                  </div>

                  <div className="relative">
                    <textarea
                      id="message"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder=" "
                      className="peer w-full px-4 pt-5 pb-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <label
                      htmlFor="message"
                      className="absolute left-4 top-2 text-sm text-gray-500 transition-all peer-placeholder-shown:top-3.5 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-600"
                    >
                      Message
                    </label>
                  </div>

                  <button
                    onClick={handleSubmit}
                    className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition duration-300 font-medium"
                  >
                    Send Message
                  </button>
                </>
              )}

              {status && (
                <p
                  className={`text-sm font-medium ${
                    status.startsWith('✅') ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {status}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}