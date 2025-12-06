'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authApi } from '@/lib/api';
import { useAuth, AuthProvider } from '@/lib/auth-context';

type TabType = 'signin' | 'signup';
type RoleType = 'patient' | 'doctor';

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, user } = useAuth();
  
  const [currentTab, setCurrentTab] = useState<TabType>('signin');
  const [selectedRole, setSelectedRole] = useState<RoleType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirm_password: '',
    doctor_id: '',
  });

  useEffect(() => {
    // Redirect if already logged in
    if (user) {
      router.push('/');
    }
    
    // Check URL params
    const mode = searchParams.get('mode');
    const role = searchParams.get('role');
    
    if (mode === 'signup') {
      setCurrentTab('signup');
    }
    if (role === 'patient' || role === 'doctor') {
      setSelectedRole(role);
    }
  }, [searchParams, user, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    
    setError(null);
    setIsLoading(true);

    try {
      if (currentTab === 'signin') {
        const response = await authApi.login({
          email: formData.email,
          password: formData.password,
          role: selectedRole,
        });
        login(response.token, response.user);
        router.push('/');
      } else {
        if (formData.password !== formData.confirm_password) {
          setError('Passwords do not match');
          setIsLoading(false);
          return;
        }
        const response = await authApi.signup({
          full_name: formData.full_name,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirm_password,
          role: selectedRole,
          doctor_id: selectedRole === 'patient' ? formData.doctor_id : undefined,
        });
        login(response.token, response.user);
        router.push('/');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetToRoleSelection = () => {
    setSelectedRole(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400">
      {/* Navbar */}
      <nav className="py-5">
        <div className="max-w-7xl mx-auto px-5 flex justify-between items-center">
          <Link href="/" className="flex items-center font-bold text-xl text-slate-800">
            <span className="text-red-500 mr-2 text-2xl">
              <i className="fas fa-heart"></i>
            </span>
            CardioGuard Assistant
          </Link>
          <Link 
            href="/" 
            className="text-slate-600 font-medium text-sm px-4 py-2 rounded-md border border-slate-300 bg-white hover:bg-slate-50 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </nav>

      {/* Auth Card */}
      <main className="flex justify-center items-center min-h-[calc(100vh-120px)] px-5 pb-10">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 mx-6 mt-6 rounded-lg">
            <button
              type="button"
              onClick={() => { setCurrentTab('signin'); resetToRoleSelection(); }}
              className={`flex-1 py-2.5 px-5 rounded-lg font-medium text-sm transition-all ${
                currentTab === 'signin'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setCurrentTab('signup'); resetToRoleSelection(); }}
              className={`flex-1 py-2.5 px-5 rounded-lg font-medium text-sm transition-all ${
                currentTab === 'signup'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-primary">
                {currentTab === 'signin' ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                {currentTab === 'signin' ? 'Sign in to your account' : 'Join CardioGuard AI today'}
              </p>
            </div>

            {/* Role Selection */}
            {!selectedRole ? (
              <div className="text-center animate-fadeIn">
                <p className="text-slate-500 text-sm mb-4">I am a:</p>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('patient')}
                    className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center hover:border-slate-400 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-12 h-12 bg-blue-100 text-accent-blue rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-user text-xl"></i>
                    </div>
                    <h3 className="font-semibold text-primary">Patient</h3>
                    <p className="text-xs text-slate-500 mt-1">Get health assessments</p>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setSelectedRole('doctor')}
                    className="bg-white border-2 border-slate-200 rounded-xl p-6 text-center hover:border-slate-400 hover:-translate-y-0.5 transition-all"
                  >
                    <div className="w-12 h-12 bg-purple-100 text-accent-purple rounded-full flex items-center justify-center mx-auto mb-3">
                      <i className="fas fa-stethoscope text-xl"></i>
                    </div>
                    <h3 className="font-semibold text-primary">Doctor</h3>
                    <p className="text-xs text-slate-500 mt-1">Manage patient care</p>
                  </button>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                {/* Role Indicator */}
                <div className="flex items-center justify-between mb-5">
                  <span className="flex items-center gap-2 text-slate-500 text-sm">
                    <i className={`fas ${selectedRole === 'patient' ? 'fa-user' : 'fa-stethoscope'}`}></i>
                    {currentTab === 'signin' ? 'Signing in' : 'Signing up'} as {selectedRole === 'patient' ? 'Patient' : 'Doctor'}
                  </span>
                  <button
                    type="button"
                    onClick={resetToRoleSelection}
                    className="text-accent-blue text-sm font-medium hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {currentTab === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        required
                        className="input-field"
                      />
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      required
                      className="input-field"
                    />
                  </div>

                  {currentTab === 'signup' && selectedRole === 'patient' && (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">
                        Doctor ID <span className="text-slate-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="text"
                        name="doctor_id"
                        value={formData.doctor_id}
                        onChange={handleInputChange}
                        placeholder="Enter your doctor's license number"
                        className="input-field"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-primary mb-1.5">Password</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder={currentTab === 'signin' ? 'Enter your password' : 'Create a password'}
                      required
                      className="input-field"
                    />
                  </div>

                  {currentTab === 'signup' && (
                    <div>
                      <label className="block text-sm font-medium text-primary mb-1.5">Confirm Password</label>
                      <input
                        type="password"
                        name="confirm_password"
                        value={formData.confirm_password}
                        onChange={handleInputChange}
                        placeholder="Confirm your password"
                        required
                        className="input-field"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-primary text-white py-3.5 rounded-lg font-medium hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {isLoading ? 'Please wait...' : (currentTab === 'signin' ? 'Sign In' : 'Create Account')}
                  </button>
                </form>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
}

function AuthContent() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    }>
      <AuthForm />
    </Suspense>
  );
}

export default function AuthPage() {
  return (
    <AuthProvider>
      <AuthContent />
    </AuthProvider>
  );
}

