'use client';
import { useActionState, useEffect, useRef, useState, useTransition } from 'react';
import { handleVerifyPhone, handleConfirmationCode } from '@/actions/signup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function Phone({ email }: { email: string }) {
  const [loading, startTransition] = useTransition();
  const [verifyPhoneStage, setVerifyPhoneStage] = useState(1);
  const [verificationCodeResult, sendVerificationCode] = useActionState(handleVerifyPhone, { success: false, message: '' });
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const digitRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [confirmCodeResult, confirmCode] = useActionState(handleConfirmationCode, { success: false, message: '' });

  async function handlePhone(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
    const captchaToken = await grecaptcha.execute(
        '6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP',
        { action: 'submit' }
    );

    startTransition(() => {
      form.set('captcha-token', captchaToken);
      form.set('email', email);
    
      sendVerificationCode(form);
    });
  }

  useEffect(() => {
    if(verificationCodeResult.success)
      setVerifyPhoneStage(2);
  }, [verificationCodeResult.success]);

  function enterDigit(e: React.ChangeEvent<HTMLInputElement>, index: number) {
    if(!/^\d+?$/.test(e.target.value))
      return;

    if(digits[index]) {
      digitRefs.current[index + 1]?.focus();
      return;
    }

    const x = [...digits];

    if(e.target.value.length > 1) {
      for(let i = 0; i < 6; i++) {
        /^\d+?$/.test(e.target.value[i]) ?
        x[i] = e.target.value[i] :
        x[i] = '';
      }
      setDigits(x);
      digitRefs.current[5]?.focus();
    }
    else {
      x[index] = e.target.value;
      setDigits(x);
      digitRefs.current[index + 1]?.focus();
    }
  }

  function removeDigit(e: React.KeyboardEvent<HTMLInputElement>, index: number) {
    if(e.key === 'Backspace') {
      const x = [...digits];

      if(!digits[index]) {
          digitRefs.current[index - 1]?.focus();
          return;
      }

      x[index] = '';
      setDigits(x);
    }
  }

  async function handleVerification(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const form = new FormData(e.currentTarget);
      const captchaToken = await grecaptcha.execute(
      '6LfYZKUsAAAAAB_0BQnWUfHOjWBjVrOayt4aSZvP',
      { action: 'submit' }
    );

    startTransition(() => {
      form.set('captcha-token', captchaToken);

      const code = digits.join('');
      form.set('code', code);

      const token = verificationCodeResult.data!
      form.set('token', token);
    
      confirmCode(form);
    });
  }

  return (
    <Card className="w-full max-w-md">
      {verifyPhoneStage === 1 && (
        <>
          <CardHeader>
            <CardTitle className="text-2xl">Verify your phone</CardTitle>
            <CardDescription>
              We'll send you a code to confirm your number
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handlePhone} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone number</Label>
                <div className="flex gap-3">
                  <div className="px-4 py-2 border rounded-md bg-muted text-muted-foreground font-medium">
                    +234
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    className="flex-1"
                    disabled={loading}
                  />
                </div>
              </div>

              {verificationCodeResult.message && (
                <div className={cn(
                  "p-3 rounded-lg border",
                  verificationCodeResult.success
                    ? "bg-success/10 border-success/20"
                    : "bg-destructive/10 border-destructive/20"
                )}>
                  <p className={cn(
                    "text-sm font-medium",
                    verificationCodeResult.success ? "text-success" : "text-destructive"
                  )}>
                    {verificationCodeResult.message}
                  </p>
                </div>
              )}

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Sending code...
                  </span>
                ) : (
                  'Send verification code'
                )}
              </Button>
            </form>
          </CardContent>
        </>
      )}

      {verifyPhoneStage === 2 && (
        <>
          <CardHeader>
            <CardTitle className="text-2xl">Enter verification code</CardTitle>
            <CardDescription>We sent a 6-digit code to your phone</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleVerification} className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-6 gap-2">
                  {digits.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      ref={(el) => {
                        digitRefs.current[index] = el;
                      }}
                      onChange={(e) => enterDigit(e, index)}
                      onKeyDown={(e) => removeDigit(e, index)}
                      className="aspect-square text-center text-2xl font-bold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      disabled={loading}
                    />
                  ))}
                </div>

                {confirmCodeResult.message && (
                  <div className={cn(
                    "p-3 rounded-lg border",
                    confirmCodeResult.success
                      ? "bg-success/10 border-success/20"
                      : "bg-destructive/10 border-destructive/20"
                  )}>
                    <p className={cn(
                      "text-sm font-medium",
                      confirmCodeResult.success ? "text-success" : "text-destructive"
                    )}>
                      {confirmCodeResult.message}
                    </p>
                  </div>
                )}
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  'Verify code'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter className="flex justify-center">
            <button
              type="button"
              onClick={() => setVerifyPhoneStage(1)}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Didn't receive a code? Try again
            </button>
          </CardFooter>
        </>
      )}
    </Card>
  );
}
