'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { User, LogOut, Menu, X, Zap, Sparkles, Heart, ShoppingBag, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthModal from './AuthModal';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [producerName, setProducerName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    // Only initialize once
    if (isInitialized) return;
    
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (mounted) {
          setUser(user);
          
          // Only fetch producer name if user exists
          if (user?.id) {
            await fetchOrCreateProfile(user);
          }
          
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        if (mounted) {
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener ONLY ONCE
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (mounted) {
          setUser(session?.user || null);
          if (!session?.user) {
            setProducerName('');
          } else if (event === 'SIGNED_IN' && session?.user) {
            // Fetch profile when user signs in
            await fetchOrCreateProfile(session.user);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [isInitialized]); // Only depend on isInitialized

  const fetchOrCreateProfile = async (user: any) => {
    if (!user?.id) return;

    try {
      // First try to fetch the profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('producer_name, role')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching profile:', fetchError);
        return;
      }

      if (profileData?.producer_name) {
        setProducerName(profileData.producer_name);
      } else {
        // No profile exists, create one
        const producer_name = user.user_metadata?.producer_name || 
                           user.email?.split('@')[0] || 
                           'Producer';

        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email,
            producer_name: producer_name,
            role: 'producer',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select('producer_name')
          .single();

        if (createError) {
          // If insert fails, try upsert
          const { data: upsertData, error: upsertError } = await supabase
            .from('profiles')
            .upsert({
              id: user.id,
              email: user.email,
              producer_name: producer_name,
              role: 'producer',
              updated_at: new Date().toISOString()
            })
            .select('producer_name')
            .single();

          if (upsertError) {
            console.error('Error creating profile:', upsertError);
          } else if (upsertData?.producer_name) {
            setProducerName(upsertData.producer_name);
          }
        } else if (newProfile?.producer_name) {
          setProducerName(newProfile.producer_name);
        }
      }
    } catch (error) {
      console.error('Error in fetchOrCreateProfile:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setProducerName('');
      setUser(null);
      toast.success('Logged out successfully');
      setMobileMenuOpen(false);
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
                href="/samples/trap" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Zap className="w-4 h-4" />
                <span>Trap</span>
              </Link>
              <Link 
                href="/samples/rnb" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>R&B</span>
              </Link>
              <Link 
                href="/samples/soul" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Heart className="w-4 h-4" />
                <span>Soul</span>
              </Link>
              <Link 
                href="/packs" 
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Folder className="w-4 h-4" />
                <span>Packs</span>
              </Link>
              <a 
                href="https://shop.looplib.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop</span>
              </a>
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
                    <span className="text-sm text-white">{producerName || user.email?.split('@')[0] || 'User'}</span>
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
                  className="hidden px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-md transition-colors text-sm font-medium"
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
                  href="/samples/trap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  <Zap className="w-4 h-4" />
                  <span>Trap</span>
                </Link>
                <Link 
                  href="/samples/rnb"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>R&B</span>
                </Link>
                <Link 
                  href="/samples/soul"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  <Heart className="w-4 h-4" />
                  <span>Soul</span>
                </Link>
                <Link 
                  href="/packs"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  <Folder className="w-4 h-4" />
                  <span>Packs</span>
                </Link>
                <a 
                  href="https://shop.looplib.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Shop</span>
                </a>
                
                <div className="pt-2 border-t border-neutral-800">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block w-full text-left px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                      >
                        <User className="w-4 h-4 inline mr-2" />
                        Dashboard
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
                      className="hidden block w-full text-left px-3 py-2 text-base font-medium bg-orange-500 text-white rounded-md"
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
        onSuccess={async (user) => {
          setUser(user);
          setShowAuthModal(false);
          toast.success('Welcome to LoopLib!');
          // Fetch profile after successful auth
          if (user) {
            await fetchOrCreateProfile(user);
          }
        }}
      />
    </>
  );
}