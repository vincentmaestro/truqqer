'use client';
import { useActionState, useTransition } from 'react';
import { handleVerifyEmail } from '@/actions/signup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';

export default function Email({ info }: { info?: string }) {
  const [submitEmailResult, submitEmail] = useActionState(handleVerifyEmail, {
    success: false,
    message: '',
  });
  const [loading, startTransition] = useTransition();

  async function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const token = await grecaptcha.execute(
      '6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP',
      { action: 'submit' }
    );

    startTransition(async () => {
      form.set('captcha-token', token);
      submitEmail(form);
    });
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Get started</CardTitle>
        <CardDescription>Let's start with your email</CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleEmail} className="space-y-4">
          {info && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-sm text-destructive">{info}</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              name="email"
              placeholder="you@example.com"
              disabled={submitEmailResult.success || loading}
            />

            {submitEmailResult.message && (
              <div className={
                `p-3 rounded-lg
                ${submitEmailResult.success ? 'bg-success/10 border border-success/20' : 'bg-destructive/10 border-destructive/20'}`
              }>
                <p className={`text-sm font-medium ${submitEmailResult.success ? 'text-success' : 'text-destructive'}`}>
                  {submitEmailResult.message}
                </p>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={submitEmailResult.success || loading}
            className="w-full"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending...</span>
              </div>
            ) : (
              'Continue'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <a href="/login" className="text-primary hover:underline font-medium">
            Sign in
          </a>
        </p>
      </CardFooter>
    </Card>
  );
}