// Web stub — Stripe React Native is native-only.
// On web we render children directly; payments are handled by redirecting to
// a Stripe Checkout URL instead of the native payment sheet.
import React from 'react';

export function StripeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
