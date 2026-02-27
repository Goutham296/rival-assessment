'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api';
import { useAuthStore } from '@/lib/hooks/useAuth';

export function CommentSection({ blogId }: { blogId: string }) {
  const [content, setContent] = useState('');
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data } = useQuery({ queryKey: ['comments', blogId], queryFn: () => commentsApi.list(blogId) });
  const mutation = useMutation({
    mutationFn: (content: string) => commentsApi.create(blogId, content),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['comments', blogId] }); setContent(''); },
  });

  const comments = data?.comments ?? [];
  const total = data?.total ?? 0;

  return (
    <section>
      <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '600', color: 'var(--ink)', marginBottom: '24px' }}>
        Comments {total > 0 && <span style={{ fontSize: '16px', color: 'var(--ink-muted)', fontFamily: 'DM Sans' }}>({total})</span>}
      </h3>
      {isAuthenticated && (
        <div style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', marginBottom: '28px' }}>
          <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Share your thoughts..." rows={3} className="input" style={{ resize: 'none', marginBottom: '12px', borderRadius: '10px' }} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={() => content.trim() && mutation.mutate(content)} disabled={mutation.isPending || !content.trim()} className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>
              {mutation.isPending ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </div>
      )}
      {comments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--ink-muted)', fontSize: '15px' }}>
          <div style={{ fontSize: '32px', marginBottom: '12px' }}>💬</div>
          No comments yet. {isAuthenticated ? 'Be the first!' : 'Sign in to comment.'}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {comments.map((c: any) => (
            <div key={c.id} style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '14px', padding: '18px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #f0946b)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '600', flexShrink: 0 }}>
                  {(c.user?.name ?? c.user?.email ?? 'U')[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--ink)' }}>{c.user?.name ?? c.user?.email}</div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)' }}>{new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                </div>
              </div>
              <p style={{ fontSize: '14px', color: 'var(--ink-light)', lineHeight: '1.6', margin: 0 }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
