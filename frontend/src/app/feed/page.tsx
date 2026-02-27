'use client';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { publicApi } from '@/lib/api';
import { BlogCard } from '@/components/blog/BlogCard';
import { Navbar } from '@/components/layout/Navbar';
import type { Blog } from '@/types';

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isLoading, isError } = useInfiniteQuery({
    queryKey: ['feed'],
    queryFn: ({ pageParam = 1 }) => publicApi.getFeed(pageParam as number),
    getNextPageParam: (last) => last.meta.hasNext ? last.meta.page + 1 : undefined,
    initialPageParam: 1,
  });
  const blogs: Blog[] = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <>
      <Navbar />
      <div style={{ borderBottom: '1px solid var(--border)', background: 'var(--white)', padding: '48px 24px', textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(32px, 6vw, 54px)', fontWeight: '700', color: 'var(--ink)', letterSpacing: '-1px', marginBottom: '12px' }}>
          Ideas worth reading<span style={{ color: 'var(--accent)' }}>.</span>
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--ink-muted)', maxWidth: '480px', margin: '0 auto' }}>Discover thoughtful stories and perspectives from writers around the world.</p>
      </div>
      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 24px 80px' }}>
        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1,2,3].map(i => (
              <div key={i} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ height: '12px', background: '#f0f0f5', borderRadius: '4px', width: '25%', marginBottom: '16px' }} />
                <div style={{ height: '22px', background: '#ebebf0', borderRadius: '6px', width: '70%', marginBottom: '10px' }} />
                <div style={{ height: '14px', background: '#f5f5f8', borderRadius: '4px', width: '90%' }} />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '48px', textAlign: 'center', color: '#c0392b' }}>Failed to load feed.</div>
        ) : blogs.length === 0 ? (
          <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '72px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✍️</div>
            <p style={{ color: 'var(--ink-muted)', fontSize: '16px' }}>No posts yet. Be the first to publish!</p>
          </div>
        ) : (
          <InfiniteScroll dataLength={blogs.length} next={fetchNextPage} hasMore={hasNextPage ?? false}
            loader={<div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', marginTop: '16px' }}><div style={{ height: '14px', background: '#f0f0f5', borderRadius: '4px', width: '60%' }} /></div>}
            endMessage={<p style={{ textAlign: 'center', color: 'var(--ink-muted)', fontSize: '13px', marginTop: '32px' }}>You've read everything 🎉</p>}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {blogs.map(blog => <BlogCard key={blog.id} blog={blog} />)}
            </div>
          </InfiniteScroll>
        )}
      </main>
    </>
  );
}
