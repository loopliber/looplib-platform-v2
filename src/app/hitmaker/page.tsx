// src/app/hitmaker/page.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  Music, Download, Check, Star, Clock, Package, 
  Headphones, Zap, Play, Pause, Volume2, Shield,
  TrendingUp, Award, Users, Sparkles, ArrowRight,
  ChevronDown, Loader2
} from 'lucide-react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';

// Dynamic import for WaveformPlayer
const WaveformPlayer = dynamic(() => import('@/components/WaveformPlayer'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-12 bg-neutral-800 rounded animate-pulse" />
  )
});

// Bundle showcase data
const bundlesIncluded = [
  {
    id: 'vintage',
    name: 'Vintage Bundle',
    coverArt: 'https://shop.looplib.com/cdn/shop/files/vintagebundle.soul-loops.jpg',
    description: 'Soulful samples with authentic analog warmth',
    features: ['75+ Soul Samples', 'Vintage Keys & Organs', 'Analog Processed'],
    samples: [
      {
        id: 1,
        name: "Am I Wrong",
        url: "https://pub-2a46ae07b1bf4d6c9c90d2138d740df6.r2.dev/samples/soul/amiwrong-158-bmin--looplib-64k-1749494631773-3haaup.mp3",
        bpm: "158 BPM",
        key: "B Minor"
      },
      {
        id: 2,
        name: "Blur",
        url: "https://pub-2a46ae07b1bf4d6c9c90d2138d740df6.r2.dev/samples/soul/blur-156-g-min--looplib-64k-1749494633002-hw4hmh.mp3",
        bpm: "156 BPM",
        key: "G Minor"
      },
      {
        id: 3,
        name: "Dedicated",
        url: "https://pub-2a46ae07b1bf4d6c9c90d2138d740df6.r2.dev/samples/soul/dedicated-77--looplib-64k-1749494635609-5f8po.mp3",
        bpm: "77 BPM",
        key: "C Major"
      }
    ]
  },
  {
    id: 'trap',
    name: 'Trap Essentials',
    coverArt: 'https://shop.looplib.com/cdn/shop/files/TRAP-ESSENTIALS-Cover_Art_4.jpg',
    description: 'Hard-hitting trap sounds for modern production',
    features: ['75+ Trap Samples', 'Dark Melodies', 'Heavy 808s'],
    samples: [
      {
        id: 1,
        name: "Blaze",
        url: "https://pub-2a46ae07b1bf4d6c9c90d2138d740df6.r2.dev/samples/trap/blaze-160-gmin--looplib-64k-1749494901677-6y8dbp.mp3",
        bpm: "160 BPM",
        key: "G Minor"
      },
      {
        id: 2,
        name: "Dawgs",
        url: "https://pub-2a46ae07b1bf4d6c9c90d2138d740df6.r2.dev/samples/trap/dawgs-152--looplib-64k-1749494904230-kac95m.mp3",
        bpm: "152 BPM",
        key: "F# Minor"
      },
      {
        id: 3,
        name: "Berlin",
        url: "https://pub-2a46ae07b1bf4d6c9c90d2138d740df6.r2.dev/samples/trap/berlin-87-c-min--looplib-64k-1749494901675-dvt0j.mp3",
        bpm: "87 BPM",
        key: "C Minor"
      }
    ]
  },
  {
    id: 'rnb',
    name: 'Modern R&B',
    coverArt: 'https://shop.looplib.com/cdn/shop/files/BlueandOrangeDrumandBassMusicPlaylistCover_1.jpg',
    description: 'Smooth R&B vibes with contemporary edge',
    features: ['75+ R&B Samples', 'Silky Chords', 'Modern Sound'],
    samples: [
      {
        id: 1,
        name: "Placeholder 1",
        url: "placeholder-url-1",
        bpm: "90 BPM",
        key: "E Major"
      },
      {
        id: 2,
        name: "Placeholder 2",
        url: "placeholder-url-2",
        bpm: "75 BPM",
        key: "A Minor"
      },
      {
        id: 3,
        name: "Placeholder 3",
        url: "placeholder-url-3",
        bpm: "85 BPM",
        key: "D Major"
      }
    ]
  },
  {
    id: 'boombap',
    name: 'Boom Bap Essentials',
    coverArt: 'https://shop.looplib.com/cdn/shop/files/boombap-drum-kit.jpg',
    description: 'Classic hip-hop sounds with authentic flavor',
    features: ['75+ Boom Bap Samples', 'Dusty Drums', 'Jazz Samples'],
    samples: [
      {
        id: 1,
        name: "Placeholder 1",
        url: "placeholder-url-1",
        bpm: "90 BPM",
        key: "F Major"
      },
      {
        id: 2,
        name: "Placeholder 2",
        url: "placeholder-url-2",
        bpm: "85 BPM",
        key: "C Minor"
      },
      {
        id: 3,
        name: "Placeholder 3",
        url: "placeholder-url-3",
        bpm: "95 BPM",
        key: "G Major"
      }
    ]
  }
];

export default function HitmakerLandingPage() {
  const [timeLeft, setTimeLeft] = useState({ days: 2, hours: 18, minutes: 2, seconds: 21 });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'details' | 'bonus'>('overview');
  const [selectedBundle, setSelectedBundle] = useState<string>('vintage');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { days, hours, minutes, seconds } = prev;
        
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else if (days > 0) {
          days--;
          hours = 23;
          minutes = 59;
          seconds = 59;
        }
        
        return { days, hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleCTA = () => {
    // Track conversion event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'conversion', {
        'send_to': 'GT-M69HVS83/hitmaker-bundle-cta',
        'value': 49.99,
        'currency': 'USD'
      });
    }
    window.location.href = 'https://shop.looplib.com/checkouts/';
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Video Background */}
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        >
          <source src="https://cdn.shopify.com/videos/c/o/v/1164a484c72e494997a983b04279c474.mov" type="video/mp4" />
        </video>
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/80 to-black" />
        
        {/* Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20">
          {/* Limited Time Badge */}
          <div className="text-center mb-6">
            <span className="inline-flex items-center px-4 py-1 bg-red-500/20 border border-red-500 rounded-full text-red-400 text-sm font-medium animate-pulse">
              <Zap className="w-4 h-4 mr-2" />
              LIMITED TIME OFFER - 75% OFF
            </span>
          </div>
          
          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-center mb-6 leading-tight">
            Make <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Professional Beats</span>
            <br />
            With The Ultimate Producer Bundle
          </h1>
          
          {/* Subheadline */}
          <p className="text-xl sm:text-2xl text-center text-neutral-300 mb-8 max-w-3xl mx-auto">
            300+ Stems • 800 MIDI Progressions • Analog Drums • Mixer Presets
          </p>
          
          {/* Reviews */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="ml-3 text-neutral-400">
              <span className="text-white font-semibold">4.9/5</span> (127 Reviews)
            </span>
          </div>
          
          {/* CTA Button */}
          <div className="text-center mb-12">
            <button
              onClick={handleCTA}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-2xl"
            >
              <span className="mr-2">Get Instant Access</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="absolute -top-4 -right-4 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full animate-bounce">
                SAVE $150
              </span>
            </button>
            <p className="mt-4 text-sm text-neutral-400">
              ⚡ Instant download after purchase • 💳 Secure checkout
            </p>
          </div>
          
          {/* Countdown Timer */}
          <div className="bg-neutral-900/80 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 max-w-2xl mx-auto">
            <p className="text-center text-neutral-400 mb-4 font-medium">OFFER EXPIRES IN:</p>
            <div className="grid grid-cols-4 gap-4">
              {Object.entries(timeLeft).map(([unit, value]) => (
                <div key={unit} className="text-center">
                  <div className="bg-black border border-neutral-700 rounded-lg p-3">
                    <div className="text-3xl font-bold text-white">
                      {String(value).padStart(2, '0')}
                    </div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1 uppercase">{unit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-neutral-400" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-neutral-800 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">300+</div>
              <p className="text-neutral-400">Premium Samples</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">800</div>
              <p className="text-neutral-400">MIDI Progressions</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">2.8GB</div>
              <p className="text-neutral-400">Content Size</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-400 mb-2">100%</div>
              <p className="text-neutral-400">Royalty Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* What's Included Section */}
      <section className="py-20 bg-black">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-bold text-center mb-4">Everything You Need To Make Hits</h2>
          <p className="text-xl text-center text-neutral-400 mb-12 max-w-3xl mx-auto">
            The complete production toolkit used by Grammy-winning producers
          </p>
          
          {/* Tab Navigation */}
          <div className="flex justify-center mb-8">
            <div className="bg-neutral-900 rounded-full p-1 inline-flex">
              {(['overview', 'details', 'bonus'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab as any)}
                  className={`px-6 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedTab === tab 
                      ? 'bg-orange-500 text-white' 
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Left Column - Product Images */}
            <div className="relative">
              <div className="sticky top-24">
                <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-orange-500/20 to-red-500/20 p-8">
                  <img 
                    src="https://cdn.shopify.com/s/files/1/0816/1257/0973/files/hitmaker-bundle-popup.webp"
                    alt="Hitmaker Bundle"
                    className="w-full rounded-lg shadow-2xl"
                  />
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-yellow-400 rounded-full flex items-center justify-center transform rotate-12">
                    <span className="text-black font-bold text-lg -rotate-12">-75%</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Column - Features */}
            <div>
              {selectedTab === 'overview' && (
                <div className="space-y-6">
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center">
                        <Music className="w-6 h-6 text-orange-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">300 Samples With Full Stems</h3>
                        <p className="text-neutral-400">
                          Every sample includes separated stems for complete creative control. 
                          Mix and match elements to create unique beats.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Package className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">800 MIDI Chord Progressions</h3>
                        <p className="text-neutral-400">
                          Professional chord progressions in every key and style. 
                          Simply drag and drop into your DAW.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <Headphones className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">Analog Mastered Drum Kit</h3>
                        <p className="text-neutral-400">
                          Punchy kicks, crisp snares, and smooth hi-hats processed through 
                          vintage analog gear for that warm, professional sound.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-2">4 Style Packs Included</h3>
                        <ul className="text-neutral-400 space-y-1 mt-2">
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-400 mr-2" />
                            Boom Bap Essentials
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-400 mr-2" />
                            Vintage Soul Essentials
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-400 mr-2" />
                            Modern R&B Essentials
                          </li>
                          <li className="flex items-center">
                            <Check className="w-4 h-4 text-green-400 mr-2" />
                            Trap Essentials
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTab === 'details' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">What You'll Get</h3>
                  
                  <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-xl p-6">
                    <h4 className="text-xl font-bold mb-4">300+ Professional Samples</h4>
                    <ul className="space-y-3 text-neutral-300">
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>Every sample includes full stems for complete creative control</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>Mixed and mastered by industry professionals</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>Compatible with all major DAWs (FL Studio, Ableton, Logic, etc.)</span>
                      </li>
                      <li className="flex items-start">
                        <Check className="w-5 h-5 text-green-400 mr-3 mt-0.5" />
                        <span>100% royalty-free for commercial use</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                      <h4 className="font-bold mb-3 flex items-center">
                        <Music className="w-5 h-5 text-orange-400 mr-2" />
                        File Formats
                      </h4>
                      <ul className="space-y-2 text-sm text-neutral-400">
                        <li>• High-quality WAV files (24-bit)</li>
                        <li>• BPM and key labeled</li>
                        <li>• Organized folder structure</li>
                      </ul>
                    </div>
                    
                    <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                      <h4 className="font-bold mb-3 flex items-center">
                        <Download className="w-5 h-5 text-green-400 mr-2" />
                        Instant Access
                      </h4>
                      <ul className="space-y-2 text-sm text-neutral-400">
                        <li>• Download immediately after purchase</li>
                        <li>• Lifetime access to files</li>
                        <li>• Free future updates</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
              
              {selectedTab === 'bonus' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold mb-6">Exclusive Bonuses</h3>
                  
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                        <Award className="w-6 h-6 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">Mixer Presets (FL Studio & Ableton)</h4>
                        <p className="text-neutral-400">
                          Professional mixing chains used by industry producers. 
                          Just load and go - no more spending hours on mixing.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">Lifetime Updates</h4>
                        <p className="text-neutral-400">
                          Get all future additions to the bundle for free. 
                          We add new content every month!
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 border border-blue-500/30 rounded-xl p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-xl font-bold mb-2">Producer Community Access</h4>
                        <p className="text-neutral-400">
                          Join our exclusive Discord with 5,000+ producers. 
                          Get feedback, collaborate, and grow together.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Bundles Showcase Section */}
      <section className="py-20 bg-gradient-to-b from-neutral-950 to-black relative">
        {/* Animated background effect */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl animate-pulse" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-12">
            <span className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500 rounded-full text-green-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4 mr-2" />
              GET ALL 4 BUNDLES FOR THE PRICE OF 1
            </span>
            <h2 className="text-4xl font-bold mb-4">4 Complete Bundles Included</h2>
            <p className="text-xl text-neutral-400 max-w-3xl mx-auto">
              Get all four of our best-selling bundles for one incredible price. 
              Each bundle includes 75+ samples with stems.
            </p>
          </div>
          
          {/* Bundle Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {bundlesIncluded.map((bundle, index) => (
              <div 
                key={bundle.id}
                className="group bg-neutral-900/50 border border-neutral-800 rounded-2xl overflow-hidden hover:border-orange-500/50 transition-all transform hover:scale-[1.02] hover:shadow-2xl"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Cover Art */}
                  <div className="md:w-1/3 relative">
                    <img 
                      src={bundle.coverArt}
                      alt={bundle.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r" />
                  </div>
                  
                  {/* Bundle Info */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">{bundle.name}</h3>
                        <p className="text-neutral-400">{bundle.description}</p>
                      </div>
                      <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full">
                        INCLUDED
                      </span>
                    </div>
                    
                    {/* Original Price */}
                    <div className="text-right mb-3">
                      <span className="text-sm text-neutral-500">Individual Price</span>
                      <p className="text-xl font-bold text-neutral-400 line-through">$49.99</p>
                    </div>
                    
                    {/* Features */}
                    <div className="flex flex-wrap gap-3 mb-4">
                      {bundle.features.map((feature, idx) => (
                        <span key={idx} className="px-3 py-1 bg-neutral-800 text-neutral-300 text-sm rounded-full">
                          {feature}
                        </span>
                      ))}
                    </div>
                    
                    {/* View Samples Button */}
                    <button
                      onClick={() => setSelectedBundle(bundle.id)}
                      className={`text-sm font-medium ${
                        selectedBundle === bundle.id 
                          ? 'text-orange-400' 
                          : 'text-neutral-400 hover:text-white'
                      } transition-colors`}
                    >
                      {selectedBundle === bundle.id ? '▼' : '▶'} Preview Samples
                    </button>
                  </div>
                </div>
                
                {/* Sample Previews (Expandable) */}
                {selectedBundle === bundle.id && (
                  <div className="border-t border-neutral-800 p-6 space-y-3">
                    {bundle.samples.map((sample) => (
                      <div 
                        key={sample.id}
                        className="bg-black/50 border border-neutral-700 rounded-lg p-3"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white text-sm">{sample.name}</h4>
                            <p className="text-xs text-neutral-400">
                              {sample.bpm} • {sample.key}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs rounded-full">
                            WITH STEMS
                          </span>
                        </div>
                        {sample.url !== 'placeholder-url-1' && sample.url !== 'placeholder-url-2' && sample.url !== 'placeholder-url-3' ? (
                          <div className="h-12">
                            <WaveformPlayer
                              url={sample.url}
                              isPlaying={playingId === `${bundle.id}-${sample.id}`}
                              onPlayPause={() => setPlayingId(
                                playingId === `${bundle.id}-${sample.id}` 
                                  ? null 
                                  : `${bundle.id}-${sample.id}`
                              )}
                              height={48}
                              waveColor="#525252"
                              progressColor="#f97316"
                            />
                          </div>
                        ) : (
                          <div className="h-12 bg-neutral-800 rounded flex items-center justify-center text-xs text-neutral-500">
                            Sample preview coming soon
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Total Value Breakdown */}
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-2xl p-8 text-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-orange-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-red-500/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h3 className="text-2xl font-bold mb-6">Total Value Breakdown</h3>
              <div className="grid md:grid-cols-4 gap-4 mb-6">
                {bundlesIncluded.map((bundle) => (
                  <div key={bundle.id} className="bg-black/30 rounded-lg p-4">
                    <img 
                      src={bundle.coverArt}
                      alt={bundle.name}
                      className="w-16 h-16 rounded-lg mx-auto mb-2 object-cover"
                    />
                    <p className="text-neutral-400 text-sm mb-1">{bundle.name}</p>
                    <p className="text-xl font-bold text-white">$49.99</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-700 pt-6">
                <div className="flex items-center justify-center gap-8">
                  <div>
                    <p className="text-neutral-400 mb-2">Total Value</p>
                    <p className="text-4xl font-bold text-white line-through">$199.96</p>
                  </div>
                  <div className="text-4xl">→</div>
                  <div>
                    <p className="text-neutral-400 mb-2">Your Price</p>
                    <p className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
                      $49.99
                    </p>
                  </div>
                </div>
                <div className="mt-4 inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4 mr-2" />
                  You Save $150 (75% OFF)
                </div>
              </div>
            </div>
          </div>
          
          {/* CTA after bundles */}
          <div className="mt-12 text-center">
            <button
              onClick={handleCTA}
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-2xl"
            >
              <span className="mr-2">Get All 4 Bundles Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <span className="absolute -top-4 -right-4 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full animate-bounce">
                75% OFF
              </span>
            </button>
            <p className="mt-4 text-sm text-neutral-400">
              ⏰ Limited time offer • 💳 Secure checkout • ⚡ Instant download
            </p>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Trusted By 10,000+ Producers</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Mike Dean",
                role: "Platinum Producer",
                content: "This bundle has everything you need. The stems are fire and the MIDI progressions save me hours of work.",
                rating: 5
              },
              {
                name: "Sarah Chen",
                role: "Beat Maker",
                content: "Finally, a bundle that delivers on its promises. The analog drums hit different, and the mixer presets are pro-level.",
                rating: 5
              },
              {
                name: "Jordan Taylor",
                role: "Music Producer",
                content: "Been producing for 10 years and this is hands down the best value bundle I've purchased. Quality is insane!",
                rating: 5
              }
            ].map((testimonial, idx) => (
              <div key={idx} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-neutral-300 mb-4">"{testimonial.content}"</p>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-neutral-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-orange-900/20 to-red-900/20 border border-orange-500/30 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-red-500" />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Limited Time Offer</h2>
              <p className="text-xl text-neutral-300 mb-8">Get everything for one low price</p>
              
              <div className="mb-8">
                <span className="text-2xl text-neutral-500 line-through">$199.96</span>
                <div className="text-6xl font-bold text-white my-2">$49.99</div>
                <span className="inline-flex items-center px-4 py-2 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4 mr-2" />
                  You Save $150 (75% OFF)
                </span>
              </div>
              
              <button
                onClick={handleCTA}
                className="group relative inline-flex items-center px-12 py-5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-xl font-bold rounded-full transition-all transform hover:scale-105 shadow-2xl mb-6"
              >
                <span className="mr-3">Get Instant Access Now</span>
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-neutral-400">
                <span className="flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Secure Checkout
                </span>
                <span className="flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Instant Download
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Lifetime Access
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-neutral-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-4xl font-bold text-center mb-12">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Is this really royalty-free?",
                a: "Yes! All samples are 100% royalty-free. You can use them in commercial releases without any additional fees."
              },
              {
                q: "What DAWs are supported?",
                a: "All samples are in WAV format and work with any DAW. Mixer presets are included for FL Studio and Ableton."
              },
              {
                q: "How do I download after purchase?",
                a: "You'll receive an email with download links immediately after purchase. Files are hosted on our fast CDN."
              },
              {
                q: "Is there a money-back guarantee?",
                a: "Yes! We offer a 30-day money-back guarantee if you're not completely satisfied."
              }
            ].map((faq, idx) => (
              <div key={idx} className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2">{faq.q}</h3>
                <p className="text-neutral-400">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-b from-black to-neutral-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">Ready To Make Your Next Hit?</h2>
          <p className="text-xl text-neutral-300 mb-8">
            Join 10,000+ producers who are already creating fire beats with Hitmaker Bundle
          </p>
          
          <button
            onClick={handleCTA}
            className="group relative inline-flex items-center px-10 py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white text-lg font-bold rounded-full transition-all transform hover:scale-105 shadow-2xl mb-4"
          >
            <span className="mr-2">Get The Bundle Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="absolute -top-4 -right-4 px-3 py-1 bg-yellow-400 text-black text-xs font-bold rounded-full animate-bounce">
              75% OFF
            </span>
          </button>
          
          <p className="text-sm text-neutral-500">
            ⏰ Offer expires in {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s
          </p>
        </div>
      </section>

      {/* Sticky Bottom Bar (Mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-neutral-800 p-4 z-50">
        <button
          onClick={handleCTA}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg"
        >
          Get Bundle - $49.99
        </button>
      </div>
    </div>
  );
}