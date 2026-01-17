import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default async function SingleBlog({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}) {
  const { slug } = await params;
  
  const { data: blog } = await supabase
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!blog) return notFound();

  const imageUrl = blog.image
    ? supabase.storage.from('blog-images').getPublicUrl(blog.image).data.publicUrl
    : '/images/blog-placeholder.jpg';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      <Navbar />
      
      {/* Hero Section - Matches your listing */}
      <section className="bg-gradient-to-r from-blue-100 to-blue-50 dark:from-gray-800 dark:to-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Meta */}
          <div className="flex flex-wrap gap-4 mb-8 text-sm text-gray-500 dark:text-gray-400">
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/50 px-3 py-1 rounded-full">
              {blog.category}
            </span>
            <span>{blog.author}</span>
            <span>• {blog.reading_time} min read</span>
            {blog.published_at && (
              <time>{new Date(blog.published_at).toLocaleDateString('en-IN', {
                month: 'short', day: 'numeric', year: 'numeric'
              })}</time>
            )}
          </div>

          {/* Title */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 dark:text-white mb-8 leading-tight">
            {blog.title}
          </h1>

          {/* Featured Image */}
          <div className="relative h-80 sm:h-96 lg:h-[500px] w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-gray-800">
            <img
              src={imageUrl}
              alt={blog.title}
              className="h-full w-full object-cover hover:scale-105 transition-transform duration-300"
              loading="eager"
            />
          </div>
        </div>
      </section>

      {/* Content - Custom Structured Layout */}
      <main className="max-w-4xl mx-auto px-6 py-20">
        <div 
          className="content-structure space-y-12"
          dangerouslySetInnerHTML={{ __html: blog.content }}
        />

        {/* Back Button */}
        <div className="mt-24 pt-12 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-lg transition-all cursor-pointer"
          >
            <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}

