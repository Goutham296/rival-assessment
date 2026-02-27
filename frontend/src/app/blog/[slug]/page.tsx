'use client';
import { use } from 'react';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '@/lib/api';
import { LikeButton } from '@/components/blog/LikeButton';
import { CommentSection } from '@/components/blog/CommentSection';
import { Navbar } from '@/components/layout/Navbar';
import Link from 'next/link';

export default function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { data: blog, isLoading, isError } = useQuery({ queryKey: ['blog', slug], queryFn: () => publicApi.getBlogBySlug(slug), retry: false });
  const date = blog ? new Date(blog.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '';

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <Link href="/feed" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--ink-muted)', textDecoration: 'none', marginBottom: '40px' }}>← Back to feed</Link>
        {isLoading ? (
          <div>
            <div style={{ height: '48px', background: '#f0f0f5', borderRadius: '8px', width: '70%', marginBottom: '16px' }} />
            <div style={{ height: '16px', background: '#f5f5f8', borderRadius: '4px', width: '30%', marginBottom: '40px' }} />
          </div>
        ) : isError || !blog ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '64px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
            <p style={{ color: 'var(--ink-muted)', marginBottom: '20px' }}>Blog not found or not published yet.</p>
            <Link href="/feed" className="btn-primary" style={{ display: 'inline-flex' }}>← Back to feed</Link>
          </div>
        ) : (
          <article className="animate-fade-up">
            <header style={{ marginBottom: '40px' }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: '700', color: 'var(--ink)', lineHeight: '1.15', marginBottom: '20px', letterSpacing: '-0.5px' }}>{blog.title}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '24px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '600', flexShrink: 0 }}>
                  {(blog.user?.name ?? blog.user?.email ?? 'A')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--ink)' }}>{blog.user?.name ?? blog.user?.email}</div>
                  <time style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>{date}</time>
                </div>
              </div>
            </header>
            <div style={{ fontSize: '17px', lineHeight: '1.8', color: 'var(--ink-light)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginBottom: '48px' }}>{blog.content}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '20px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '48px' }}>
              <LikeButton blogId={blog.id} initialCount={blog._count?.likes ?? 0} />
              <span style={{ fontSize: '14px', color: 'var(--ink-muted)' }}>💬 {blog._count?.comments ?? 0} comments</span>
            </div>
            <CommentSection blogId={blog.id} />
          </article>
        )}
      </main>
    </>
  );
}
