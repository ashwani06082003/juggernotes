'use client';

import dynamic from 'next/dynamic';
import { IoClose } from 'react-icons/io5';

const PDFViewer = dynamic(() => import('@/components/PdfViewerClient'), {
  ssr: false,
});

export default function PdfModal({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 px-4">
      <div className="relative w-full max-w-5xl h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 animate-fadeIn">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 text-gray-500 hover:text-red-500 transition-colors"
          aria-label="Close"
        >
          <IoClose className="text-3xl" />
        </button>

        {/* PDF Viewer */}
        <div className="h-full overflow-y-auto px-4 sm:px-6 py-4">
          <PDFViewer url={url} />
        </div>
      </div>
    </div>
  );
}