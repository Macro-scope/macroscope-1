import { LuMoreVertical } from "react-icons/lu";
import { GoLinkExternal } from "react-icons/go";
import { Button, Dropdown, Input, MenuProps, Modal } from "antd";
import { useState } from "react";
import { BsPencil } from "react-icons/bs";
import { deleteMap } from "@/hooks/deleteMap";
import { renameMap } from "@/hooks/renameMap";
import { useRouter } from "next/navigation";
import { duplicateMap } from "@/hooks/duplicateMap";

type Props = {
  map: {
    map_id: string;
    name: string;
    last_updated: string;
    is_published: boolean | null;
  };
  fetchDetails: any;
};

const MapsCard = (props: Props) => {
  const router = useRouter();
  const convertToDate = (timestamp: string) => {
    const date = new Date(timestamp); // Convert timestamp to Date object
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";

    return new Date(timestamp).toLocaleString();
  };

  const openProject = async (wid: string) => {
    router.push(`/editor/${wid}`);
  };

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const [mapName, setMapName] = useState(props.map.name);
  const [map, setMap] = useState<{
    map_id: string;
    name: string;
    last_updated: string;
  }>(props.map);

  const { confirm } = Modal;

  const showDeleteConfirm = () => {
    confirm({
      title: "Do you want to delete this map?",
      // icon: <BsExclamationCircleFill />,
      okText: "Delete",
      okType: "danger",
      onOk() {
        console.log("OK");
        deleteMap(props.map.map_id);
        props.fetchDetails();
      },
      onCancel() {
        console.log("Cancel");
      },
    });
  };

  const showRenameModal = () => {
    setIsRenameModalOpen(true);
  };

  const handleOkRename = async () => {
    const name = await renameMap(props.map.map_id, mapName);
    setMap((prevMap) => ({
      ...prevMap,
      name: name, // Update only the `name` property
    }));
    setIsRenameModalOpen(false);
  };

  const handleCancelRename = () => {
    setIsRenameModalOpen(false);
  };

  const handleDuplicate = async () => {
    await duplicateMap(props.map.map_id);
    props.fetchDetails();
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: <button onClick={showRenameModal}>Rename</button>,
    },
    {
      key: "2",
      label: <button onClick={handleDuplicate}>Duplicate</button>,
    },
    {
      key: "3",
      danger: true,
      label: <button onClick={showDeleteConfirm}>Delete</button>,
    },
  ];

  return (
    <div className="w-64 bg-white shadow-md rounded-lg overflow-hidden h-fit">
      <div className="relative">
        <div className="h-40 bg-gray-200 flex items-center justify-center">
          <img src="/sample_map_placeholder.svg" alt="" />
        </div>
        <div>
        {props.map.is_published === null ? (
            <div className="absolute top-2 left-2 px-2 py-[2px] bg-gray-500/75 text-white text-xs font-semibold rounded-full">
              Free
            </div>
          ) : props.map.is_published ? (
            <div className="absolute top-2 left-2 px-2 py-[2px] bg-green-500/75 text-white text-xs font-semibold rounded-full">
              Pro
            </div>
          ) : (
            <div className="absolute top-2 left-2 px-2 py-[2px] bg-green-500/75 text-white text-xs font-semibold rounded-full">
              Pro +
            </div>
          )}
          
          {props.map.is_published === null ? (
            <div className="absolute top-2 right-2 px-2 py-[2px] bg-gray-500/75 text-white text-xs font-semibold rounded-full">
              Draft
            </div>
          ) : props.map.is_published ? (
            <div className="absolute top-2 right-2 px-2 py-[2px] bg-green-500/75 text-white text-xs font-semibold rounded-full">
              Published
            </div>
          ) : (
            <div className="absolute top-2 right-2 px-2 py-[2px] bg-orange-500/75 text-white text-xs font-semibold rounded-full">
              Unpublished changes
            </div>
          )}
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold mb-1">
          {map.name.length > 30 ? `${map.name.substring(0, 30)}...` : map.name}
        </h3>
        <div className="flex items-center text-xs text-gray-500">
          <div>Last updated: {convertToDate(map.last_updated)}</div>
          {/* <LuExternalLink className="w-3 h-3 ml-1" /> */}
        </div>
      </div>
      <div className="flex justify-between items-center p-4 pt-0">
        <div className="flex gap-2 items-center">
          <button
            onClick={() => openProject(map.map_id)}
            className="px-2 py-1 text-sm text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center"
          >
            <BsPencil className="w-3 h-3 mr-1" />
            Edit
          </button>
          <GoLinkExternal className="w-[18px] h-[18px] text-gray-600" />
        </div>
        <Dropdown
          trigger={["click"]}
          menu={{ items }}
          placement="bottomLeft"
          arrow
        >
          <button className="p-1 text-gray-400 hover:bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50">
            <LuMoreVertical className="w-5 h-5" />
          </button>
        </Dropdown>
      </div>
      <Modal
        title="Rename your map"
        width={400}
        centered
        open={isRenameModalOpen}
        footer={[
          <Button key="cancel" onClick={handleCancelRename}>
            Cancel
          </Button>,
          <Button
            key="ok"
            className="bg-black text-white"
            onClick={handleOkRename}
          >
            Rename
          </Button>,
        ]}
        onCancel={handleCancelRename}
      >
        <Input
          placeholder="Enter map name"
          value={mapName}
          onChange={(e) => setMapName(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default MapsCard;
