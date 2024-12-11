import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

interface Subscription {
  id: string;
  status: string;
  product_name: string;
  trial_ends_at: string | null;
  renews_at: string | null;
  current_period_end: string | null;
  is_active: boolean;
}

interface UseMapSubscriptionReturn {
  subscription: Subscription | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export const useMapSubscription = (mapId: string): UseMapSubscriptionReturn => {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSubscription = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('map_id', mapId)
        .not('status', 'in', '(cancelled,expired,inactive)')
        .maybeSingle();

      if (subError) throw subError;
      setSubscription(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch subscription'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (mapId) {
      fetchSubscription();
    }
  }, [mapId]);

  return {
    subscription,
    isLoading,
    error,
    refetch: fetchSubscription
  };
};