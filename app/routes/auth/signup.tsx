import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '@alta/design-system/components/ui/button';
import { Input } from '@alta/design-system/components/ui/input';
import { Label } from '@alta/design-system/components/ui/label';
import { Text } from '@alta/design-system/components/ui/text';
import { Alert, AlertDescription } from '@alta/design-system/components/ui/alert';
import { Spinner } from '@alta/design-system/components/ui/spinner';
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
      <div className="mb-6 text-center">
        <Text variant="heading4">Create an account</Text>
        <Text variant="muted" className="mt-1">
          Get started with Alta
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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <Text variant="small" className="text-muted-foreground">
            Must be at least 6 characters
          </Text>
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          {loading ? 'Creating account...' : 'Sign Up'}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Text variant="small" className="text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </Text>
      </div>
    </div>
  );
}
