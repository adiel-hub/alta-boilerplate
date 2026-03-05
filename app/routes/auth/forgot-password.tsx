import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@altahq/design-system/components/ui/button';
import { Input } from '@altahq/design-system/components/ui/input';
import { Label } from '@altahq/design-system/components/ui/label';
import { Text } from '@altahq/design-system/components/ui/text';
import { getSupabaseClient } from '~/lib/supabase/client';

export default function ForgotPasswordRoute() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = getSupabaseClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/callback`,
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="text-center">
        <Text variant="heading3" className="mb-4">
          Check your email
        </Text>
        <Text variant="muted">We sent a password reset link to {email}</Text>
        <Link to="/login" className="mt-4 inline-block text-sm text-primary underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Text variant="heading3" className="mb-6">
        Reset Password
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
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <Text variant="small" className="mt-4 text-center">
        <Link to="/login" className="text-muted-foreground underline">
          Back to sign in
        </Link>
      </Text>
    </div>
  );
}
