'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = () => { logout(); router.push('/feed'); };

  return (
    <nav style={{ background: 'rgba(250,249,247,0.92)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '860px', margin: '0 auto', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/feed" style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: '700', color: 'var(--ink)', textDecoration: 'none', letterSpacing: '-0.5px' }}>
          Rival<span style={{ color: 'var(--accent)' }}>.</span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link href="/feed" style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: '500', color: 'var(--ink-light)', textDecoration: 'none' }}>Feed</Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: '500', color: 'var(--ink-light)', textDecoration: 'none' }}>Dashboard</Link>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--accent)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '600', marginLeft: '4px' }}>
                {(user?.name ?? user?.email ?? 'U')[0].toUpperCase()}
              </div>
              <button onClick={handleLogout} className="btn-secondary" style={{ padding: '6px 16px', fontSize: '13px' }}>Logout</button>
            </>
          ) : (
            <>
              <Link href="/auth/login" style={{ padding: '6px 14px', borderRadius: '999px', fontSize: '14px', fontWeight: '500', color: 'var(--ink-light)', textDecoration: 'none' }}>Login</Link>
              <Link href="/auth/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '13px' }}>Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
