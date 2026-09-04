import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { CharacterScene } from '../components/auth/CharacterScene';
import { Button } from '../components/ui/Button';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword, loading: authLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email');
      setLoading(false);
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setLoading(false);
      return;
    }

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email');
      setLoading(false);
      return;
    }

    setSubmitted(true);
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
          <CharacterScene className="w-full h-full max-w-3xl scale-125" />
        </div>
      </div>

      {/* Mobile Character Scene */}
      <div className="lg:hidden w-full h-24 bg-gray-100 relative overflow-hidden">
        <div className="w-full h-full flex items-center justify-center p-2">
          <CharacterScene className="w-full h-full max-w-sm scale-100" simplified={true} />
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Forgot password?</h1>
            <p className="text-gray-600">Enter your email to receive a password reset link</p>
          </motion.div>

          {/* Error State */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          {!submitted ? (
            /* Form */
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.4 }}
              >
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all duration-200"
                  disabled={loading}
                />
              </motion.div>

              {/* Submit Button */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.4 }}
              >
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full"
                  disabled={loading}
                  loading={loading}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </motion.div>

              {/* Back to Login */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.4 }}
              >
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back to log in
                </Link>
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

              <h2 className="text-2xl font-bold text-gray-900 mb-3">Check your email</h2>
              <p className="text-gray-600 mb-4">
                We've sent a password reset link to{' '}
                <span className="font-medium text-gray-900">{email}</span>
              </p>
              <p className="text-gray-500 text-sm mb-8">
                Click the link in the email to reset your password. If you don't see the email, check your spam folder.
              </p>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to log in
              </Link>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};
