'use client';
import { useActionState, useEffect, useState, useTransition } from 'react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { CardContent } from '@/app/components/ui/card';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { login } from '@/actions/auth';
import { useRouter } from 'next/navigation';
import AuthInfo from '@/app/components/auth/auth-info';

export function LoginForm() {
    const [state, submit] = useActionState(login, {
      success: false,
      message: '',
    });
    const [loading, startTransition] = useTransition();
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();
    const [info, setInfo] = useState<string | undefined>(undefined);
    
    async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault();
        const form = new FormData(e.currentTarget);
    
      const token = await grecaptcha.execute(
        process.env.NEXT_PUBLIC_CAPTCHA_CLIENT_KEY!,
        { action: 'login' }
      );
      form.set('captcha-token', token);
    
      startTransition(() => {
        submit(form);
      });
    }
    
    useEffect(() => {
        if('message' in state) {
            setInfo(state.message);
        }

        if('data' in state) {
            const token = state.data;
        
            //ZUSTAND WILL STORE THIS TOKEN

            router.replace(`/explore`);
        }
    }, [state, router]);

    return(
        <CardContent>
          <form onSubmit={handleLogin} className="mt-4 space-y-5">
            { info && <AuthInfo info={info} /> }
        
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                autoComplete="email"
                placeholder="you@example.com"
              />
            </div>
        
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  autoComplete="current-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(prev => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
        
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
    );
}
