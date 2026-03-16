import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '@alta/design-system/components/ui/spinner';
import { Text } from '@alta/design-system/components/ui/text';
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
    <div className="flex items-center justify-center gap-2">
      <Spinner />
      <Text variant="muted">Completing sign in...</Text>
    </div>
  );
}
