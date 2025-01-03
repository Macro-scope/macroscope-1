'use client';
import DataTable from '@/components/database/data-table';
import CustomLayout from '@/layout/CustomLayout';
import { supabase } from '@/lib/supabaseClient';

import { redirect, useRouter } from 'next/navigation';

import { useEffect } from 'react';
const DatabasePage = ({ params }: { params: { id: string } }) => {
  // const supabase = createServerComponentClient({ cookies });

  return (
    <CustomLayout>
      <DataTable mapId={params.id} />
    </CustomLayout>
  );
};

export default DatabasePage;
