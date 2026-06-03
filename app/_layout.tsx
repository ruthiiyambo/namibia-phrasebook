import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StripeProvider } from '@/lib/stripe-provider';
import { StatusBar } from 'expo-status-bar';
import { useAuth } from '@/hooks/useAuth';
import { STRIPE_PUBLISHABLE_KEY } from '@/lib/stripe';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  // Skip auth redirect in dev when Supabase isn't configured yet
  const hasSupabase = !!process.env.EXPO_PUBLIC_SUPABASE_URL;

  useEffect(() => {
    if (loading || !hasSupabase) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      router.replace('/(auth)/sign-in');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [session, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  return (
    <StripeProvider publishableKey={STRIPE_PUBLISHABLE_KEY}>
      <AuthGuard>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
      </AuthGuard>
    </StripeProvider>
  );
}
