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
    id: string;
    name: string;
  };
  genre: string;
  bpm: number;
  key: string;
  duration: string;
  file_url: string;
  has_stems: boolean; // This is what controls the STEMS badge
  tags: string[];
  downloads: number;
  likes: number;
  is_premium?: boolean;
  created_at: string;
  updated_at?: string;
  waveform_data?: number[];
}

export interface License {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_popular: boolean;
  sort_order: number;
  created_at: string;
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