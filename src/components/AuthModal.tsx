'use client';

import React, { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, Mail, Lock, User, Loader2, Chrome, Music } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: any) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [producerName, setProducerName] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  if (!isOpen) return null;

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (mode === 'signup') {
        // Validate producer name for signup
        if (!producerName.trim()) {
          toast.error('Producer name is required');
          setLoading(false);
          return;
        }

        // Check if producer name is already taken
        const { data: existingProducer, error: checkError } = await supabase
          .from('profiles')
          .select('producer_name')
          .eq('producer_name', producerName.trim())
          .maybeSingle();

        if (checkError && checkError.code !== 'PGRST116') {
          console.error('Producer name check error:', checkError);
        }

        if (existingProducer) {
          toast.error('Producer name is already taken');
          setLoading(false);
          return;
        }

        // Sign up user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              producer_name: producerName.trim()
            }
          }
        });

        if (error) throw error;

        // Create profile immediately after signup
        if (data.user) {
          // Wait a bit to ensure user is created in auth.users
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: email,
              producer_name: producerName.trim(),
              role: 'producer',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Try upsert as fallback
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: data.user.id,
                email: email,
                producer_name: producerName.trim(),
                role: 'producer',
                updated_at: new Date().toISOString()
              });
            
            if (upsertError) {
              console.error('Profile upsert error:', upsertError);
            }
          }
        }

        toast.success('Account created! Please check your email to verify.');
        onSuccess(data.user);
        onClose();
        
      } else {
        // Login
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Check if user has a profile, create one if not
        if (data.user) {
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('producer_name')
            .eq('id', data.user.id)
            .maybeSingle();

          if (!profileData && !profileError) {
            // Create profile for existing user
            const defaultProducerName = data.user.user_metadata?.producer_name || 
                                      email.split('@')[0];
            
            await supabase
              .from('profiles')
              .insert({
                id: data.user.id,
                email: data.user.email,
                producer_name: defaultProducerName,
                role: 'producer',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              });
          }
        }

        toast.success('Logged in successfully!');
        onSuccess(data.user);
        onClose();
      }
    } catch (error: any) {
      console.error('Auth error:', error);
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
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      });

      if (error) throw error;
      
      // The profile will be created in the auth callback or by the database trigger
    } catch (error: any) {
      toast.error(error.message || 'Google login failed');
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setProducerName('');
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 rounded-2xl max-w-md w-full border border-neutral-800 overflow-hidden">
        {/* Header */}
        <div className="relative h-32 bg-gradient-to-br from-orange-600 via-orange-600 to-pink-600">
          <div className="absolute inset-0 bg-black/20" />
          <button
            onClick={() => {
              onClose();
              resetForm();
            }}
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
              {/* Producer Name - Only for signup */}
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">
                    Producer Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                    <input
                      type="text"
                      value={producerName}
                      onChange={(e) => setProducerName(e.target.value)}
                      placeholder="e.g. Metro Boomin, Southside..."
                      className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-neutral-400"
                      required={mode === 'signup'}
                      maxLength={50}
                    />
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">
                    This will be your public producer name
                  </p>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-neutral-400"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-white placeholder-neutral-400"
                    required
                    minLength={6}
                  />
                </div>
                {mode === 'signup' && (
                  <p className="text-xs text-neutral-500 mt-1">
                    Minimum 6 characters
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>
          </form>

          {/* Toggle Mode */}
          <p className="text-center text-sm text-neutral-400 mt-4">
            {mode === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setMode(mode === 'login' ? 'signup' : 'login');
                setProducerName(''); // Clear producer name when switching
                setEmail(''); // Clear email
                setPassword(''); // Clear password
              }}
              className="text-orange-400 hover:text-orange-300 transition-colors"
            >
              {mode === 'login' ? 'Sign up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}