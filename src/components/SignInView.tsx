import React, { useState } from 'react';
import { Bookmark, Shield, Cloud, Lock, ArrowRight, User, CheckCircle2 } from 'lucide-react';
import { signInCloudAccount, signUpCloudAccount } from '../utils/cloudAccount';
import { CloudUser } from '../types';

interface SignInViewProps {
  onSignInSuccess: (user: CloudUser) => void;
  onViewPrivacy: () => void;
  onViewTerms: () => void;
}

export const SignInView: React.FC<SignInViewProps> = ({
  onSignInSuccess,
  onViewPrivacy,
  onViewTerms,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (mode === 'signup') {
      const result = signUpCloudAccount(name, email, password);
      if (result.success && result.user) {
        onSignInSuccess(result.user);
      } else {
        setError(result.error || 'Failed to create cloud account.');
      }
    } else {
      const result = signInCloudAccount(email, password);
      if (result.success && result.user) {
        onSignInSuccess(result.user);
      } else {
        setError(result.error || 'Failed to sign in to cloud account.');
      }
    }
  };

  const handleQuickSignIn = (demoEmail: string, demoName: string) => {
    const result = signInCloudAccount(demoEmail);
    if (result.success && result.user) {
      onSignInSuccess(result.user);
    } else {
      const signUpResult = signUpCloudAccount(demoName, demoEmail);
      if (signUpResult.success && signUpResult.user) {
        onSignInSuccess(signUpResult.user);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-purple-900 selection:text-purple-100 font-sans">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white shadow-sm">
              <Bookmark className="w-4 h-4 fill-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">TabVault</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <button
              onClick={onViewPrivacy}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Privacy Policy
            </button>
            <button
              onClick={onViewTerms}
              className="hover:text-slate-200 transition-colors cursor-pointer"
            >
              Terms & Conditions
            </button>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md space-y-6">
          <div className="p-8 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-2xl space-y-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-purple-950/80 border border-purple-500/30 text-purple-400 flex items-center justify-center mx-auto mb-3">
                <Cloud className="w-6 h-6 text-purple-400" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-100">
                TabVault Cloud Account
              </h1>
              <p className="text-xs text-slate-400 leading-relaxed max-w-xs mx-auto">
                Sign in to sync, organize, and access your personal web bookmarks.
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 rounded-lg bg-slate-950 border border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setMode('signin');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'signin'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  mode === 'signup'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Create Account
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs font-medium">
                {error}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Alex Developer"
                      required
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Cloud className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    required
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 active:bg-purple-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
              >
                <span>{mode === 'signup' ? 'Create Cloud Account' : 'Sign In to Cloud Account'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Sign In option */}
            <div className="pt-4 border-t border-slate-800/80">
              <div className="text-[11px] text-slate-500 uppercase tracking-wider mb-2 text-center font-medium">
                Or Continue With One Click
              </div>
              <button
                type="button"
                onClick={() => handleQuickSignIn('anumola.sowjith@gmail.com', 'Sowjith')}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-medium transition-colors border border-slate-700/80 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-purple-400" />
                <span>Continue as anumola.sowjith@gmail.com</span>
              </button>
            </div>

            {/* Cloud Account Highlights */}
            <div className="pt-4 border-t border-slate-800/80 space-y-2.5 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                <span>Dedicated, isolated cloud vault per account</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Clean start with zero mock data</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Automatic cloud synchronization & JSON backup</span>
              </div>
            </div>
          </div>

          <p className="text-center text-[11px] text-slate-500">
            By signing in, you agree to our{' '}
            <button onClick={onViewTerms} className="text-purple-400 hover:underline cursor-pointer">
              Terms
            </button>{' '}
            and{' '}
            <button onClick={onViewPrivacy} className="text-purple-400 hover:underline cursor-pointer">
              Privacy Policy
            </button>
            .
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        TabVault · Personal Cloud Bookmark Workspace
      </footer>
    </div>
  );
};
