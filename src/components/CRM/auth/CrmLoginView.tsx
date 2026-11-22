import React, { useState } from 'react';
import {
  signInAdmin,
  verifyAdminRole,
  signOutAdmin,
  sendAdminPasswordReset
} from '../../../services/firebase/auth';
import { loginAdmin } from '../../../services/adminApi';
import { Lock, Mail, Eye, EyeOff, Shield, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { AnimatedMonkeyAvatar, MonkeyState } from './AnimatedMonkeyAvatar';
import { RohitworkBrandLockup } from '../branding/RohitworkLogo';

interface CrmLoginViewProps {
  onSuccess: (email: string, role: 'super_admin' | 'admin' | 'editor') => void;
  onBackToWebsite: () => void;
}

export const CrmLoginView: React.FC<CrmLoginViewProps> = ({
  onSuccess,
  onBackToWebsite
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [diagnosticCode, setDiagnosticCode] = useState<string | null>(null);

  const cleanEmail = email.trim().toLowerCase();

  // Strict Production Protection: DEV flag ensures preview helper never exists in production builds
  const isLocalhost = Boolean(
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  );

  // Compute reactive monkey state based on field focus, password visibility, or dev test param
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const devStateParam = isLocalhost ? (urlParams?.get('monkey') as MonkeyState | null) : null;

  const monkeyState: MonkeyState = devStateParam || (() => {
    if (focusedField === 'password') {
      return showPassword ? 'password-visible' : 'password-hidden';
    }
    if (focusedField === 'email') {
      return 'email-focus';
    }
    return 'idle';
  })();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cleanEmail || !password) {
      setErrorMessage('Please enter both your admin email and password.');
      setDiagnosticCode(null);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setResetMessage(null);
    setDiagnosticCode(null);

    try {
      // 1. Try Firebase Auth with normalized email
      const res = await signInAdmin(cleanEmail, password);
      if (res.success && res.user) {
        // Enforce server/Firestore verified role before granting access
        const roleRes = await verifyAdminRole(res.user);
        if (roleRes.authorized) {
          onSuccess(roleRes.email || res.user.email || cleanEmail, roleRes.role);
          return;
        } else {
          await signOutAdmin();
          setErrorMessage(roleRes.error || 'Access denied: You are authenticated, but not authorized for CRM Administrator access.');
          return;
        }
      }

      if (res.errorCode) {
        setDiagnosticCode(res.errorCode);
      }

      // 2. Fallback to API Session Login
      const apiRes = await loginAdmin(cleanEmail, password);
      if (apiRes.success && apiRes.adminEmail) {
        onSuccess(apiRes.adminEmail, 'admin');
        return;
      }

      setErrorMessage(
        res.error || apiRes.error || 'Invalid administrator credentials. Access denied.'
      );
    } catch (err: any) {
      const code = err.code || 'auth/unknown-error';
      setDiagnosticCode(code);
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!cleanEmail) {
      setErrorMessage('Please enter your administrator email first to receive a password reset link.');
      return;
    }

    setIsResetting(true);
    setErrorMessage(null);
    setResetMessage(null);

    try {
      const result = await sendAdminPasswordReset(cleanEmail);
      setResetMessage(result.message || 'If an administrator account exists for this email, password reset instructions have been dispatched.');
    } catch (err: any) {
      setErrorMessage(err.message || 'Unable to request password reset. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-full bg-gradient-to-b from-[#0b091f] via-[#0f0c2a] to-[#150e38] text-white flex flex-col justify-between p-3 sm:p-6 relative overflow-x-hidden select-none">
      {/* Background ambient radial glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar with Back Button */}
      <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-5xl mx-auto flex items-center justify-between gap-2 z-10 pt-1">
        <button
          type="button"
          onClick={onBackToWebsite}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-1.5 px-2.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-slate-800 shrink-0"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Back to Rohitwork Website</span>
          <span className="sm:hidden text-[11px]">Website</span>
        </button>

        <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-purple-300 bg-purple-950/40 border border-purple-800/40 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-xs shrink-0">
          Restricted Portal
        </span>
      </div>

      {/* Center Auth Card */}
      <div className="w-full max-w-[320px] xs:max-w-[360px] sm:max-w-[400px] mx-auto my-auto z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-[#0f0c2a]/95 border border-purple-500/20 rounded-3xl p-4 sm:p-7 shadow-2xl shadow-purple-950/60 backdrop-blur-xl">
          {/* Approved Brand Lockup Header */}
          <div className="flex justify-center mb-3 sm:mb-4">
            <RohitworkBrandLockup size="md" />
          </div>

          {/* Interactive Animated Monkey Avatar */}
          <div className="mb-3 sm:mb-4 flex justify-center">
            <AnimatedMonkeyAvatar state={monkeyState} size={124} />
          </div>

          {/* Title & Description */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-white">
              Administrator Portal
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
              Sign in to manage agency leads, projects & finances
            </p>
          </div>

          {/* Error Alert with Safe Diagnostic Code */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="break-words">{errorMessage}</div>
                {diagnosticCode && (
                  <div
                    id="crm-auth-diagnostic-code"
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-950/70 border border-rose-800/60 text-[10.5px] font-mono text-rose-300 max-w-full truncate"
                  >
                    <span className="text-[10px] text-slate-400 font-sans">Code:</span>
                    <strong className="font-semibold text-rose-200 truncate">{diagnosticCode}</strong>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Password Reset Notice */}
          {resetMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-150">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
              <div className="flex-1 break-words">{resetMessage}</div>
            </div>
          )}

          {/* Local Development Quick Preview (Guarded strictly to Localhost + DEV) */}
          {isLocalhost && (
            <div className="mb-4 p-2.5 sm:p-3 rounded-2xl bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 border border-purple-500/40 text-left shadow-lg">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Local Dev
                  </span>
                  <p className="text-[10px] text-purple-200 mt-0.5 font-semibold truncate">
                    Instant Admin Preview
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onSuccess('workall724038@gmail.com', 'super_admin')}
                  className="px-2.5 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-[10.5px] sm:text-[11px] font-bold shadow-md hover:shadow-purple-500/25 transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap active:scale-95 shrink-0"
                >
                  <span>⚡ Bypass</span>
                </button>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label
                className="block text-xs font-bold text-slate-300 mb-1.5"
                htmlFor="admin-email"
              >
                Administrator Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocusedField('email')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="admin@rohitwork.in"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-medium placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  className="block text-xs font-bold text-slate-300"
                  htmlFor="admin-password"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLoading || isResetting}
                  className="text-[11px] text-purple-400 hover:text-purple-300 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isResetting ? 'Sending...' : 'Forgot password?'}
                </button>
              </div>

              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="admin-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white text-xs font-medium placeholder:text-slate-500 focus:outline-hidden focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                />

                {/* Accessible Show / Hide Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    setShowPassword((prev) => !prev);
                    if (focusedField !== 'password') {
                      setFocusedField('password');
                    }
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[10.5px] font-bold transition-all cursor-pointer absolute right-2.5 top-1/2 -translate-y-1/2 shadow-xs active:scale-95"
                >
                  {showPassword ? (
                    <EyeOff className="w-3.5 h-3.5 text-purple-400" />
                  ) : (
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                  )}
                  <span>{showPassword ? 'Hide' : 'Show'}</span>
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-extrabold bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-md shadow-purple-600/30 cursor-pointer disabled:opacity-50 mt-2 active:scale-98"
            >
              {isLoading ? 'Verifying Credentials...' : 'Sign In to Portal'}
            </button>
          </form>

          {import.meta.env?.DEV && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-400 flex items-center justify-between">
              <span>Firebase: <code className="text-slate-200 font-mono">rohit-72bfa</code></span>
              <span className="text-emerald-400 font-medium">Ready</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Security Badges */}
      <div className="w-full max-w-sm mx-auto text-center text-[10.5px] sm:text-[11px] text-slate-500 flex items-center justify-center gap-1.5 z-10 pb-2 px-2">
        <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0" />
        <span className="leading-tight">Protected by Firebase Auth & Enterprise RBAC</span>
      </div>
    </div>
  );
};
