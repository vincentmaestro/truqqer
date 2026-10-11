import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { AlertCircle, CheckCircle2, BookOpen, MessageSquare, HelpCircle, Clock, Check, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { checkDriverApprovalStatus } from '@/actions/signup';

function ErrorMessage({ info }: {
  info: string
}) {
  return (
    <div className="bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center px-4">
      <Card className="w-full max-w-md border-destructive/20">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
        
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <CardTitle>Unable to Load</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{info}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Approved() {
    return (
    <div className="max-w-2xl">
      <Card className="border-primary/20 bg-gradient-to-br from-card to-card/80 overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-primary to-primary/50" />
        
        <CardHeader className="text-center space-t-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-5">
              <Check className="w-10 h-10 text-green-500" />
            </div>
          </div>
            
          <div className="space-y-2">
            <CardTitle className="text-3xl">Your application Was Approved</CardTitle>
            <p className="text-base text-muted-foreground">
              Thank you for joining TruQQer! You may now proceed to login.
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="">
            <Link href="/login">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-border/50 hover:border-primary/50 h-10"
              >
                <span className='text-lg'>Login</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function PendingApprovalPage({ searchParams }: {
  searchParams: Promise<{ [key: string]: string | undefined }>
}) {
  const { token } = await searchParams;
  // const [loading, setLoading] = useState(!!urlToken);

  if(!token) 
    return <ErrorMessage info='The link you entered might be incorrect or broken' />

  const driverApprovalStatus = await checkDriverApprovalStatus(token);

  if(!driverApprovalStatus.success)
    return <ErrorMessage info={driverApprovalStatus.message} />

  if(driverApprovalStatus.success && driverApprovalStatus.message === 'Approved')
    return <Approved />
  
  return (
    <div className="max-w-2xl">
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
                  <p className="text-xs text-muted-foreground">Please watch your inbox/spam folder for any updates regarding your application</p>
                </div>
              </div>
            </div>
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
    </div>
  );
}
