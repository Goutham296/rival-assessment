'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/hooks/useAuth';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuthStore();
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setLoading(true);
    try { await register(email, password, name); toast.success('Account created! Welcome 🎉'); router.push('/dashboard'); }
    catch (err: any) { toast.error(err?.response?.data?.message ?? 'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--cream)', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '420px', background: 'var(--white)', border: '1px solid var(--border)', borderRadius: '24px', padding: '48px 40px', boxShadow: '0 8px 40px rgba(0,0,0,0.06)', animation: 'fadeUp 0.4s ease' }}>
        <Link href="/feed" style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: '700', color: 'var(--ink)', textDecoration: 'none', display: 'block', marginBottom: '32px' }}>Rival<span style={{ color: 'var(--accent)' }}>.</span></Link>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '28px', fontWeight: '700', color: 'var(--ink)', marginBottom: '6px' }}>Create account</h1>
        <p style={{ fontSize: '14px', color: 'var(--ink-muted)', marginBottom: '32px' }}>Start writing and sharing your ideas</p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', marginBottom: '6px' }}>Name <span style={{ color: 'var(--ink-muted)', fontWeight: '400' }}>(optional)</span></label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="input" placeholder="Your name" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', marginBottom: '6px' }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="input" placeholder="you@example.com" required />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: 'var(--ink)', marginBottom: '6px' }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" placeholder="Min. 8 characters" minLength={8} required />
          </div>
          <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px', marginTop: '4px', borderRadius: '12px' }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
        <p style={{ fontSize: '13px', textAlign: 'center', color: 'var(--ink-muted)', marginTop: '24px' }}>
          Already have an account? <Link href="/auth/login" style={{ color: 'var(--accent)', fontWeight: '600', textDecoration: 'none' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
