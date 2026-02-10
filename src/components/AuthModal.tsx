'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Chrome } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultView?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultView = 'signin' }: AuthModalProps) {
  const [view, setView] = useState<'signin' | 'signup' | 'reset'>(defaultView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (view === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        onClose();
      } else if (view === 'signup') {
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        setMessage('Check your email to confirm your account!');
      } else if (view === 'reset') {
        const { error } = await resetPassword(email);
        if (error) throw error;
        setMessage('Password reset link sent to your email!');
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
    // No need to close modal or stop loading - redirect happens
  };

  const switchView = (newView: 'signin' | 'signup' | 'reset') => {
    setView(newView);
    setError('');
    setMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-2xl shadow-2xl animate-fade-in">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
              {view === 'signin' && 'Welcome Back'}
              {view === 'signup' && 'Create Account'}
              {view === 'reset' && 'Reset Password'}
            </h2>
            <p className="text-[var(--text-secondary)] text-sm">
              {view === 'signin' && 'Sign in to access your research papers'}
              {view === 'signup' && 'Start generating research papers today'}
              {view === 'reset' && 'Enter your email to receive a reset link'}
            </p>
          </div>

          {/* Error / Success Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="mb-4 p-3 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] text-sm">
              {message}
            </div>
          )}

          {/* Google Sign In */}
          {view !== 'reset' && (
            <>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] font-medium hover:bg-[var(--bg-primary)] transition-all disabled:opacity-50"
              >
                <Chrome className="w-5 h-5 text-[var(--accent-indigo)]" />
                Continue with Google
              </button>

              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-[var(--border-default)]" />
                <span className="text-[var(--text-tertiary)] text-sm">or</span>
                <div className="flex-1 h-px bg-[var(--border-default)]" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
                    required={view === 'signup'}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
                  required
                />
              </div>
            </div>

            {view !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-indigo)] to-[var(--accent-purple)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {isLoading && <Loader2 className="w-5 h-5 animate-spin" />}
              {view === 'signin' && 'Sign In'}
              {view === 'signup' && 'Create Account'}
              {view === 'reset' && 'Send Reset Link'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm">
            {view === 'signin' && (
              <>
                <button
                  onClick={() => switchView('reset')}
                  className="text-[var(--accent-indigo-light)] hover:underline"
                >
                  Forgot password?
                </button>
                <p className="mt-4 text-[var(--text-secondary)]">
                  Don&apos;t have an account?{' '}
                  <button
                    onClick={() => switchView('signup')}
                    className="text-[var(--accent-indigo-light)] hover:underline font-medium"
                  >
                    Sign up
                  </button>
                </p>
              </>
            )}
            {view === 'signup' && (
              <p className="text-[var(--text-secondary)]">
                Already have an account?{' '}
                <button
                  onClick={() => switchView('signin')}
                  className="text-[var(--accent-indigo-light)] hover:underline font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
            {view === 'reset' && (
              <button
                onClick={() => switchView('signin')}
                className="text-[var(--accent-indigo-light)] hover:underline"
              >
                Back to sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
