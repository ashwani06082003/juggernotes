'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Blog = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  author: string;
  image: string;
  reading_time: string;
  published_at: string;
};

export default function BlogAdmin() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');

  const [form, setForm] = useState<any>({
    slug: '',
    title: '',
    excerpt: '',
    content: '',
    category: '',
    author: '',
    reading_time: '',
    published_at: '',
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    setBlogs(data || []);
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  // EDIT: Load blog data into form
  const handleEdit = async (blog: Blog) => {
    setEditingId(blog.id);
    setActiveTab('create');
    setForm({
      slug: blog.slug,
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
      category: blog.category || '',
      author: blog.author || '',
      reading_time: blog.reading_time || '',
      published_at: blog.published_at || '',
    });
    setImageFile(null);
  };

  // UPDATE or CREATE
  const handleSubmit = async () => {
    if (!form.slug || !form.title || !form.content) {
      return alert('Fill required fields');
    }

    setLoading(true);

    let imagePath = editingId ? form.image : null;

    // New image upload (only if new file selected)
    if (imageFile) {
      imagePath = `blog/${Date.now()}-${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from('blog-images')
        .upload(imagePath, imageFile);

      if (uploadError) {
        setLoading(false);
        return alert('Image upload failed');
      }
    }

    const payload = {
      ...form,
      image: imagePath,
    };

    let result;
    if (editingId) {
      // UPDATE
      result = await supabase
        .from('blogs')
        .update(payload)
        .eq('id', editingId);
    } else {
      // CREATE
      result = await supabase.from('blogs').insert(payload);
    }

    setLoading(false);

    if (result.error) {
      alert(editingId ? 'Update failed' : 'Insert failed');
    } else {
      alert(editingId ? 'Blog updated!' : 'Blog added!');
      // Reset form
      setForm({
        slug: '',
        title: '',
        excerpt: '',
        content: '',
        category: '',
        author: '',
        reading_time: '',
        published_at: '',
      });
      setImageFile(null);
      setEditingId(null);
      fetchBlogs();
    }
  };

  const handleDelete = async (blog: Blog) => {
    if (!confirm(`Delete "${blog.title}"?`)) return;
    
    await supabase.from('blogs').delete().eq('id', blog.id);
    await supabase.storage.from('blog-images').remove([blog.image]);
    fetchBlogs();
  };

  return (
    <div className="max-w-6xl mx-auto p-8 space-y-10">
      {/* Professional Header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            📝 Blog Admin
          </h1>
          <p className="text-gray-600 mt-1">Manage your exam-focused articles</p>
        </div>
        <div className="text-sm text-gray-500">
          {blogs.length} posts published
        </div>
      </div>

      {/* Professional Tabs */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-1 px-6 -mb-px">
            <button
              onClick={() => setActiveTab('create')}
              className={`px-4 py-3 font-semibold rounded-t-lg transition-all ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              {editingId ? '✏️ Edit Post' : '➕ New Post'}
            </button>
            <button
              onClick={() => setActiveTab('list')}
              className={`px-4 py-3 font-semibold rounded-t-lg transition-all ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              📋 All Posts ({blogs.length})
            </button>
          </nav>
        </div>

        {/* CREATE/EDIT FORM */}
        {activeTab === 'create' && (
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {['slug', 'title', 'excerpt', 'category', 'author', 'reading_time', 'published_at'].map((f) => (
                <input
                  key={f}
                  placeholder={f.replace('_', ' ')}
                  value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              ))}

              <textarea
                placeholder="Content (HTML or Markdown)"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="md:col-span-2 w-full p-4 border border-gray-200 rounded-xl h-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-vertical"
              />

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-400 transition-colors"
                />
                {editingId && form.image && !imageFile && (
                  <p className="text-xs text-gray-500 mt-1">
                    Current: {form.image.split('/').pop()}
                  </p>
                )}
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="md:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Saving...
                  </span>
                ) : editingId ? (
                  '💾 Update Blog'
                ) : (
                  '🚀 Publish Blog'
                )}
              </button>
            </div>
          </div>
        )}

        {/* BLOG LIST */}
        {activeTab === 'list' && (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-100">
                    <th className="p-6 text-left font-bold text-blue-900">Title</th>
                    <th className="p-6 text-left font-bold text-blue-900">Category</th>
                    <th className="p-6 text-left font-bold text-blue-900">Date</th>
                    <th className="p-6 text-left font-bold text-blue-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {blogs.map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-6 font-medium text-gray-900 max-w-md truncate">
                        {b.title}
                      </td>
                      <td className="p-6">
                        <span className="inline-block px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                          {b.category}
                        </span>
                      </td>
                      <td className="p-6 text-gray-600">
                        {b.published_at}
                      </td>
                      <td className="p-6 space-x-2">
                        <button
                          onClick={() => handleEdit(b)}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => handleDelete(b)}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          🗑️ Delete
                        </button>
                        <br />
                        <a
                          href={`/blog/${b.slug}`}
                          target="_blank"
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                          👁️ View
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {blogs.length === 0 && (
              <div className="p-20 text-center">
                <div className="text-6xl mb-4">📝</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No blogs yet</h3>
                <p className="text-gray-600 mb-6">Create your first exam-focused article</p>
                <button
                  onClick={() => setActiveTab('create')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg"
                >
                  ➕ Create First Blog
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
