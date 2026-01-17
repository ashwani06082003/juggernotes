import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default async function BlogPage() {
    const { data: blogs } = await supabase
        .from('blogs')
        .select('slug, title, excerpt, category, published_at, image')
        .order('published_at', { ascending: false });

    return (
        <div className="min-h-screen bg-gray-50 text-gray-800">
            <Navbar />

            {/* Hero */}
            <header className="bg-gradient-to-r from-blue-100 to-blue-50 py-20 px-6 text-center">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-700 mb-4">
                    Blog
                </h1>
                <p className="max-w-2xl mx-auto text-gray-700 text-base sm:text-lg">
                    Exam-focused articles, preparation strategies, and smart revision ideas
                    for UPSC, SSC, and State PSC aspirants.
                </p>
            </header>

            {/* Content */}
            <main className="py-16 px-4 sm:px-6">
                <section className="max-w-6xl mx-auto">
                    {!blogs || blogs.length === 0 ? (
                        /* Empty State */
                        <div className="text-center max-w-xl mx-auto py-24">
                            <h2 className="text-2xl font-extrabold text-gray-800 mb-4">
                                Thoughtful Articles Are Coming Soon ✍️
                            </h2>

                            <p className="text-gray-600 leading-relaxed">
                                We’re crafting high-quality, exam-focused articles on UPSC, SSC,
                                and State PSC preparation—designed to improve clarity, strategy,
                                and revision efficiency.
                            </p>

                            <p className="mt-6 text-sm text-gray-500">
                                Meanwhile, explore our carefully curated notes.
                            </p>

                            <Link
                                href="/notes/history"
                                className="inline-flex items-center gap-2 mt-8 px-6 py-3 rounded-full bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                            >
                                Explore Notes →
                            </Link>
                        </div>
                    ) : (
                        /* Blog Grid */
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                            {blogs.map((blog) => {
                                const imageUrl = blog.image
                                    ? supabase.storage
                                        .from('blog-images')
                                        .getPublicUrl(blog.image).data.publicUrl
                                    : '/images/blog-placeholder.jpg';

                                return (
                                    <article
                                        key={blog.slug}
                                        className="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Image */}
                                        <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                                            <img
                                                src={imageUrl}
                                                alt={blog.title}
                                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                                                loading="lazy"
                                            />
                                        </div>

                                        {/* Content */}
                                        <div className="p-6 flex flex-col h-full">
                                            <span className="inline-block w-fit text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mb-3">
                                                {blog.category}
                                            </span>

                                            <h3 className="text-lg font-bold text-gray-900 leading-snug mb-2">
                                                <Link href={`/blog/${blog.slug}`} className="hover:text-blue-600">
                                                    {blog.title}
                                                </Link>
                                            </h3>

                                            <p className="text-sm text-gray-600 leading-relaxed flex-grow">
                                                {blog.excerpt}
                                            </p>

                                            <div className="mt-5 flex items-center justify-between text-xs text-gray-500">
                                                {blog.published_at && (
                                                    <span>
                                                        {new Date(blog.published_at).toLocaleDateString('en-IN', {
                                                            month: 'short',
                                                            year: 'numeric',
                                                        })}
                                                    </span>
                                                )}

                                                <Link
                                                    href={`/blog/${blog.slug}`}
                                                    className="text-blue-600 font-medium hover:underline"
                                                >
                                                    Read more →
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                );
                            })}

                        </div>
                    )}
                </section>
            </main>

            <Footer />
        </div>
    );
}
