/**
 * API Route: Create Stripe Checkout Session
 * 
 * Handles creation of Stripe checkout sessions for subscription payments.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, getStripePriceId, isStripeConfigured } from '@/lib/stripe';

export async function POST(request: NextRequest) {
  try {
    // Check if Stripe is configured
    if (!isStripeConfigured()) {
      return NextResponse.json(
        { 
          error: 'Stripe is not configured. Please add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY to your .env.local file.',
          details: 'See STRIPE_SETUP_GUIDE.md for setup instructions.'
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { planId, billingCycle, userId, customerEmail } = body;

    // Validate required fields
    if (!planId || !billingCycle) {
      return NextResponse.json(
        { error: 'Missing required fields: planId and billingCycle' },
        { status: 400 }
      );
    }

    // Validate billing cycle
    if (!['monthly', 'annual'].includes(billingCycle)) {
      return NextResponse.json(
        { error: 'Invalid billing cycle. Must be "monthly" or "annual"' },
        { status: 400 }
      );
    }

    // Get Stripe price ID
    const priceId = getStripePriceId(planId, billingCycle);

    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or billing cycle' },
        { status: 400 }
      );
    }

    // Create checkout session
    const session = await createCheckoutSession({
      priceId,
      planId,
      billingCycle,
      userId,
      customerEmail,
    });

    // Return session details
    return NextResponse.json({
      sessionId: session.sessionId,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Return more specific error message
    const errorMessage = error instanceof Error ? error.message : 'Failed to create checkout session';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
