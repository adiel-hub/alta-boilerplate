import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { getSupabaseClient } from '~/lib/supabase/client';

export default function AuthCallbackRoute() {
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        navigate('/dashboard');
      }
    });
  }, [navigate, supabase]);

  return (
    <div className="text-center">
      <p className="text-gray-500">Completing sign in...</p>
    </div>
  );
}
