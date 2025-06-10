// lib/like-migration.ts
import { createClient } from '@/lib/supabase/client';

export async function migrateLikesToUser(user: any) {
  if (!user?.id) return;

  try {
    const supabase = createClient();
    const anonymousId = localStorage.getItem('user_identifier');
    
    if (!anonymousId) return;

    // Get all anonymous likes
    const { data: anonymousLikes, error: fetchError } = await supabase
      .from('user_likes')
      .select('sample_id, created_at')
      .eq('user_identifier', anonymousId);

    if (fetchError || !anonymousLikes?.length) return;

    // Get existing user likes to avoid duplicates
    const { data: existingLikes, error: existingError } = await supabase
      .from('user_likes')
      .select('sample_id')
      .eq('user_identifier', user.id);

    if (existingError) {
      console.error('Error fetching existing likes:', existingError);
      return;
    }

    const existingSampleIds = new Set(existingLikes?.map(like => like.sample_id) || []);

    // Filter out likes that already exist for the user
    const likesToMigrate = anonymousLikes.filter(like => 
      !existingSampleIds.has(like.sample_id)
    );

    if (likesToMigrate.length === 0) {
      // Delete anonymous likes since they're all duplicates
      await supabase
        .from('user_likes')
        .delete()
        .eq('user_identifier', anonymousId);
      return;
    }

    // Create new likes with user ID
    const newLikes = likesToMigrate.map(like => ({
      user_identifier: user.id,
      sample_id: like.sample_id,
      created_at: like.created_at
    }));

    const { error: insertError } = await supabase
      .from('user_likes')
      .insert(newLikes);

    if (insertError) {
      console.error('Error migrating likes:', insertError);
      return;
    }

    // Delete old anonymous likes
    const { error: deleteError } = await supabase
      .from('user_likes')
      .delete()
      .eq('user_identifier', anonymousId);

    if (deleteError) {
      console.error('Error deleting anonymous likes:', deleteError);
    }

    console.log(`Migrated ${likesToMigrate.length} likes to user account`);
  } catch (error) {
    console.error('Like migration error:', error);
  }
}

export function generateUserIdentifier(): string {
  if (typeof window === 'undefined') return '';
  
  const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('user_identifier', id);
  return id;
}