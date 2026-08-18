import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, resetPassword, signInWithOAuth } from '../lib/authService';
import { KeyRound, Mail, User, ShieldCheck, ArrowRight, AlertCircle, CheckCircle2, RotateCcw } from 'lucide-react';

type AuthMode = 'signin' | 'signup' | 'reset';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error: signUpError } = await signUp(email, password, displayName);
        if (signUpError) throw signUpError;
        setSuccessMessage('Account created successfully! Redirecting to CMS...');
        setTimeout(() => navigate('/admin'), 1500);
      } else if (mode === 'signin') {
        const { error: signInError } = await signIn(email, password);
        if (signInError) throw signInError;
        navigate('/admin');
      } else if (mode === 'reset') {
        const { error: resetError } = await resetPassword(email);
        if (resetError) throw resetError;
        setSuccessMessage(`Password recovery instructions sent to ${email}. Please check your inbox.`);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication operation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'github') => {
    setError(null);
    try {
      const { error: oauthError } = await signInWithOAuth(provider);
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || `Failed to authenticate with ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen bg-atlas-bg flex items-center justify-center p-4 font-sans text-atlas-text">
      <div className="w-full max-w-md bg-atlas-panel border border-atlas-border rounded-xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-atlas-brass/10 border border-atlas-brass/30 flex items-center justify-center mx-auto text-atlas-brass">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="font-serif text-xl font-bold text-atlas-parchment">
            Atlas of Time — Editorial Portal
          </h1>
          <p className="text-xs text-atlas-muted">
            {mode === 'signup'
              ? 'Create an editorial staff profile'
              : mode === 'reset'
              ? 'Recover your account password via email'
              : 'Sign in to access Editorial CMS & User Management'}
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-md flex items-center gap-2 text-red-200 text-xs font-sans">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-500/30 rounded-md flex items-center gap-2 text-emerald-200 text-xs font-sans">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* OAuth Social Buttons */}
        {mode !== 'reset' && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="w-full py-2 px-4 bg-atlas-surface border border-atlas-border hover:border-atlas-brass/50 text-atlas-parchment font-sans text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="w-full py-2 px-4 bg-atlas-surface border border-atlas-border hover:border-atlas-brass/50 text-atlas-parchment font-sans text-xs font-semibold rounded-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 fill-current text-atlas-parchment" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              <span>Continue with GitHub</span>
            </button>

            <div className="flex items-center my-4">
              <div className="flex-1 border-t border-atlas-border/50"></div>
              <span className="px-3 text-[10px] font-mono text-atlas-muted uppercase">Or email & password</span>
              <div className="flex-1 border-t border-atlas-border/50"></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-atlas-muted uppercase tracking-wider">
                Display Name
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 w-4 h-4 text-atlas-muted pointer-events-none" />
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="e.g. Super Admin"
                  className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-md text-xs text-atlas-text focus:outline-none focus:border-atlas-brass"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[11px] font-mono text-atlas-muted uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 text-atlas-muted pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abhishekkumar86448@gmail.com"
                className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-md text-xs text-atlas-text focus:outline-none focus:border-atlas-brass font-mono"
              />
            </div>
          </div>

          {mode !== 'reset' && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-mono text-atlas-muted uppercase tracking-wider">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode('reset');
                      setError(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[11px] text-atlas-brass hover:underline font-sans"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <KeyRound className="absolute left-3 w-4 h-4 text-atlas-muted pointer-events-none" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-atlas-surface border border-atlas-border rounded-md text-xs text-atlas-text focus:outline-none focus:border-atlas-brass"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-atlas-brass text-atlas-bg font-sans font-semibold text-xs rounded-md hover:bg-atlas-brass/90 transition-colors flex items-center justify-center gap-2 shadow-lg disabled:opacity-50"
          >
            {loading ? (
              <span>Processing...</span>
            ) : mode === 'signup' ? (
              <>
                <span>Create Profile</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : mode === 'reset' ? (
              <>
                <span>Send Password Reset Email</span>
                <RotateCcw className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Sign In to CMS</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-atlas-border/40 space-y-1 font-sans text-xs">
          {mode === 'reset' ? (
            <button
              onClick={() => {
                setMode('signin');
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-atlas-brass hover:underline"
            >
              Remember password? Back to Sign In
            </button>
          ) : (
            <button
              onClick={() => {
                setMode(mode === 'signin' ? 'signup' : 'signin');
                setError(null);
                setSuccessMessage(null);
              }}
              className="text-atlas-brass hover:underline"
            >
              {mode === 'signin'
                ? 'Need an editor profile? Sign Up'
                : 'Already have an editor profile? Sign In'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
