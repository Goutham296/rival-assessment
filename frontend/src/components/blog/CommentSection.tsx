'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { commentsApi } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';

export function CommentSection({ blogId }: { blogId: string }) {
  const [content, setContent] = useState('');
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['comments', blogId],
    queryFn: () => commentsApi.list(blogId),
  });

  const mutation = useMutation({
    mutationFn: (content: string) => commentsApi.create(blogId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', blogId] });
      setContent('');
    },
  });

  const comments = data?.data  ?? [];
  const total = data?.total ?? 0;

  return (
    <section className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Comments ({total})</h3>

      {isAuthenticated && (
        <div className="mb-6">
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="Write a comment..."
            className="w-full border rounded p-2 text-sm"
            rows={3}
          />
          <button
            onClick={() => content.trim() && mutation.mutate(content)}
            disabled={mutation.isPending}
            className="mt-2 px-4 py-1 bg-black text-white rounded text-sm"
          >
            {mutation.isPending ? 'Posting...' : 'Post'}
          </button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map((c: any) => (
          <div key={c.id} className="border-b pb-3">
            <p className="text-sm font-medium">{c.user?.name ?? c.user?.email}</p>
            <p className="text-sm mt-1">{c.content}</p>
            <p className="text-xs text-gray-400 mt-1">
              {new Date(c.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
