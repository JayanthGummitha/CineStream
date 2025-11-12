/**
 * API Route: Stripe Webhook Handler
 * 
 * Handles Stripe webhook events for subscription lifecycle management.
 * 
 * Setup:
 * 1. Run: stripe listen --forward-to localhost:3000/api/webhooks/stripe
 * 2. Copy webhook secret to .env.local as STRIPE_WEBHOOK_SECRET
 * 3. In production, create webhook at: https://dashboard.stripe.com/webhooks
 */

import { NextRequest, NextResponse } from 'next/server';
import { getStripeInstance, STRIPE_CONFIG } from '@/lib/stripe';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const stripeInstance = getStripeInstance();
  
  if (!stripeInstance) {
    return NextResponse.json(
      { error: 'Stripe is not configured' },
      { status: 500 }
    );
  }

  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripeInstance.webhooks.constructEvent(
      body,
      signature,
      STRIPE_CONFIG.webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log('✅ Checkout session completed:', session.id);
        
        // TODO: Update user subscription in database
        // await updateUserSubscription({
        //   userId: session.client_reference_id,
        //   planId: session.metadata?.planId,
        //   stripeSubscriptionId: session.subscription as string,
        //   stripeCustomerId: session.customer as string,
        //   status: 'active',
        // });
        
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('✅ Subscription created:', subscription.id);
        
        // TODO: Handle new subscription
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('🔄 Subscription updated:', subscription.id);
        
        // TODO: Update subscription status in database
        // await updateSubscriptionStatus({
        //   stripeSubscriptionId: subscription.id,
        //   status: subscription.status,
        // });
        
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        console.log('❌ Subscription cancelled:', subscription.id);
        
        // TODO: Handle subscription cancellation
        // await cancelUserSubscription({
        //   stripeSubscriptionId: subscription.id,
        // });
        
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('💰 Payment succeeded:', invoice.id);
        
        // TODO: Send payment confirmation email
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        console.log('⚠️ Payment failed:', invoice.id);
        
        // TODO: Send payment failure notification
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
