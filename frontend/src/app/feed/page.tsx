'use client';
import { useState, useCallback } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import InfiniteScroll from 'react-infinite-scroll-component';
import { publicApi } from '@/lib/api';
import { BlogCard } from '@/components/blog/BlogCard';
import { Navbar } from '@/components/layout/Navbar';
import type { Blog } from '@/types';

export default function FeedPage() {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery({
      queryKey: ['feed'],
      queryFn: ({ pageParam = 1 }) => publicApi.getFeed(pageParam as number),
      getNextPageParam: (last) =>
        last.meta.hasNext ? last.meta.page + 1 : undefined,
      initialPageParam: 1,
    });

  const blogs: Blog[] = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <>
      <Navbar />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Latest Posts</h1>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
                <div className="h-3 bg-gray-100 rounded w-full mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="card p-8 text-center">
            <p className="text-red-500">Failed to load feed. Please try again.</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="card p-12 text-center">
            <p className="text-4xl mb-3">✍️</p>
            <p className="text-gray-500">No posts yet. Be the first to publish!</p>
          </div>
        ) : (
          <InfiniteScroll
            dataLength={blogs.length}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            loader={
              <div className="mt-4 card p-6 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            }
            endMessage={
              <p className="text-center text-gray-400 text-sm mt-6">
                You've seen all posts 🎉
              </p>
            }
          >
            <div className="space-y-4">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>
          </InfiniteScroll>
        )}
      </main>
    </>
  );
}
