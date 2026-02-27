'use client';
import { useState } from 'react';
import { likesApi } from '@/lib/api';
import { useAuthStore } from '@/lib/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface Props { blogId: string; initialCount: number; initialLiked?: boolean; }

export function LikeButton({ blogId, initialCount, initialLiked = false }: Props) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  const toggle = async () => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (loading) return;
    const wasLiked = liked;
    setLiked(!wasLiked);
    setCount((c) => (wasLiked ? c - 1 : c + 1));
    setLoading(true);
    try {
      const res = wasLiked ? await likesApi.unlike(blogId) : await likesApi.like(blogId);
      setCount(res.likeCount);
      setLiked(res.liked);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg = err?.response?.data?.message ?? '';
      // Already liked → treat as liked state
      if (status === 409 || msg === 'Already liked') {
        setLiked(true);
      } else {
        // Rollback
        setLiked(wasLiked);
        setCount((c) => (wasLiked ? c + 1 : c - 1));
        toast.error('Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={toggle} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 18px', borderRadius: '999px', fontSize: '14px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s ease', border: liked ? '2px solid #e8542a' : '2px solid var(--border)', background: liked ? 'var(--accent-light)' : 'var(--white)', color: liked ? 'var(--accent)' : 'var(--ink-muted)' }}>
      <span style={{ fontSize: '16px' }}>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  );
}
