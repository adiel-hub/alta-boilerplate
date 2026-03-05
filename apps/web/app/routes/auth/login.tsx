import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@altahq/design-system/components/ui/button';
import { Input } from '@altahq/design-system/components/ui/input';
import { Label } from '@altahq/design-system/components/ui/label';
import { Text } from '@altahq/design-system/components/ui/text';
import { getSupabaseClient } from '~/lib/supabase/client';

export default function LoginRoute() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const supabase = getSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div>
      <Text variant="heading3" className="mb-6">
        Sign In
      </Text>
      {error && (
        <Text variant="small" className="mb-4 text-destructive">
          {error}
        </Text>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <Text variant="small" className="mt-4 text-center text-muted-foreground">
        Don't have an account?{' '}
        <Link to="/signup" className="text-primary underline">
          Sign up
        </Link>
      </Text>
      <Text variant="small" className="mt-2 text-center">
        <Link to="/forgot-password" className="text-muted-foreground underline">
          Forgot password?
        </Link>
      </Text>
    </div>
  );
}
