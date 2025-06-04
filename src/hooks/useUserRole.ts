// hooks/useUserRole.ts

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useUserRole() {
  const [role, setRole] = useState<'admin' | 'producer' | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function checkRole() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setRole(null);
          setLoading(false);
          return;
        }

        // Fetch user profile with role
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        setRole(profile?.role || 'producer');
      } catch (error) {
        console.error('Error fetching role:', error);
        setRole('producer'); // Default to producer on error
      } finally {
        setLoading(false);
      }
    }

    checkRole();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkRole();
    });

    return () => subscription.unsubscribe();
  }, []);

  return { role, loading, isAdmin: role === 'admin' };
}