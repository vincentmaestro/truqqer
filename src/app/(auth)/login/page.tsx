
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';
import { LoginForm } from '@/app/components/auth/login';
import Link from 'next/link';

export default function Login() {

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>

      <LoginForm />

      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/signup" className="text-primary hover:underline font-medium">
            Create one
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
