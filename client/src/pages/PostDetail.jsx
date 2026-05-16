import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeft, Clock, User, Trash2, Edit3, MessageSquare } from 'lucide-react';

export default function PostDetail() {
  const { id } = useParams();
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [sending, setSending] = useState(false);

  const fetchPost = () => {
    fetch(`/api/posts/${id}`)
      .then(r => r.json())
      .then(data => { setPost(data.post); setComments(data.comments); setLoading(false); })
      .catch(() => { toast.error('Post not found'); navigate('/'); });
  };

  useEffect(() => { fetchPost(); }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this post?')) return;
    try {
      const res = await fetch(`/api/posts/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      toast.success('Post deleted'); navigate('/');
    } catch { toast.error('Failed to delete'); }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setSending(true);
    try {
      const res = await fetch(`/api/comments/post/${id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ content: commentText.trim() })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setComments(prev => [...prev, data.comment]);
      setCommentText('');
      toast.success('Comment added');
    } catch { toast.error('Failed to add comment'); }
    finally { setSending(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setComments(prev => prev.filter(c => c.id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  if (!post) return null;

  const date = new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <article className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
          <span className="flex items-center gap-1"><User className="w-4 h-4" /> {post.author_name}</span>
          <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {date}</span>
          <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {comments.length}</span>
        </div>
        <div className="prose max-w-none text-gray-700">{post.content.split('\n').map((p, i) => <p key={i}>{p}</p>)}</div>

        {user && user.id === post.author_id && (
          <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
            <Link to={`/edit/${post.id}`} className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700">
              <Edit3 className="w-4 h-4" /> Edit
            </Link>
            <button onClick={handleDelete} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </article>

      <section className="bg-white rounded-xl border border-gray-200 p-8">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Comments ({comments.length})</h2>

        {user ? (
          <form onSubmit={handleComment} className="mb-8">
            <textarea value={commentText} onChange={e => setCommentText(e.target.value)} rows={3} required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-sm" placeholder="Write a comment..." />
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={sending || !commentText.trim()}
                className="px-5 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50">
                {sending ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-500">
            <Link to="/login" className="text-indigo-600 hover:underline font-medium">Sign in</Link> to leave a comment
          </div>
        )}

        {comments.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No comments yet. Be the first!</p>
        ) : (
          <div className="space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{comment.author_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</span>
                    {user && user.id === comment.author_id && (
                      <button onClick={() => handleDeleteComment(comment.id)} className="text-gray-400 hover:text-red-500">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
