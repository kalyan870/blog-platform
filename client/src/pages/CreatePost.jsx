import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';

export default function CreatePost() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      fetch(`/api/posts/${id}`)
        .then(r => r.json())
        .then(data => { setTitle(data.post.title); setContent(data.post.content); setLoading(false); })
        .catch(() => { toast.error('Failed to load post'); navigate('/'); });
    }
  }, [id, isEdit, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return toast.error('Title and content are required');
    setSaving(true);

    const url = isEdit ? `/api/posts/${id}` : '/api/posts';
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: title.trim(), content })
      });
      if (!res.ok) throw new Error();
      toast.success(isEdit ? 'Post updated!' : 'Post published!');
      const data = await res.json();
      navigate(`/post/${data.post.id}`);
    } catch { toast.error('Failed to save post'); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isEdit ? 'Edit Post' : 'Write a new post'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-medium" placeholder="An interesting title..." />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
          <textarea required value={content} onChange={e => setContent(e.target.value)} rows={15}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-y font-mono text-sm leading-relaxed" placeholder="Write your story here... (Markdown supported)" />
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium">Cancel</button>
          <button type="submit" disabled={saving}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Update Post' : 'Publish Post'}
          </button>
        </div>
      </form>
    </div>
  );
}
