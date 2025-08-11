import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useAdmin = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      console.log('Checking admin role for user:', user.email);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();

        console.log('Admin check result:', { data, error });

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking admin role:', error);
          setIsAdmin(false);
        } else if (!data) {
          // No admin role found. Auto-assign for the allowed email.
          if (user.email === 'surajchauhan76604@gmail.com') {
            const { error: assignError } = await supabase
              .from('user_roles')
              .insert({ user_id: user.id, role: 'admin' });

            if (assignError) {
              console.error('Failed to auto-assign admin role:', assignError);
              setIsAdmin(false);
            } else {
              console.log('Auto-assigned admin role to allowed user.');
              setIsAdmin(true);
            }
          } else {
            setIsAdmin(false);
          }
        } else {
          const isAdminUser = !!data;
          console.log('User is admin:', isAdminUser);
          setIsAdmin(isAdminUser);
        }
      } catch (error) {
        console.error('Error checking admin role:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkAdminRole();
  }, [user]);

  const assignAdminRole = async (userEmail: string) => {
    if (!user) return false;

    try {
      // Prefer assigning to the currently authenticated user if emails match
      if (user.email === userEmail) {
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: user.id, role: 'admin' });

        if (error) {
          console.error('Error assigning admin role to current user:', error);
          return false;
        }
        return true;
      }

      // Fallback: try to resolve user_id by email from profiles table if different account
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', userEmail)
        .single();

      if (profileError || !profile) {
        console.error('User not found in profiles table for admin assignment:', profileError);
        return false;
      }

      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: profile.user_id, role: 'admin' });

      if (error) {
        console.error('Error assigning admin role (profiles fallback):', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error assigning admin role:', error);
      return false;
    }
  };

  return {
    isAdmin,
    loading,
    assignAdminRole
  };
};