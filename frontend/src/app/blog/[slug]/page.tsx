'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { LikeButton } from '@/components/blog/LikeButton';
import { CommentSection } from '@/components/blog/CommentSection';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function BlogPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);

  const { data: blog, isLoading, isError } = useQuery({
    queryKey: ['blog', slug],
    queryFn: () => publicApi.getBlogBySlug(slug),
  });

  const date = blog
    ? new Date(blog.createdAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/feed" className="text-sm text-indigo-600 hover:underline mb-6 block">
          ← Back to feed
        </Link>

        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-100 rounded w-1/3" />
            <div className="space-y-2 mt-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-4 bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        ) : isError ? (
          <div className="card p-8 text-center">
            <p className="text-gray-500">Blog not found or not published.</p>
          </div>
        ) : blog ? (
          <article>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{blog.title}</h1>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-8">
              <span>{blog.user?.name ?? blog.user?.email}</span>
              <span>·</span>
              <time>{date}</time>
            </div>

            <div
              className="prose prose-gray max-w-none text-gray-700 leading-relaxed"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {blog.content}
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center gap-3">
              <LikeButton
                blogId={blog.id}
                initialCount={blog._count?.likes ?? 0}
              />
              <span className="text-sm text-gray-400">
                {blog._count?.comments ?? 0} comments
              </span>
            </div>

            <CommentSection blogId={blog.id} />
          </article>
        ) : null}
      </main>
    </>
  );
}
