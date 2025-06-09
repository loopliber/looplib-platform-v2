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
  file_url: string;
  bpm: number;
  key: string;
  genre: string;
  artist_id?: string;
  artist?: Artist;
  created_at?: string;
  tags: string[];
  downloads?: number; // Add this optional property
  download_count?: number; // Add this optional property
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
  sample_id: string;
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