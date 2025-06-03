// types/index.ts

export interface Artist {
  id: string;
  name: string;
  bio?: string;
  image_url?: string;
  created_at: string;
}

export interface Sample {
  id: string;
  name: string;
  artist_id: string;
  artist?: Artist;
  genre: string;
  bpm: number;
  key: string;
  duration: string;
  tags: string[];
  file_url: string;
  waveform_data?: number[];
  downloads: number;
  likes: number;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface License {
  id: string;
  name: string;
  price: number;
  features: string[];
  is_popular: boolean;
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

export type Genre = 'all' | 'trap' | 'drill' | 'rnb' | 'soul';
export type SortBy = 'popular' | 'newest' | 'bpm' | 'name';