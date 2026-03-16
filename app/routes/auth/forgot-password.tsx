import { useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@alta/design-system/components/ui/button';
import { Input } from '@alta/design-system/components/ui/input';
import { Label } from '@alta/design-system/components/ui/label';
import { Text } from '@alta/design-system/components/ui/text';
import { Alert, AlertDescription } from '@alta/design-system/components/ui/alert';
import { Spinner } from '@alta/design-system/components/ui/spinner';
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
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <Text variant="heading4" className="mb-2">
          Check your email
        </Text>
        <Text variant="muted" className="mb-6">
          We sent a password reset link to <span className="font-medium text-foreground">{email}</span>
        </Text>
        <Button variant="outline" asChild className="w-full">
          <Link to="/login">Back to sign in</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <Text variant="heading4">Reset password</Text>
        <Text variant="muted" className="mt-1">
          Enter your email to receive a reset link
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
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? <Spinner className="mr-2 h-4 w-4" /> : null}
          {loading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <Button variant="link" asChild>
          <Link to="/login" className="text-muted-foreground">
            Back to sign in
          </Link>
        </Button>
      </div>
    </div>
  );
}
