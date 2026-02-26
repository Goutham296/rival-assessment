import Link from 'next/link';
import type { Blog } from '@/types';

interface Props {
  blog: Blog;
  showActions?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onTogglePublish?: () => void;
}

export function BlogCard({ blog, showActions, onEdit, onDelete, onTogglePublish }: Props) {
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <article className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {blog.isPublished !== undefined && (
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  blog.isPublished
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {blog.isPublished ? 'Published' : 'Draft'}
              </span>
            )}
            <time className="text-xs text-gray-400">{date}</time>
          </div>

          <Link href={`/blog/${blog.slug}`}>
            <h2 className="text-lg font-semibold text-gray-900 hover:text-indigo-600 transition-colors truncate">
              {blog.title}
            </h2>
          </Link>

          {blog.summary && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{blog.summary}</p>
          )}

          {blog.user && (
            <p className="text-xs text-gray-400 mt-2">
              by {blog.user.name ?? blog.user.email}
            </p>
          )}
        </div>

        {blog._count && (
          <div className="flex gap-3 text-xs text-gray-400 shrink-0">
            <span>♥ {blog._count.likes}</span>
            <span>💬 {blog._count.comments}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
          <button onClick={onEdit} className="btn-secondary text-xs py-1">
            Edit
          </button>
          <button
            onClick={onTogglePublish}
            className="btn-secondary text-xs py-1"
          >
            {blog.isPublished ? 'Unpublish' : 'Publish'}
          </button>
          <button
            onClick={onDelete}
            className="text-xs px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </article>
  );
}
