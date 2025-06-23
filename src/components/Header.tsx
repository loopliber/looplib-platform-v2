'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Zap, Sparkles, Heart, ShoppingBag, Package } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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