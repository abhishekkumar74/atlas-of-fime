import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signUp, resetPassword } from '../lib/authService';
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
