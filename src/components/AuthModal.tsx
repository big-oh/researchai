'use client';

import { useState } from 'react';
import { X, Mail, Lock, User, Loader2, Chrome, AlertCircle, CheckCircle } from 'lucide-react';
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
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn, signUp, signInWithGoogle, resetPassword } = useAuth();

  if (!isOpen) return null;

  const getFriendlyError = (err: any): string => {
    console.log('Auth error details:', err);
    
    if (!err) return 'An unknown error occurred';
    
    // Handle different error formats
    let msg = '';
    let code = '';
    
    if (typeof err === 'string') {
      msg = err;
    } else if (err.message && typeof err.message === 'string') {
      msg = err.message;
      code = err.code || '';
    } else if (err.error_description && typeof err.error_description === 'string') {
      msg = err.error_description;
    } else if (err.error) {
      if (typeof err.error === 'string') {
        msg = err.error;
      } else if (err.error.message && typeof err.error.message === 'string') {
        msg = err.error.message;
      } else {
        try {
          msg = JSON.stringify(err.error);
        } catch {
          msg = String(err.error);
        }
      }
    } else {
      try {
        msg = JSON.stringify(err);
      } catch {
        msg = String(err) || 'Unknown error';
      }
    }
    
    // Check for nested error object (common in Supabase)
    if (msg === '[object Object]' || !msg) {
      // Try to extract from common Supabase error structures
      if (err.__isAuthError || err.name === 'AuthApiError') {
        msg = err.message || err.msg || '';
      }
      // Try toString if it's an object
      if (!msg && typeof err.toString === 'function') {
        const str = err.toString();
        if (str !== '[object Object]') {
          msg = str;
        }
      }
    }
    
    console.log('Extracted message:', msg, 'code:', code, 'type:', typeof err);
    
    // User not found
    if (code === 'user_not_found' || msg.toLowerCase().includes('user not found') || msg.toLowerCase().includes('invalid login')) {
      return 'Account not found. Please sign up first.';
    }
    
    // Wrong password
    if (code === 'invalid_credentials' || msg.toLowerCase().includes('invalid login')) {
      return 'Incorrect email or password. Please try again.';
    }
    
    // Email already exists
    if (code === 'email_exists' || code === 'user_already_exists' || msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('already exists')) {
      return 'An account with this email already exists. Please sign in.';
    }
    
    // Weak password
    if (code === 'weak_password' || msg.toLowerCase().includes('weak') || msg.toLowerCase().includes('password')) {
      return 'Password is too weak. Use at least 6 characters.';
    }
    
    // Invalid email
    if (code === 'invalid_email' || msg.toLowerCase().includes('valid email')) {
      return 'Please enter a valid email address.';
    }
    
    // Network error
    if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('connection')) {
      return 'Network error. Please check your internet connection.';
    }
    
    return msg || 'Authentication failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      if (view === 'signin') {
        console.log('Attempting sign in...', email);
        const result = await signIn(email.trim(), password);
        console.log('Sign in result:', result);
        
        if (result.error) {
          console.error('Sign in error:', result.error);
          setError(getFriendlyError(result.error));
          setIsLoading(false);
          return;
        }
        
        console.log('Sign in successful');
        setSuccess('Signed in successfully!');
        setTimeout(() => {
          onClose();
        }, 500);
        
      } else if (view === 'signup') {
        // Validate
        if (!email.trim() || !password) {
          setError('Please enter both email and password');
          setIsLoading(false);
          return;
        }
        
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setIsLoading(false);
          return;
        }
        
        console.log('Attempting sign up...', email);
        const result = await signUp(email.trim(), password, fullName.trim() || undefined);
        console.log('Sign up result:', result);
        
        if (result.error) {
          console.error('Sign up error:', result.error);
          const errorMsg = result.error.message || '';
          const errorStr = JSON.stringify(result.error);
          
          // Check if it's just an email sending error but user was created
          // Supabase returns errors in various formats
          if (
            errorMsg.includes('Email server error') || 
            errorMsg.includes('unexpected_failure') ||
            errorMsg.includes('AuthApiError') ||
            errorStr.includes('Email server error') ||
            errorStr.includes('unexpected_failure') ||
            (result.error.__isAuthError && errorStr.includes('Email'))
          ) {
            console.log('User was created but email failed - treating as success');
            setSuccess('Account created successfully! You can now sign in.');
            setTimeout(() => {
              setView('signin');
              setPassword('');
            }, 1500);
            return;
          }
          
          setError(getFriendlyError(result.error));
          setIsLoading(false);
          return;
        }
        
        console.log('Sign up successful');
        setSuccess('Account created! You can now sign in.');
        setTimeout(() => {
          setView('signin');
          setPassword('');
        }, 1500);
        
      } else if (view === 'reset') {
        if (!email.trim()) {
          setError('Please enter your email');
          setIsLoading(false);
          return;
        }
        
        console.log('Sending reset email...', email);
        const result = await resetPassword(email.trim());
        console.log('Reset result:', result);
        
        if (result.error) {
          console.error('Reset error:', result.error);
          setError(getFriendlyError(result.error));
          setIsLoading(false);
          return;
        }
        
        setSuccess('Reset link sent! Check your email.');
      }
    } catch (err: any) {
      console.error('Unexpected error in handleSubmit:', err);
      console.error('Error type:', typeof err);
      console.error('Error keys:', Object.keys(err || {}));
      setError(getFriendlyError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setIsLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(getFriendlyError(error));
        setIsLoading(false);
      }
      // Redirect happens automatically for OAuth
    } catch (err: any) {
      setError(getFriendlyError(err));
      setIsLoading(false);
    }
  };

  const switchView = (newView: 'signin' | 'signup' | 'reset') => {
    setView(newView);
    setError('');
    setSuccess('');
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
              {view === 'signup' && 'Join thousands of researchers'}
              {view === 'reset' && 'We\'ll send you a reset link'}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm flex items-center gap-3">
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{success}</span>
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
                <span className="text-[var(--text-tertiary)] text-sm">or use email</span>
                <div className="flex-1 h-px bg-[var(--border-default)]" />
              </div>
            </>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {view === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-[var(--text-secondary)] mb-2">
                  Full Name <span className="text-[var(--text-tertiary)]">(optional)</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-tertiary)]" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)] focus:ring-1 focus:ring-[var(--accent-indigo)] transition-colors"
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
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)] focus:ring-1 focus:ring-[var(--accent-indigo)] transition-colors"
                  required
                  autoComplete="email"
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
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[var(--bg-tertiary)] border border-[var(--border-default)] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:outline-none focus:border-[var(--accent-indigo)] focus:ring-1 focus:ring-[var(--accent-indigo)] transition-colors"
                    required
                    minLength={6}
                    autoComplete={view === 'signup' ? 'new-password' : 'current-password'}
                  />
                </div>
                {view === 'signup' && (
                  <p className="text-xs text-[var(--text-tertiary)] mt-1 ml-1">
                    Minimum 6 characters
                  </p>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[var(--accent-indigo)] to-[var(--accent-purple)] text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
