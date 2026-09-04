import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CondensationBackground } from '../components/auth/CondensationBackground';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn, signInWithGoogle, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const inputClassName =
    'w-full h-12 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/35 focus:border-[var(--accent-primary)] transition-all duration-200 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]';
  const inputStyle = { color: 'var(--text-primary)', WebkitTextFillColor: 'var(--text-primary)' };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    const { user, error: authError } = await signIn(email, password);

    if (authError) {
      setError(authError.message || 'Failed to sign in');
      setLoading(false);
      return;
    }

    if (user) {
      navigate('/dashboard', { replace: true });
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    const { error: authError } = await signInWithGoogle();

    if (authError) {
      setError(authError.message || 'Google sign-in failed. Please try again.');
    }

    setGoogleLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)]">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mx-auto mb-4 h-10 w-10 rounded-full border-2 border-[var(--border-default)] border-t-[var(--accent-primary)]"
          />
          <p className="text-[var(--text-secondary)]">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.28),_transparent_30%),linear-gradient(135deg,#0b0d12_0%,#0d1117_40%,#07090d_100%)]" />
        <CondensationBackground className="absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.18),rgba(7,9,13,0.72))]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col lg:flex-row lg:items-center">
        <div className="relative flex w-full flex-col justify-between px-6 py-8 sm:px-8 lg:w-[46%] lg:px-10 lg:py-10 xl:px-16">
          <div className="mb-6 flex items-center gap-3 lg:mb-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_12px_24px_rgba(0,0,0,0.2)] backdrop-blur-sm">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H9L12 2Z" fill="white" opacity="0.95" />
                <path d="M12 22L9 16H15L12 22Z" fill="white" opacity="0.95" />
                <path d="M2 12L8 9V15L2 12Z" fill="white" opacity="0.95" />
                <path d="M22 12L16 15V9L22 12Z" fill="white" opacity="0.95" />
              </svg>
            </div>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.28em] text-white/60">ResearchAI</div>
            </div>
          </div>

          <div className="hidden lg:block lg:max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white/70 backdrop-blur-sm">
              <Sparkles size={12} />
              Executive research workspace
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
              Research faster with every signal in one place.
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-300 xl:text-lg">
              Track, compare, and synthesize the papers that matter most without losing momentum across the workflow.
            </p>
          </div>

          <div className="mt-8 hidden items-center gap-3 text-sm text-slate-300 lg:flex">
            <div className="h-px flex-1 bg-white/10" />
            <span>Secure access</span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-[54%] lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="rounded-[28px] border border-[var(--border-default)] bg-[var(--bg-surface)]/75 p-6 shadow-[0_28px_80px_rgba(17,24,39,0.18)] backdrop-blur-xl sm:p-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="mb-8 flex items-center justify-between"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--accent-primary)] shadow-[0_10px_24px_rgba(124,92,255,0.3)]">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15 8H9L12 2Z" fill="white" />
                  <path d="M12 22L9 16H15L12 22Z" fill="white" />
                  <path d="M2 12L8 9V15L2 12Z" fill="white" />
                  <path d="M22 12L16 15V9L22 12Z" fill="white" />
                </svg>
              </div>
              <div className="rounded-full border border-[var(--border-default)] bg-[var(--bg-elevated)] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--text-secondary)]">
                Login
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.1rem]">Welcome back</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Sign in to continue your research workflow.</p>
            </motion.div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300"
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className={`${inputClassName} px-4 py-3`}
                  style={inputStyle}
                  disabled={loading}
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <div className="mb-2 flex items-center justify-between">
                  <label className="block text-sm font-medium text-[var(--text-secondary)]">Password</label>
                  <Link to="/forgot-password" className="text-xs font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className={`${inputClassName} px-4 py-3 pr-12`}
                    style={inputStyle}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                    disabled={loading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="flex items-center justify-between pt-1"
              >
                <label className="flex cursor-pointer items-center gap-2 text-sm text-[var(--text-secondary)]">
                  <input type="checkbox" className="h-4 w-4 rounded border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]" />
                  Remember me
                </label>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  className="w-full justify-center gap-2 rounded-xl"
                  disabled={loading}
                  loading={loading}
                >
                  {!loading && <ArrowRight size={16} />}
                  {loading ? 'Signing in...' : 'Log in'}
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Button
                  type="button"
                  variant="google"
                  size="lg"
                  className="w-full justify-center gap-2 rounded-xl"
                  disabled={loading || googleLoading}
                  loading={googleLoading}
                  onClick={handleGoogleLogin}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  }
                >
                  Continue with Google
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="mt-7 text-center text-sm text-[var(--text-secondary)]"
            >
              Don't have an account?
              <Link to="/signup" className="ml-2 font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-primary)]">
                Create one
              </Link>
            </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
