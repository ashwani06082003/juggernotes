'use client';

import { useEffect, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useSession } from '@supabase/auth-helpers-react';

// ✅ Set worker ONLY in browser
if (typeof window !== 'undefined' && pdfjs.GlobalWorkerOptions) {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

export default function PdfViewer({ url }: { url: string }) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const session = useSession();
  const isGuest = !session?.user;

  // Simulate loading progress
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => (prev >= 90 ? prev : prev + 5));
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // SSR safeguard
  useEffect(() => {
    if (typeof window === 'undefined' || !(window as any).DOMMatrix) {
      (window as any).DOMMatrix = class {};
    }
  }, []);

  return (
    <div className="relative flex flex-col items-center w-full px-4 sm:px-6">
      {/* Filename and page count */}
      {isLoaded && (
        <div className="w-full text-sm text-gray-600 text-right pr-2 pb-2">
          {numPages} page{numPages !== 1 ? 's' : ''}
        </div>
      )}

      {/* Watermark overlay for guests */}
      {isGuest && isLoaded && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <p className="text-4xl font-bold text-gray-300 rotate-45 select-none text-center">
            Preview Only
          </p>
        </div>
      )}

      <Document
        file={url}
        onLoadSuccess={({ numPages }) => {
          setNumPages(numPages);
          setProgress(100);
          setIsLoaded(true);
        }}
        loading={
          <div className="flex flex-col items-center justify-center w-full space-y-4 py-10">
            <p className="text-sm text-gray-500">Loading document... {progress}%</p>
            <div className="w-full max-w-md h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Shimmer skeletons */}
            <div className="w-full max-w-3xl space-y-6 mt-6">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 bg-gray-100 rounded-md animate-pulse border border-gray-200 shadow-inner"
                />
              ))}
            </div>
          </div>
        }
        error={
          <div className="flex items-center justify-center h-40 text-red-500 text-sm">
            Failed to load PDF. Please try again later.
          </div>
        }
        className="space-y-6 z-0"
      >
        {Array.from({ length: numPages || 0 }, (_, i) => (
          <Page
            key={`page_${i + 1}`}
            pageNumber={i + 1}
            renderTextLayer={false}
            renderAnnotationLayer={false}
            className="shadow-md rounded overflow-hidden border border-gray-200"
          />
        ))}
      </Document>
    </div>
  );
}