'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Mail, Loader2, Chrome, Music } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });

        if (error) throw error;
        
        toast.success('Check your email to confirm your account!');
        onClose();
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;
        
        toast.success('Welcome back!');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-md w-full border border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-orange-600 via-orange-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <div className="absolute bottom-4 left-6">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-2xl font-bold mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-neutral-400 mb-6">
            {mode === 'login' 
              ? 'Login to access your favorite samples' 
              : 'Join thousands of producers on LoopLib'}
          </p>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            className="w-full py-3 bg-white hover:bg-gray-100 text-gray-900 font-medium rounded-lg transition-colors flex items-center justify-center space-x-2 mb-4"
          >
            <Chrome className="w-5 h-5" />
            <span>Continue with Google</span>
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-neutral-900 text-neutral-400">Or</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailAuth}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors pr-10"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:border-orange-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span>{mode === 'login' ? 'Login' : 'Sign Up'}</span>
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-neutral-400 mt-4">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-orange-400 hover:text-blue-300 transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}