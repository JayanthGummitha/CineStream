/**
 * Stripe Configuration and Utilities
 *
 * Real Stripe payment integration for CineStream subscriptions.
 */

import Stripe from "stripe";
import { loadStripe } from "@stripe/stripe-js";

/**
 * Stripe configuration
 */
export const STRIPE_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  secretKey: process.env.STRIPE_SECRET_KEY || "",
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || "",
};

/**
 * Check if Stripe is configured
 */
export function isStripeConfigured(): boolean {
  return !!(STRIPE_CONFIG.secretKey && STRIPE_CONFIG.publishableKey);
}

/**
 * Initialize Stripe instance (server-side only)
 * Returns null if not configured
 */
export function getStripeInstance(): Stripe | null {
  if (!STRIPE_CONFIG.secretKey) {
    console.warn("Stripe secret key not configured");
    return null;
  }

  return new Stripe(STRIPE_CONFIG.secretKey, {
    apiVersion: "2025-09-30.clover",
    typescript: true,
  });
}

// Export stripe instance for backward compatibility
export const stripe = getStripeInstance();

/**
 * Price IDs for each plan
 * TODO: Replace with actual Price IDs from Stripe Dashboard
 * Create products at: https://dashboard.stripe.com/products
 */
export const STRIPE_PRICE_IDS = {
  basic_monthly:
    process.env.STRIPE_PRICE_BASIC_MONTHLY || "price_basic_monthly",
  basic_yearly: process.env.STRIPE_PRICE_BASIC_YEARLY || "price_basic_yearly",
  premium_monthly:
    process.env.STRIPE_PRICE_PREMIUM_MONTHLY || "price_premium_monthly",
  premium_yearly:
    process.env.STRIPE_PRICE_PREMIUM_YEARLY || "price_premium_yearly",
  family_monthly:
    process.env.STRIPE_PRICE_FAMILY_MONTHLY || "price_family_monthly",
  family_yearly:
    process.env.STRIPE_PRICE_FAMILY_YEARLY || "price_family_yearly",
};

/**
 * Get Stripe price ID for a plan and billing cycle
 */
export function getStripePriceId(
  planId: string,
  billingCycle: "monthly" | "annual"
): string {
  const cycle = billingCycle === "annual" ? "yearly" : "monthly";
  const key = `${planId}_${cycle}` as keyof typeof STRIPE_PRICE_IDS;
  return STRIPE_PRICE_IDS[key] || "";
}

/**
 * Create Stripe Checkout Session
 */
export async function createCheckoutSession(params: {
  priceId: string;
  planId: string;
  billingCycle: string;
  userId?: string;
  customerEmail?: string;
}): Promise<{ sessionId: string; url: string }> {
  const stripeInstance = getStripeInstance();

  if (!stripeInstance) {
    throw new Error(
      "Stripe is not configured. Please add your API keys to .env.local"
    );
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

    const session = await stripeInstance.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: params.priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/subscription/checkout?session_id={CHECKOUT_SESSION_ID}&plan=${params.planId}`,
      cancel_url: `${baseUrl}/subscription`,
      client_reference_id: params.userId,
      customer_email: params.customerEmail,
      metadata: {
        planId: params.planId,
        billingCycle: params.billingCycle,
        userId: params.userId || "",
      },
      subscription_data: {
        metadata: {
          planId: params.planId,
          billingCycle: params.billingCycle,
        },
      },
      allow_promotion_codes: true,
    });

    return {
      sessionId: session.id,
      url: session.url!,
    };
  } catch (error) {
    console.error("Error creating Stripe checkout session:", error);
    throw error;
  }
}

/**
 * Get Stripe instance for client-side (browser)
 */
let stripePromise: Promise<any> | null = null;

export function getStripe() {
  if (!stripePromise) {
    stripePromise = loadStripe(STRIPE_CONFIG.publishableKey);
  }
  return stripePromise;
}

/**
 * Verify Stripe checkout session
 */
export async function verifyCheckoutSession(sessionId: string): Promise<{
  success: boolean;
  subscription?: Stripe.Subscription;
  customer?: Stripe.Customer;
  error?: string;
}> {
  const stripeInstance = getStripeInstance();

  if (!stripeInstance) {
    return {
      success: false,
      error: "Stripe is not configured",
    };
  }

  try {
    const session = await stripeInstance.checkout.sessions.retrieve(sessionId, {
      expand: ["subscription", "customer"],
    });

    if (session.payment_status === "paid") {
      return {
        success: true,
        subscription: session.subscription as Stripe.Subscription,
        customer: session.customer as Stripe.Customer,
      };
    }

    return {
      success: false,
      error: "Payment not completed",
    };
  } catch (error) {
    console.error("Error verifying checkout session:", error);
    return {
      success: false,
      error: "Failed to verify session",
    };
  }
}
