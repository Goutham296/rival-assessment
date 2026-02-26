'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { blogsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/hooks/useAuth';
import { BlogCard } from '@/components/blog/BlogCard';
import { Navbar } from '@/components/layout/Navbar';
import { BlogEditor } from '@/components/blog/BlogEditor';
import toast from 'react-hot-toast';
import type { Blog } from '@/types';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuthStore();
  const router = useRouter();
  const qc = useQueryClient();
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const { data: blogs, isLoading } = useQuery({
    queryKey: ['my-blogs'],
    queryFn: blogsApi.list,
    enabled: isAuthenticated,
  });

  const deleteMutation = useMutation({
    mutationFn: blogsApi.delete,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-blogs'] });
      toast.success('Blog deleted');
    },
    onError: () => toast.error('Failed to delete'),
  });

  const togglePublish = useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      blogsApi.update(id, { isPublished: !isPublished }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-blogs'] });
      toast.success('Updated');
    },
  });

  if (authLoading || !isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-40" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={() => { setEditingBlog(null); setShowEditor(true); }}
            className="btn-primary"
          >
            + New Post
          </button>
        </div>

        {showEditor && (
          <div className="mb-6">
            <BlogEditor
              blog={editingBlog ?? undefined}
              onClose={() => { setShowEditor(false); setEditingBlog(null); }}
              onSaved={() => {
                qc.invalidateQueries({ queryKey: ['my-blogs'] });
                setShowEditor(false);
                setEditingBlog(null);
              }}
            />
          </div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : blogs?.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">📝</p>
            <p className="text-gray-500 mb-4">No posts yet. Create your first one!</p>
            <button
              onClick={() => setShowEditor(true)}
              className="btn-primary"
            >
              Write something
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {blogs?.map((blog) => (
              <BlogCard
                key={blog.id}
                blog={blog}
                showActions
                onEdit={() => { setEditingBlog(blog); setShowEditor(true); }}
                onDelete={() => {
                  if (confirm('Delete this post?')) deleteMutation.mutate(blog.id);
                }}
                onTogglePublish={() =>
                  togglePublish.mutate({ id: blog.id, isPublished: blog.isPublished })
                }
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}
