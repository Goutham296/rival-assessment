'use client';
import { useState, useEffect } from 'react';
import { blogsApi } from '@/lib/api';
import type { Blog } from '@/types';
import toast from 'react-hot-toast';

interface Props {
  blog?: Blog;
  onClose: () => void;
  onSaved: () => void;
}

export function BlogEditor({ blog, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(blog?.title ?? '');
  const [content, setContent] = useState(blog?.content ?? '');
  const [isPublished, setIsPublished] = useState(blog?.isPublished ?? false);
  const [loading, setLoading] = useState(false);

  const isEditing = !!blog;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error('Title and content are required');
      return;
    }
    setLoading(true);
    try {
      if (isEditing) {
        await blogsApi.update(blog.id, { title, content, isPublished });
        toast.success('Post updated!');
      } else {
        await blogsApi.create({ title, content, isPublished });
        toast.success('Post created!');
      }
      onSaved();
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {isEditing ? 'Edit Post' : 'New Post'}
        </h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">
          ×
        </button>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Your post title"
            required
            maxLength={200}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="input resize-y font-mono text-sm"
            placeholder="Write your post content here…"
            required
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublished}
              onChange={(e) => setIsPublished(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              Publish immediately
            </span>
          </label>

          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
