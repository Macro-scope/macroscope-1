
import DataTable from "@/components/database/data-table";
import CustomLayout from "@/layout/CustomLayout";

const DatabasePage = async ({ params }: { params: { id: string } }) => {
  return <DataTable mapId={params.id} />;
};

export default DatabasePage;

