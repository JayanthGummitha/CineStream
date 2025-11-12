/**
 * Checkout Success Page
 * 
 * Demo page shown after Stripe checkout redirect.
 * In production, this would verify the session and update user subscription.
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/navigation/header';
import { Footer } from '@/components/navigation/footer';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

  const sessionId = searchParams.get('session_id');
  const planId = searchParams.get('plan');

  useEffect(() => {
    async function verifySession() {
      if (!sessionId) {
        setStatus('error');
        return;
      }

      try {
        // Verify the session with Stripe
        const response = await fetch(`/api/verify-session?session_id=${sessionId}`);
        const data = await response.json();

        if (data.success) {
          setStatus('success');
          console.log('Checkout successful:', data);
          
          // Redirect to subscription page after 3 seconds
          setTimeout(() => {
            router.push('/subscription');
          }, 3000);
        } else {
          setStatus('error');
          console.error('Checkout verification failed:', data.error);
        }
      } catch (error) {
        console.error('Error verifying checkout:', error);
        setStatus('error');
      }
    }

    verifySession();
  }, [sessionId, router]);

  return (
    <>
      <Header isAuthenticated={true} />
      
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <h1 className="text-2xl font-bold text-white">Processing your subscription...</h1>
              <p className="text-gray-400">Please wait while we confirm your payment.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Subscription Activated!</h1>
              <p className="text-gray-300">
                Your <span className="text-yellow-400 font-semibold capitalize">{planId}</span> plan is now active.
              </p>
              <p className="text-sm text-gray-400">
                Redirecting you back to subscriptions...
              </p>
              <div className="pt-4">
                <button
                  onClick={() => router.push('/subscription')}
                  className="px-6 py-3 bg-yellow-400 text-black font-semibold rounded-full hover:bg-yellow-500 transition-colors"
                >
                  View My Subscription
                </button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="space-y-6">
              <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-white">Something went wrong</h1>
              <p className="text-gray-300">
                We couldn't process your subscription. Please try again.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => router.push('/subscription')}
                  className="px-6 py-3 bg-gray-700 text-white font-semibold rounded-full hover:bg-gray-600 transition-colors"
                >
                  Back to Plans
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </>
  );
}
