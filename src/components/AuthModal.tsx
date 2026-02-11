'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Chrome, AlertCircle } from 'lucide-react';
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

  const getErrorMessage = (error: any): string => {
    const errorCode = error?.code || error?.message || '';
    
    // Map Supabase errors to friendly messages
    if (errorCode.includes('invalid_credentials') || errorCode.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials or sign up if you don\'t have an account.';
    }
    if (errorCode.includes('user_not_found')) {
      return 'No account found with this email. Please sign up first.';
    }
    if (errorCode.includes('email_taken') || errorCode.includes('already registered')) {
      return 'An account with this email already exists. Please sign in instead.';
    }
    if (errorCode.includes('weak_password')) {
      return 'Password is too weak. Please use at least 6 characters.';
    }
    if (errorCode.includes('invalid_email')) {
      return 'Please enter a valid email address.';
    }
    if (errorCode.includes('email_not_confirmed')) {
      return 'Please check your email and confirm your account before signing in.';
    }
    
    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (view === 'signin') {
        const { error } = await signIn(email, password);
        if (error) {
          const friendlyError = getErrorMessage(error);
          setError(friendlyError);
          // If user not found, suggest signup
          if (friendlyError.includes('No account found') || friendlyError.includes('Invalid email or password')) {
            setTimeout(() => {
              if (confirm('Don\'t have an account? Click OK to sign up.')) {
                switchView('signup');
              }
            }, 500);
          }
          return;
        }
        onClose();
      } else if (view === 'signup') {
        // Validate inputs
        if (!email || !password) {
          setError('Please enter both email and password.');
          return;
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          return;
        }
        
        const { error } = await signUp(email, password, fullName);
        if (error) {
          const friendlyError = getErrorMessage(error);
          setError(friendlyError);
          // If email exists, suggest signin
          if (friendlyError.includes('already exists')) {
            setTimeout(() => {
              if (confirm('Already have an account? Click OK to sign in.')) {
                switchView('signin');
              }
            }, 500);
          }
          return;
        }
        setMessage('Account created successfully! You can now sign in.');
        // Auto switch to signin after 2 seconds
        setTimeout(() => {
          switchView('signin');
        }, 2000);
      } else if (view === 'reset') {
        if (!email) {
          setError('Please enter your email address.');
          return;
        }
        const { error } = await resetPassword(email);
        if (error) {
          setError(getErrorMessage(error));
          return;
        }
        setMessage('Password reset link sent! Check your email.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(getErrorMessage(error));
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

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-[var(--error)]/10 border border-[var(--error)]/20 text-[var(--error)] text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div className="mb-4 p-4 rounded-xl bg-[var(--success)]/10 border border-[var(--success)]/20 text-[var(--success)] text-sm">
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
                  Full Name (optional)
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)] transition-colors"
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
                    minLength={view === 'signup' ? 6 : undefined}
                  />
                </div>
                {view === 'signup' && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1">
                    Must be at least 6 characters
                  </p>
                )}
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
                  className="text-[var(--accent-indigo-light)] hover:underline mb-4 block mx-auto"
                >
                  Forgot password?
                </button>
                <p className="text-[var(--text-secondary)]">
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
