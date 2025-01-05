'use client';
import React, { useEffect, useState } from 'react';
import SideNavbar from './Sidebar/Sidebar';
import Navbar from './Navbar/Navbar';
import DashSidebar from './Sidebar/DashSidebar';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { User } from '@supabase/supabase-js';
import { useExternalScripts } from '@/hooks/useExternalScripts';

const CustomLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const currentPath = usePathname();
  const [currUser, setCurrUser] = useState<User | null>();

  useExternalScripts(currUser);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setCurrUser(user);
    };

    getUser();
  }, []);
  const router = useRouter();
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(session, 'SESSION');
      if (!session) {
        router.push('/login');
        return;
      }
    };
    checkAuth();
  }, [router]);
  const openCanny = async () => {
    // If using SSO:
    const response = await fetch('/api/canny', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: currUser?.email,
          name: currUser?.user_metadata.name,
          id: currUser?.id,
        },
      }),
    });
    const { ssoToken } = await response.json();

    window.open(`https://macroscope.canny.io?ssoToken=${ssoToken}`, '_blank');
  };

  return (
    <div className="flex h-screen bg-gray-100 min-h-screen relative">
      {currentPath === '/dashboard' ||
      currentPath === '/dashboard/subscriptions' ? (
        <DashSidebar />
      ) : (<></>
        // <SideNavbar />
      )}
      <div className="flex flex-col w-full">
        <Navbar />
        {children}
      </div>

      <button
        onClick={openCanny}
        className="fixed right-0 rounded-md top-1/2 -translate-y-1/2 bg-black text-white px-2 pt-1 pb-5  transform -rotate-90 translate-x-[30px] hover:translate-x-[28px] transition-transform"
      >
        Feedback
      </button>
    </div>
  );
};

export default CustomLayout;
