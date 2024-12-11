
import DataTable from "@/components/database/data-table";
import CustomLayout from "@/layout/CustomLayout";


const DatabasePage = async ({ params }: { params: { id: string } }) => {
  return <CustomLayout>
    <DataTable mapId={params.id} />
  </CustomLayout>;
};

export default DatabasePage;