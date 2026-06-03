// Stripe publishable key — safe to expose in the client bundle
export const STRIPE_PUBLISHABLE_KEY =
  process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

// Price IDs — create these in your Stripe dashboard and paste here
// These are server-side-only IDs referenced when creating PaymentIntents /
// Checkout Sessions; they are NOT secret, but keep them in env vars for
// easy per-environment swapping.
export const PRICE_IDS = {
  trip_pass: process.env.EXPO_PUBLIC_STRIPE_PRICE_TRIP_PASS ?? '',  // $6.99 one-time
  yearly:    process.env.EXPO_PUBLIC_STRIPE_PRICE_YEARLY   ?? '',   // $29.99/yr
  lifetime:  process.env.EXPO_PUBLIC_STRIPE_PRICE_LIFETIME ?? '',   // $49.99 one-time
} as const;

export type PlanKey = keyof typeof PRICE_IDS;

export const PLAN_LABELS: Record<PlanKey, { title: string; price: string; description: string }> = {
  trip_pass: {
    title: '2-Week Trip Pass',
    price: '$6.99',
    description: 'Full access for your trip. No subscription, no renewals.',
  },
  yearly: {
    title: 'Yearly',
    price: '$29.99 / year',
    description: 'Best for expats, repeat visitors & language learners.',
  },
  lifetime: {
    title: 'Lifetime',
    price: '$49.99',
    description: 'One payment, forever. Everything, always.',
  },
};
