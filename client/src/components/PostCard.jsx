import { Link } from 'react-router-dom';
import { Clock, MessageSquare, User } from 'lucide-react';

export default function PostCard({ post }) {
  const date = new Date(post.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <Link to={`/post/${post.id}`} className="block bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-all hover:border-indigo-200">
      <h2 className="text-lg font-bold text-gray-900 mb-2 hover:text-indigo-600 transition-colors">{post.title}</h2>
      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{post.excerpt || post.content?.substring(0, 150)}</p>
      <div className="flex items-center gap-4 text-xs text-gray-400">
        <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {post.author_name}</span>
        <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {date}</span>
        <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {post.comment_count || 0}</span>
      </div>
    </Link>
  );
}
