'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-100 py-4">
      <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
        <Link href="/" className="flex items-center font-bold text-xl text-slate-800">
          <span className="text-red-500 mr-2 text-2xl">
            <i className="fas fa-heart"></i>
          </span>
          CardioGuard Assistant
        </Link>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <span className="flex items-center gap-2 text-slate-600 font-medium text-sm px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <i className="fas fa-user-circle text-accent-blue"></i>
                {user.full_name || user.email}
                {user.role === 'doctor' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-semibold uppercase tracking-wide">
                    Doctor
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold uppercase tracking-wide">
                    Patient
                  </span>
                )}
              </span>
              <Link href="/predict" className="btn-dark">
                Risk Assessment
              </Link>
              <button onClick={logout} className="btn-light">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/predict" className="btn-dark">
                Get Started
              </Link>
              <Link href="/auth" className="btn-light">
                Login
              </Link>
              <Link href="/auth?mode=signup" className="btn-dark">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

