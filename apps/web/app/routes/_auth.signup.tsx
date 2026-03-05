import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@altahq/design-system/components/ui/button';
import { Input } from '@altahq/design-system/components/ui/input';
import { Label } from '@altahq/design-system/components/ui/label';
import { Text } from '@altahq/design-system/components/ui/text';
import { getSupabaseClient } from '~/lib/supabase/client';

export default function SignupRoute() {
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

    const { error } = await supabase.auth.signUp({ email, password });
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
        Sign Up
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
            minLength={6}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      <Text variant="small" className="mt-4 text-center text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="text-primary underline">
          Sign in
        </Link>
      </Text>
    </div>
  );
}
