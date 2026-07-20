'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { AlertCircle, CheckCircle2, Copy, BookOpen, MessageSquare, HelpCircle, Clock, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface ApprovalStatus {
  approved: boolean;
  message?: string;
}

export default function PendingApprovalPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlToken = searchParams.get('token');

  const [loading, setLoading] = useState(!!urlToken);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<ApprovalStatus | null>(null);
  const [copied, setCopied] = useState(false);
  
  const [localToken, setLocalToken] = useState<string>(urlToken || '');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!urlToken) {
      setError('No tracking ID provided');
      setLoading(false);
      return;
    }

    checkApprovalStatus(urlToken);
  }, []);

  function handleTokenChange(newToken: string) {
    setLocalToken(newToken);
    
    if (newToken.trim()) {
      router.replace(`/signup/pending-approval?token=${encodeURIComponent(newToken.trim())}`);
    } else {
      router.replace('/signup/pending-approval');
    }
  }

  async function checkApprovalStatus(token: string) {
    if (!token.trim()) {
      setError('Please enter a tracking ID');
      setStatus(null);
      return;
    }

    try {
      setChecking(true);
      setError(null);
      setStatus(null);

      const response = await fetch(`/api/driver/approval-status?token=${encodeURIComponent(token)}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.message || 'Failed to check status');
        setStatus(null);
        return;
      }

      setStatus(result.data);

      if (result.data.approved) {
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
      console.error(err);
      setStatus(null);
    } finally {
      setChecking(false);
    }
  }

  function handleCheckStatus() {
    checkApprovalStatus(localToken);
  }

  function handleInputKeyPress(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleCheckStatus();
    }
  }

  function copyTrackingNumber() {
    if (!urlToken) return;
    
    const trackingUrl = `${window.location.origin}/pending-approval?token=${urlToken}`;
    navigator.clipboard.writeText(trackingUrl);
    
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading && !error && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Checking your status...</p>
        </div>
      </div>
    );
  }

  if (error && !status) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-destructive" />
              <CardTitle>Unable to Load</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">{error}</p>
              <p className="text-xs text-muted-foreground/70">
                Something went wrong... Please try again.
              </p>
            </div>

            <div className="space-y-3 py-4 px-4 rounded-lg bg-muted/20 border border-border/50">
              <p className="text-sm font-semibold text-foreground">Enter Tracking ID</p>
              <div className="space-y-2">
                <Input
                  type="text"
                  value={localToken}
                  onChange={(e) => handleTokenChange(e.target.value)}
                  onKeyDown={handleInputKeyPress}
                  placeholder="Paste your tracking ID"
                  className="font-mono text-xs border-primary/20 focus:border-primary/50"
                />
                <Button
                  onClick={handleCheckStatus}
                  disabled={checking || !localToken.trim()}
                  className="w-full bg-primary hover:bg-primary-600 text-primary-foreground"
                >
                  {checking ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    'Check Status'
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Link href="/" passHref>
                <Button variant="outline" className="w-full">
                  Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status?.approved) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4">
        <Card className="w-full max-w-md border-success/20 bg-success/5">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-success/20 p-4">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl">Application Approved! 🎉</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Your driver application has been approved. You can now log in and start accepting rides.
            </p>
            <div className="text-sm text-muted-foreground animate-pulse">
              Redirecting to login...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80 overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
          
          <CardHeader className="text-center space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-5 animate-pulse">
                <Clock className="w-10 h-10 text-primary" />
              </div>
            </div>
            
            <div className="space-y-2">
              <CardTitle className="text-3xl">Application Under Review</CardTitle>
              <p className="text-base text-muted-foreground">
                Thank you for joining TruQQer! We're reviewing your application.
              </p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="space-y-3 py-4 px-4 rounded-lg bg-muted/30">
              <p className="text-sm font-semibold text-foreground">What's Happening</p>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="rounded-full bg-primary/20 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Application submitted</p>
                    <p className="text-xs text-muted-foreground">We received all your documents</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-full bg-primary/10 w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Under review</p>
                    <p className="text-xs text-muted-foreground">Our team is verifying your information (24-48 hours)</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="rounded-full bg-muted w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-muted-foreground">3</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">You'll be notified</p>
                    <p className="text-xs text-muted-foreground">Email confirmation when approved</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3 py-4 px-4 rounded-lg bg-muted/20 border border-border/50">
              <p className="text-sm font-semibold text-foreground">Tracking Number</p>
              <p className="text-xs text-muted-foreground">
                Save this to check your status anytime
              </p>
              <button
                onClick={copyTrackingNumber}
                className="w-full flex items-center justify-between gap-2 p-3 rounded-lg bg-background border border-border/50 hover:border-primary/50 hover:bg-muted/50 transition-all group"
              >
                <span className="font-mono text-xs truncate text-muted-foreground group-hover:text-foreground">
                  {urlToken?.substring(0, 50)}...
                </span>
                <Copy
                  className={`w-4 h-4 flex-shrink-0 transition-all ${
                    copied ? 'text-success' : 'text-muted-foreground group-hover:text-primary'
                  }`}
                />
              </button>
              <p className={`text-xs transition-all ${copied ? 'text-success' : 'text-muted-foreground'}`}>
                {copied ? '✓ Copied to clipboard' : 'Click to copy full tracking URL'}
              </p>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <p className="text-xs font-semibold text-muted-foreground">While You Wait</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-1">
                <Link href="/about-truqqer" passHref>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 border-border/50 hover:border-primary/50 h-10"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span className="hidden sm:inline">Learn About TruQQer</span>
                    <span className="sm:hidden">About</span>
                  </Button>
                </Link>
                
                <Link href="/contact-support" passHref>
                  <Button
                    variant="outline"
                    className="w-full justify-center gap-2 border-border/50 hover:border-primary/50 h-10"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span className="hidden sm:inline">Contact Support</span>
                    <span className="sm:hidden">Support</span>
                  </Button>
                </Link>
              </div>

              <Link href="/faq" passHref>
                <Button
                  variant="ghost"
                  className="w-full justify-center gap-2 text-muted-foreground hover:text-foreground h-10"
                >
                  <HelpCircle className="w-4 h-4" />
                  FAQs
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            Questions? We're here to help
          </p>
          <p className="text-xs text-muted-foreground/70">
            Average review time: <span className="font-semibold text-foreground">24-48 hours</span>
          </p>
        </div>
      </div>
    </div>
  );
}
