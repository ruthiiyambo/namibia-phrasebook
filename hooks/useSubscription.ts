import { useEffect, useState, useCallback } from 'react';
import { supabase, Subscription } from '@/lib/supabase';
import { useAuth } from './useAuth';

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    if (!user) { setSubscription(null); setLoading(false); return; }

    const { data } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .maybeSingle();

    setSubscription(data as Subscription | null);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetch(); }, [fetch]);

  const isActive = (() => {
    if (!subscription) return false;
    if (subscription.plan === 'lifetime') return true;
    if (!subscription.current_period_end) return false;
    return new Date(subscription.current_period_end) > new Date();
  })();

  return { subscription, isActive, loading, refetch: fetch };
}
