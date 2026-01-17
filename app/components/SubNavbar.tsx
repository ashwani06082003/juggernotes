'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const subjects = [
  'History',
  'Polity',
  'Economics',
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'English',
  'Geography',
];

type Note = {
  id: string;
  subject: string;
  main_heading: string;
};

export default function SubNavbar() {
  const pathname = usePathname();
  const [topics, setTopics] = useState<string[]>([]);
  const activeSubject = subjects.find((s) =>
    pathname.toLowerCase().includes(s.toLowerCase())
  );

  useEffect(() => {
    const fetchTopics = async () => {
      if (!activeSubject) return setTopics([]);
      const { data, error } = await supabase
        .from('notes')
        .select('main_heading')
        .eq('subject', activeSubject)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching topics:', error.message);
        setTopics([]);
      } else {
        // Deduplicate topics
        const unique = Array.from(new Set(data?.map((d) => d.main_heading)));
        setTopics(unique);
      }
    };

    fetchTopics();
  }, [activeSubject]);

  return (
    <nav className="bg-white border-b shadow-sm sticky top-14 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
        {/* Subject Pills */}
        <div className="flex flex-wrap justify-center gap-3">
          {subjects.map((subject) => {
            const isActive = pathname.includes(subject.toLowerCase());
            return (
              <Link
                key={subject}
                href={`/notes/${subject.toLowerCase()}`}
                className={`relative px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300
                  ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                  }`}
              >
                {subject}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}