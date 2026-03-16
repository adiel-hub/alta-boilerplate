import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@alta/design-system/components/ui/button';
import { Input } from '@alta/design-system/components/ui/input';
import { Label } from '@alta/design-system/components/ui/label';
import { Text } from '@alta/design-system/components/ui/text';
import { Alert, AlertDescription } from '@alta/design-system/components/ui/alert';
import { Spinner } from '@alta/design-system/components/ui/spinner';
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
      <div className="mb-6 text-center">
        <Text variant="heading4">Welcome back</Text>
        <Text variant="muted" className="mt-1">
          Sign in to your account
        </Text>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
              Forgot password?
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Text variant="small" className="text-muted-foreground">
          Don't have an account?{' '}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </Text>
      </div>
    </div>
  );
}
