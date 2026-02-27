import Link from 'next/link';
import type { Blog } from '@/types';

interface Props { blog: Blog; showActions?: boolean; onEdit?: () => void; onDelete?: () => void; onTogglePublish?: () => void; }

export function BlogCard({ blog, showActions, onEdit, onDelete, onTogglePublish }: Props) {
  const date = new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return (
    <article style={{ background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', transition: 'all 0.2s ease' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 30px rgba(0,0,0,0.08)'; (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; (e.currentTarget as HTMLElement).style.transform = 'translateY(0)'; }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            {blog.isPublished !== undefined && <span className={blog.isPublished ? 'badge-published' : 'badge-draft'}>{blog.isPublished ? '● Published' : '○ Draft'}</span>}
            {blog.user && <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{blog.user.name ?? blog.user.email}</span>}
            <span style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>·</span>
            <time style={{ fontSize: '12px', color: 'var(--ink-muted)' }}>{date}</time>
          </div>
          <Link href={`/blog/${blog.slug}`} style={{ textDecoration: 'none' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: '600', color: 'var(--ink)', marginBottom: '8px', lineHeight: '1.3', transition: 'color 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.color = 'var(--accent)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'var(--ink)')}>{blog.title}</h2>
          </Link>
          {blog.summary && <p style={{ fontSize: '14px', color: 'var(--ink-light)', lineHeight: '1.6', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{blog.summary}</p>}
        </div>
        {blog._count && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px', flexShrink: 0 }}>
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}><span style={{ color: '#e8542a' }}>♥</span> {blog._count.likes}</span>
            <span style={{ fontSize: '13px', color: 'var(--ink-muted)' }}>💬 {blog._count.comments}</span>
          </div>
        )}
      </div>
      {showActions && (
        <div style={{ display: 'flex', gap: '8px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <button onClick={onEdit} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>Edit</button>
          <button onClick={onTogglePublish} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>{blog.isPublished ? 'Unpublish' : 'Publish'}</button>
          <button onClick={onDelete} className="btn-danger" style={{ padding: '6px 16px', fontSize: '13px' }}>Delete</button>
        </div>
      )}
    </article>
  );
}
