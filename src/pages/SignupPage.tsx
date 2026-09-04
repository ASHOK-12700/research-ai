import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CondensationBackground } from '../components/auth/CondensationBackground';
import { Button } from '../components/ui/Button';

export const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signUp, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const inputClassName =
    'w-full h-12 rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]/35 focus:border-[var(--accent-primary)] transition-all duration-200 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]';
  const inputStyle = { color: 'var(--text-primary)', WebkitTextFillColor: 'var(--text-primary)' };

  const validateForm = (): boolean => {
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { user, error: authError } = await signUp(email, password);

    if (authError) {
      setError(authError.message || 'Failed to create account');
      setLoading(false);
      return;
    }

    if (user) {
      navigate('/dashboard', { replace: true });
    }
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
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] lg:flex">
      <div className="relative hidden min-h-screen w-full overflow-hidden lg:block lg:w-[48%]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.28),_transparent_30%),linear-gradient(135deg,#0b0d12_0%,#0d1117_40%,#07090d_100%)]" />
        <CondensationBackground className="absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.18),rgba(7,9,13,0.72))]" />

        <div className="relative z-10 flex h-full flex-col justify-between px-10 py-10 xl:px-16">
          <div className="flex items-center gap-3">
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

          <div className="max-w-lg">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.24em] text-white/70 backdrop-blur-sm">
              <Sparkles size={12} />
              New research journey
            </div>
            <h1 className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
              Turn scattered ideas into a sharp, searchable research engine.
            </h1>
            <p className="mt-4 max-w-md text-base text-slate-300 xl:text-lg">
              Build your library, compare papers, and keep every insight connected from the first note to the final synthesis.
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-slate-300">
            <div className="h-px flex-1 bg-white/10" />
            <span>Secure onboarding</span>
          </div>
        </div>
      </div>

      <div className="relative block h-32 w-full overflow-hidden bg-[var(--bg-primary)] lg:hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.26),_transparent_28%),linear-gradient(135deg,#0b0d12_0%,#0d1117_40%,#07090d_100%)]" />
        <CondensationBackground className="absolute inset-0 opacity-80" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,13,0.1),rgba(7,9,13,0.52))]" />
      </div>

      <div className="flex w-full items-center justify-center px-4 py-10 sm:px-6 lg:w-[52%] lg:px-8 xl:px-12">
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
                Signup
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-semibold tracking-[-0.04em] text-[var(--text-primary)] sm:text-[2.1rem]">Create account</h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Set up your workspace and start organizing research.</p>
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
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">Confirm password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={`${inputClassName} px-4 py-3 pr-12`}
                    style={inputStyle}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Hide password confirmation' : 'Show password confirmation'}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
                    disabled={loading}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.4 }}
                className="text-xs text-[var(--text-secondary)]"
              >
                Minimum 6 characters
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
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
                  {loading ? 'Creating account...' : 'Create account'}
                </Button>
              </motion.div>
            </form>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="mt-7 text-center text-sm text-[var(--text-secondary)]"
            >
              Already have an account?
              <Link to="/login" className="ml-2 font-semibold text-[var(--text-primary)] transition-colors hover:text-[var(--accent-primary)]">
                Log in
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

