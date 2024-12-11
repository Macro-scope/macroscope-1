"use client"
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import CustomLayout from '@/layout/CustomLayout';

export default function CustomerPortalPage() {
  const [portalUrl, setPortalUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPortalUrl();
  }, []);

  const fetchPortalUrl = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get the most recent subscription to get the portal URL
      const { data, error } = await supabase
        .from('subscriptions')
        .select('customer_portal_url')
        .eq('user_id', user.id)
        .not('status', 'in', '(cancelled,expired,inactive)')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setPortalUrl(data?.customer_portal_url || null);
    } catch (error) {
      console.error('Error fetching portal URL:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Automatically redirect to Lemon Squeezy portal if URL is available
    if (portalUrl) {
      window.open(portalUrl, '_blank');
    }
  }, [portalUrl]);

  return (
    <CustomLayout>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Subscription Management</h1>
        
        {isLoading ? (
          <div className="text-center py-8">
            Redirecting to customer portal...
          </div>
        ) : !portalUrl ? (
          <div className="text-center py-8 text-gray-500">
            No active subscriptions found
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="mb-4">If you are not automatically redirected, click the button below:</p>
            <a
              href={portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
            >
              Go to Customer Portal
            </a>
          </div>
        )}
      </div>
    </CustomLayout>
  );
}