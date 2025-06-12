// types/index.ts

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  created_at: string;
}

export interface Sample {
  id: string;
  name: string;
  artist?: {
    name: string;
  };
  file_url: string;
  bpm: number;
  key: string;
  genre: string;
  tags: string[];
  downloads?: number;
  created_at?: string;
  has_stems?: boolean; // Add this line
}

export interface License {
  id: string;
  name: string;
  price: number;
  description: string;
  features?: string[];
  max_streams?: number;
  max_copies?: number;
  max_revenue?: number;
  is_popular?: boolean;
  sort_order: number;
}

export interface UserDownload {
  id: string;
  user_email: string;
  sample_id: string;
  downloaded_at: string;
  ip_address?: string;
}

export interface UserPurchase {
  id: string;
  user_email: string;
  license_id: string;
  stripe_payment_id: string;
  amount: number;
  purchased_at: string;
}

export interface UserLike {
  id: string;
  user_identifier: string;
  sample_id: string;
  created_at: string;
}

export type Genre = 'all' | 'trap' | 'rnb' | 'soul';
export type SortBy = 'popular' | 'newest' | 'bpm' | 'name';

export interface EmailCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string) => void;
  triggerType: 'download_limit' | 'premium_sample' | 'feature_access';
}

export interface WaveformPlayerProps {
  url: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  height?: number;
  waveColor?: string;
  progressColor?: string;
  backgroundColor?: string;
}

export interface GenreCollection {
  id: string;
  name: string;
  slug: string;
  emoji?: string; // Make optional since we're removing emojis
  icon: React.ReactNode;
  description: string;
  bpmRange: string;
  tags: string[];
  gradient: string;
  accentColor: string;
}

// Add these new interfaces to your existing types/index.ts file

export interface Pack {
  id: string;
  name: string;
  slug: string;
  description?: string;
  cover_art_url: string;
  artist?: Artist;
  artist_id?: string;
  genre?: string;
  release_date: string;
  featured: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  sample_count?: number;
  samples?: Sample[];
}

export interface PackSample {
  pack_id: string;
  sample_id: string;
  position: number;
}

// Optional: Update your Sample interface to include pack reference
// You can modify your existing Sample interface to add:
// primary_pack_id?: string;
// pack?: Pack;