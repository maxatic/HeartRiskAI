'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'bg-white/80 backdrop-blur-xl shadow-lg py-3' 
        : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg group-hover:shadow-rose-500/30 transition-all duration-300 ${scrolled ? '' : 'shadow-rose-500/20'}`}>
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
          </div>
          <span className={`font-bold text-xl transition-colors duration-300 ${scrolled ? 'text-slate-800' : 'text-slate-800'}`} style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            CardioGuard
          </span>
        </Link>
        
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <div className="flex items-center gap-2 text-slate-600 font-medium text-sm px-4 py-2.5 bg-slate-50/80 backdrop-blur-sm rounded-xl border border-slate-200/50">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                  {(user.full_name || user.email).charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline">{user.full_name || user.email}</span>
                {user.role === 'doctor' ? (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-600 font-semibold uppercase tracking-wide">
                    Doctor
                  </span>
                ) : (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-600 font-semibold uppercase tracking-wide">
                    Patient
                  </span>
                )}
              </div>
              <Link 
                href="/predict" 
                className="hidden sm:inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Assessment
              </Link>
              <button 
                onClick={logout} 
                className="text-slate-600 hover:text-slate-900 px-4 py-2.5 font-medium text-sm transition-colors"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link 
                href="/auth" 
                className={`hidden sm:inline-block px-5 py-2.5 font-medium text-sm transition-colors ${scrolled ? 'text-slate-600 hover:text-slate-900' : 'text-slate-700 hover:text-slate-900'}`}
              >
                Login
              </Link>
              <Link 
                href="/predict" 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium text-sm hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-300"
              >
                Get Started
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
