import { useEffect } from 'react';
import { User } from '@supabase/supabase-js';

export const useExternalScripts = (user: User | null | undefined) => {
  useEffect(() => {
    // Initialize Tawk_API
    const Tawk_API = window.Tawk_API || {};
    window.Tawk_API = Tawk_API;
    window.Tawk_LoadStart = new Date();

    // Function to attempt login
    const attemptLogin = () => {
      if (user && window.Tawk_API && window.Tawk_API.login) {
        // Try non-secure login first
        window.Tawk_API.visitor = {
          name: user.user_metadata?.name || 'Anonymous',
          email: user.email || undefined
        };

        // Then attempt to associate the session with the user ID
        window.Tawk_API.setAttributes({
          id: user.id,
          name: user.user_metadata?.name || 'Anonymous',
          email: user.email || undefined
        }, function(error: any) {
          if (error) {
            console.error('Tawk.to setAttribute failed:', error);
          } else {
            console.log('Attributes set for:', user.user_metadata?.name || 'Anonymous');
          }
        });

        return true;
      }
      return false;
    };

    // Create and append the script
    const s1 = document.createElement("script");
    const s0 = document.getElementsByTagName("script")[0];
    s1.async = true;
    s1.src = 'https://embed.tawk.to/674c23d42480f5b4f5a65b62/1ie0mnucq';
    s1.charset = 'UTF-8';
    s1.setAttribute('crossorigin', '*');
    s0.parentNode?.insertBefore(s1, s0);

    // Set z-index configuration
    window.Tawk_API.customStyle = {
      zIndex: 20 // You can adjust this value as needed
    };

    // Poll until login is successful or timeout is reached
    let attempts = 0;
    const maxAttempts = 10;
    const interval = setInterval(() => {
      if (attemptLogin() || attempts >= maxAttempts) {
        clearInterval(interval);
      }
      attempts++;
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(interval);
    };
  }, [user]);
};

// Add TypeScript interface for window
declare global {
  interface Window {
    Tawk_API: any;
    Tawk_LoadStart: any;
  }
}