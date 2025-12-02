'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSubscription } from '@/hooks/useSubscription';

export function CTASection() {
  const { isNotRegistered, isRegisteredWithExpiredTrial, hasActivePaidPlan, isLoading } = useSubscription();

  // Don't render anything if user has an active paid plan or still loading
  if (hasActivePaidPlan || isLoading) {
    return null;
  }

  return (
    <section className="full-width-minimal spacing-section text-center">
      <div className="max-w-responsive mx-auto space-responsive-large">
        <h2 className="heading-hero font-bold">
          Ready to start watching?
        </h2>
        <p className="body-large text-muted-foreground">
          Join millions of users streaming their favorite movies and TV shows on CineStream.
        </p>
        <div className="flex items-center justify-center gap-responsive-large">
          {/* Case 1: Not registered → Show "Start Free Trial" + "View Plans" */}
          {isNotRegistered && (
            <>
              <Button 
                className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-semibold text-lg transition-colors" 
                asChild
              >
                <Link href="/signup">Start Free Trial</Link>
              </Button>
              <Button 
                className="border-2 border-border hover:bg-accent hover:text-accent-foreground px-10 py-4 rounded-full font-semibold text-lg transition-colors" 
                asChild
              >
                <Link href="/subscription">View Plans</Link>
              </Button>
            </>
          )}
          
          {/* Case 2: Registered + Free trial expired/completed → Show only "View Plans" */}
          {isRegisteredWithExpiredTrial && (
            <Button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-10 py-4 rounded-full font-semibold text-lg transition-colors" 
              asChild
            >
              <Link href="/subscription">View Plans</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
