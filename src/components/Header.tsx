'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, LogOut, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';
import { useRouter } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [producerName, setProducerName] = useState('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      // Fetch producer name if user exists
      if (user?.id) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('producer_name')
          .eq('id', user.id)
          .maybeSingle();
        
        if (profileData?.producer_name) {
          setProducerName(profileData.producer_name);
        } else if (user?.user_metadata?.producer_name) {
          setProducerName(user.user_metadata.producer_name);
        }
      }
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        setUser(session?.user || null);
        if (!session?.user) {
          setProducerName('');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProducerName('');
      toast.success('Logged out successfully');
      setMobileMenuOpen(false);
      router.push('/');
    } catch (error) {
      toast.error('Error logging out');
    }
  };

  return (
    <>
      <header className="bg-black/90 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img 
                  src="https://cdn.shopify.com/s/files/1/0816/1257/0973/files/aed347ef-bf6d-4634-9fcc-c94fd42726f3.png?v=1749219551"
                  alt="LoopLib"
                  className="h-6 sm:h-8 w-auto"
                />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link 
                href="/" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
              >
                Home
              </Link>
              <Link 
                href="/samples" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium"
              >
                Collections
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

            {/* Desktop User Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  <Link
                    href="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors"
                  >
                    <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold">
                      {(producerName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <span className="text-sm text-white">{producerName || user.email?.split('@')[0] || 'Producer'}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-neutral-400 hover:text-white transition-colors flex items-center space-x-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md transition-colors text-sm font-medium"
                >
                  Login / Sign Up
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-neutral-400 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden border-t border-neutral-800">
              <nav className="px-2 pt-2 pb-3 space-y-1">
                <Link 
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  Home
                </Link>
                <Link 
                  href="/samples"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  Collections
                </Link>
                <Link 
                  href="/samples/trap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  🔥 Trap
                </Link>
                <Link 
                  href="/samples/rnb"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  💫 R&B
                </Link>
                <Link 
                  href="/samples/soul"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  ❤️ Soul
                </Link>
                
                <div className="pt-2 border-t border-neutral-800">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        {producerName || user.email?.split('@')[0] || 'Dashboard'}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                      >
                        <LogOut className="w-4 h-4 inline mr-2" />
                        Logout
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => {
                        setShowAuthModal(true);
                        setMobileMenuOpen(false);
                      }}
                      className="block w-full text-left px-3 py-2 text-base font-medium bg-orange-500 text-white rounded-md"
                    >
                      Login / Sign Up
                    </button>
                  )}
                </div>
              </nav>
            </div>
          )}
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