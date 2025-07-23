'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Zap, Sparkles, Heart, ShoppingBag, Package, CircleDot, ChevronDown, Mic } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typeLoopsOpen, setTypeLoopsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setTypeLoopsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Artist configurations for the dropdown
  const artists = [
    { slug: 'travis-scott', name: 'Travis Scott', genre: 'trap' },
    { slug: 'drake', name: 'Drake', genre: 'rnb' },
    { slug: 'metro-boomin', name: 'Metro Boomin', genre: 'trap' },
    { slug: 'the-weeknd', name: 'The Weeknd', genre: 'rnb' },
    { slug: 'future', name: 'Future', genre: 'trap' },
    { slug: 'gunna', name: 'Gunna', genre: 'trap' },
    { slug: 'partynextdoor', name: 'PartyNextDoor', genre: 'rnb' },
    { slug: 'bryson-tiller', name: 'Bryson Tiller', genre: 'rnb' },
    { slug: '6lack', name: '6lack', genre: 'rnb' },
    { slug: 'young-thug', name: 'Young Thug', genre: 'trap' },
    { slug: 'lil-baby', name: 'Lil Baby', genre: 'trap' },
    { slug: '21-savage', name: '21 Savage', genre: 'trap' },
    { slug: 'lil-uzi-vert', name: 'Lil Uzi Vert', genre: 'trap' }
  ];

  return (
    <header className="bg-black/90 backdrop-blur-sm border-b border-neutral-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <img 
                src="https://shop.looplib.com/cdn/shop/files/Looplib-logo-white_fcdecbfd-3604-4653-9628-4d76755988c3.png" 
                alt="LoopLib" 
                className="h-8 w-auto"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/packs"
              className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <Package className="w-4 h-4" />
              <span>Packs</span>
            </Link>
            
            {/* Type Loops Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setTypeLoopsOpen(!typeLoopsOpen)}
                className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
              >
                <Mic className="w-4 h-4" />
                <span>Type Loops</span>
                <ChevronDown className={`w-4 h-4 transition-transform ${typeLoopsOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {typeLoopsOpen && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl z-50">
                  <div className="p-2">
                    <div className="grid grid-cols-1 gap-1">
                      {artists.map((artist) => (
                        <Link
                          key={artist.slug}
                          href={`/type/${artist.slug}`}
                          onClick={() => setTypeLoopsOpen(false)}
                          className="flex items-center justify-between px-3 py-2 text-sm text-neutral-300 hover:text-white hover:bg-neutral-800 rounded-md transition-colors"
                        >
                          <span>{artist.name}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            artist.genre === 'trap' 
                              ? 'bg-orange-500/20 text-orange-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}>
                            {artist.genre}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            
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
              href="/sell-beats"
              className="text-neutral-400 hover:text-white transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <CircleDot className="w-4 h-4" />
              <span>Sell Beats</span>
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

          {/* Desktop Right Side - Just branding */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm text-neutral-400">
              100% Free Samples
            </span>
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
                href="/packs"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
              >
                <Package className="w-4 h-4" />
                <span>Packs</span>
              </Link>
              
              {/* Type Loops Section in Mobile */}
              <div className="px-3 py-2">
                <div className="flex items-center space-x-2 text-base font-medium text-neutral-300 mb-2">
                  <Mic className="w-4 h-4" />
                  <span>Type Loops</span>
                </div>
                <div className="ml-6 space-y-1">
                  {artists.slice(0, 8).map((artist) => (
                    <Link
                      key={artist.slug}
                      href={`/type/${artist.slug}`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3 py-1 text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
                    >
                      <span>{artist.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        artist.genre === 'trap' 
                          ? 'bg-orange-500/20 text-orange-400' 
                          : 'bg-purple-500/20 text-purple-400'
                      }`}>
                        {artist.genre}
                      </span>
                    </Link>
                  ))}
                  {artists.length > 8 && (
                    <Link
                      href="/type"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center px-3 py-1 text-sm text-neutral-500 hover:text-neutral-300"
                    >
                      <span>View all {artists.length} artists...</span>
                    </Link>
                  )}
                </div>
              </div>
              
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
                href="/sell-beats"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 text-base font-medium text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-md"
              >
                <CircleDot className="w-4 h-4" />
                <span>Sell Beats</span>
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
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}