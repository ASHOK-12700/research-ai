import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterScene } from '../components/auth/CharacterScene';
import { Button } from '../components/ui/Button';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { updatePassword, loading: authLoading } = useAuth();

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [hasToken, setHasToken] = useState(false);

  useEffect(() => {
    // Check if there's a valid session (Supabase sets the session when you visit the reset link)
    const token = searchParams.get('token');
    const type = searchParams.get('type');

    if (!token || type !== 'recovery') {
      setError('Invalid password reset link. Please request a new one.');
    } else {
      setHasToken(true);
    }
  }, [searchParams]);

  const validateForm = (): boolean => {
    if (!password || !confirmPassword) {
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    const { user, error: resetError } = await updatePassword(password);

    if (resetError) {
      setError(resetError.message || 'Failed to reset password');
      setLoading(false);
      return;
    }

    if (user) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            className="mb-4 h-10 w-10 rounded-full border-2 border-gray-300 border-t-gray-900 mx-auto"
          />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Side - Character Scene */}
      <div className="hidden lg:flex lg:w-1/2 bg-gray-100 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-12">
          <CharacterScene 
            className="w-full h-full max-w-3xl scale-125" 
            isPasswordVisible={showPassword || showConfirmPassword}
          />
        </div>
      </div>

      {/* Mobile Character Scene */}
      <div className="lg:hidden w-full h-24 bg-gray-100 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-2">
          <CharacterScene 
            className="w-full h-full max-w-sm scale-100" 
            simplified={true}
            isPasswordVisible={showPassword || showConfirmPassword}
          />
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="mb-8 flex justify-center"
          >
            <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15 8H9L12 2Z" fill="white"/>
                <path d="M12 22L9 16H15L12 22Z" fill="white"/>
                <path d="M2 12L8 9V15L2 12Z" fill="white"/>
                <path d="M22 12L16 15V9L22 12Z" fill="white"/>
              </svg>
            </div>
          </motion.div>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset password</h1>
            <p className="text-gray-600">Create a new password for your account</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm flex items-start gap-2"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          {!hasToken && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-600 text-sm flex items-start gap-2"
            >
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <span>Invalid reset link. Please request a new password reset.</span>
            </motion.div>
          )}

          {!success ? (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 pr-12"
                    disabled={loading || !hasToken}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading || !hasToken}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Confirm Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200 pr-12"
                    disabled={loading || !hasToken}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    disabled={loading || !hasToken}
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </motion.div>

              {/* Password requirements hint */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.4 }}
                className="text-xs text-gray-500"
              >
                Minimum 6 characters
              </motion.p>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45, duration: 0.4 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={loading || !hasToken}
                  loading={loading}
                >
                  {loading ? 'Resetting password...' : 'Reset password'}
                </Button>
              </motion.div>
            </form>
          ) : (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="text-center py-8"
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="mb-6 flex justify-center"
              >
                <CheckCircle size={64} className="text-green-500" />
              </motion.div>

              <h2 className="text-2xl font-bold text-gray-900 mb-3">Password reset successful</h2>
              <p className="text-gray-600 mb-6">
                Your password has been updated. Redirecting to your dashboard...
              </p>

              <Link
                to="/dashboard"
                className="inline-block bg-black text-white font-medium py-2.5 px-6 rounded-lg transition-colors hover:bg-gray-800"
              >
                Go to Dashboard
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
