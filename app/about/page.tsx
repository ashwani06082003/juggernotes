'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Navbar />

      {/* Aspirants Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-50 to-blue-100">
        <h2 className="text-4xl font-extrabold text-center text-blue-800 mb-12 tracking-tight">
          For Aspirants
        </h2>
        <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow text-center text-gray-700 italic space-y-6">
          <p className="text-lg ">
            <span className="text-2xl font-bold text-gray-800">Hey champ 👋</span><br /><br />
            We know the grind. Late nights, endless PDFs, and that one topic you keep skipping.
            JuggerNotes was born from that exact struggle. We’re not some corporate content farm—we’re students,
            just like you, who wanted better notes, faster prep, and fewer distractions.
          </p>
          <p className="text-lg text-gray-700">
            Our notes are crisp, exam-focused, and totally free. Whether you're prepping for SSC, UPSC, or State PSCs,
            we’ve got your back. No fluff, no paywalls—just clean, downloadable content that helps you crack it.
          </p>
          <p className="text-lg text-gray-700">
            So go ahead, explore, download, revise, and repeat. And if you ever feel stuck, remember: even the toughest
            exams bow to consistent effort. You’ve got this 💪
          </p>
        </div>
      </section>

      {/* Officials Section */}
      <section className="py-24 px-6 bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-12 tracking-tight">
            For Officials & Institutions
          </h2>
          <p className="text-center text-gray-600 text-lg max-w-3xl mx-auto mb-16">
            JuggerNotes is designed to complement institutional efforts in education. We offer structured, accessible, and
            exam-aligned resources that support aspirants across India. Our platform is open to collaboration with
            organizations seeking to enhance learning outcomes.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              {
                title: 'Mission & Vision',
                desc: 'We aim to democratize access to high-quality study material, empowering students from diverse backgrounds to succeed in competitive examinations.',
              },
              {
                title: 'Curriculum Alignment',
                desc: 'Our content is meticulously organized to reflect the structure and requirements of SSC, UPSC, and State PSC syllabi.',
              },
              {
                title: 'Technology & Accessibility',
                desc: 'JuggerNotes is built using modern web technologies, optimized for mobile devices and low-bandwidth environments to ensure inclusivity.',
              },
              {
                title: 'Collaboration & Outreach',
                desc: 'We welcome partnerships with educational institutions, government bodies, and NGOs to expand our reach and impact.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition duration-300"
              >
                <h4 className="text-xl font-semibold text-gray-800 mb-3">{item.title}</h4>
                <p className="text-base text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}