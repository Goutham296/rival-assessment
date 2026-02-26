'use client';
import { useState } from 'react';
import { likesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props {
  blogId: string;
  initialCount: number;
  initialLiked?: boolean;
}

export function LikeButton({ blogId, initialCount, initialLiked = false }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const toggle = async () => {
    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }
    if (loading) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));
    setLoading(true);

    try {
      const res = wasLiked
        ? await likesApi.unlike(blogId)
        : await likesApi.like(blogId);
      setCount(res.likeCount);
      setLiked(res.liked);
    } catch {
      // Rollback on error
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
        liked
          ? 'bg-red-50 text-red-600 border border-red-200'
          : 'bg-gray-50 text-gray-500 border border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200'
      }`}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}
