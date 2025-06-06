'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <>
      <header className="bg-black/90 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo - positioned to the left */}
            <div className="flex items-center -ml-20">
              <Link href="/" className="flex items-center">
                <img 
                  src="https://cdn.shopify.com/s/files/1/0816/1257/0973/files/aed347ef-bf6d-4634-9fcc-c94fd42726f3.png?v=1749219551"
                  alt="LoopLib"
                  className="h-8 w-auto"
                />
              </Link>
            </div>

            {/* Navigation - centered independently */}
            <nav className="hidden md:flex items-center space-x-6 absolute left-1/2 transform -translate-x-1/2">
              <Link 
                href="/samples" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
              >
                All Samples
              </Link>
              <Link 
                href="/samples/trap" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-1"
              >
                <span>🔥</span>
                <span>Trap</span>
              </Link>
              <Link 
                href="/samples/rnb" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-1"
              >
                <span>💫</span>
                <span>R&B</span>
              </Link>
              <Link 
                href="/samples/soul" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-1"
              >
                <span>❤️</span>
                <span>Soul</span>
              </Link>
            </nav>
            
            {/* Login/User section - positioned to the right */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-neutral-300 hidden sm:inline">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md transition-colors text-sm sm:text-base font-medium"
                >
                  Login / Sign Up
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(user) => {
          setUser(user);
          setShowAuthModal(false);
          toast.success('Welcome to LoopLib!');
        }}
      />
    </>
  );
}