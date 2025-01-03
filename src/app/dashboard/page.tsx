'use client';
import CustomLayout from '../../layout/CustomLayout';
import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { setUserInDatabase } from '../../hooks/setUserInDatabase';
import { getUserDetails } from '../../hooks/getUserDetails';
import { getUserMaps } from '../../hooks/getUserMaps';
import MapsCard from '@/components/MapsCard';
import { useDispatch } from 'react-redux';
import { setUser } from '@/redux/userSlice';
import { useRouter } from 'next/navigation';

const Dashboard = () => {
  const [maps, setMaps] = useState<any[] | undefined>();
  const [_users, setUsers] = useState<any>();
  const router = useRouter();

  const getUserId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.id;
  };

  const dispatch = useDispatch();

  const fetchDetails = async () => {
    const user_id = (await getUserId()) || '';
    const userData = await getUserDetails(user_id);
    const mapsData = await getUserMaps(user_id);

    setUsers(userData);
    console.log(userData);
    dispatch(setUser(userData));
    setMaps(mapsData);
    console.log(mapsData);
  };

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.push('/login');
        return;
      }

      setUserInDatabase(session.user);
      fetchDetails();
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <CustomLayout>
      <div className="overflow-scroll h-full w-full">
        <div className="flex h-full w-full justify-start gap-8 flex-wrap p-5 overflow-scroll pl-10">
          {maps
            ?.slice() // Create a copy of the array to avoid mutating the original data
            .sort((a, b) => {
              // Convert `created_at` strings to Date objects for comparison
              const dateA = new Date(a.created_at).getTime();
              const dateB = new Date(b.created_at).getTime();
              return dateB - dateA; // Sort in descending order
            })
            .map(
              (map: {
                map_id: string;
                name: string;
                last_updated: string;
                is_published: boolean | null;
              }) => (
                <MapsCard
                  key={map.map_id}
                  map={map}
                  fetchDetails={fetchDetails}
                />
              )
            )}
        </div>
      </div>
    </CustomLayout>
  );
};

export default Dashboard;
