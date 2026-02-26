'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/hooks/useAuth';

export function Navbar() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/feed');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/feed" className="font-bold text-indigo-600 text-lg">
          Rival Blog
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/feed" className="text-gray-600 hover:text-gray-900">
            Feed
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
              <span className="text-gray-400">|</span>
              <span className="text-gray-600">{user?.name ?? user?.email}</span>
              <button onClick={handleLogout} className="btn-secondary text-xs py-1">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                Login
              </Link>
              <Link href="/auth/register" className="btn-primary text-xs py-1.5">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
