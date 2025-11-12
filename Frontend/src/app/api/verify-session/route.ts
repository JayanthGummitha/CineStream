/**
 * API Route: Verify Stripe Checkout Session
 * 
 * Verifies a completed checkout session and returns subscription details.
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyCheckoutSession } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Missing session_id parameter' },
        { status: 400 }
      );
    }

    // Verify the session with Stripe
    const result = await verifyCheckoutSession(sessionId);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    // TODO: Update user subscription in database
    // Example:
    // await updateUserSubscription({
    //   userId: result.subscription?.metadata.userId,
    //   planId: result.subscription?.metadata.planId,
    //   stripeSubscriptionId: result.subscription?.id,
    //   stripeCustomerId: result.customer?.id,
    // });

    return NextResponse.json({
      success: true,
      subscription: {
        id: result.subscription?.id,
        status: result.subscription?.status,
        planId: result.subscription?.metadata.planId,
        billingCycle: result.subscription?.metadata.billingCycle,
      },
      customer: {
        id: result.customer?.id,
        email: result.customer?.email,
      },
    });
  } catch (error) {
    console.error('Error verifying session:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Failed to verify session';
    
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
