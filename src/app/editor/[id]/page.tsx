"use client";

import AddTile from "@/components/MapSettings/AddTile";
import GlobalSettings from "@/components/MapSettings/GlobalSettings";
import LocalSettings from "@/components/MapSettings/LocalSettings";
import ParentCategoryLocalSettings from "@/components/MapSettings/ParentLocalSettings";
import Reordering from "@/components/MapSettings/Reordering";
import TileSettings from "@/components/MapSettings/TileSettings";
import ToolsMenu from "@/components/MapSettings/ToolsMenu";
import CustomLayout from "@/layout/CustomLayout";
import { supabase } from "@/lib/supabaseClient";
import PannableCanvas from "@/MapCanvas/PannableCanvas";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AddForm from "./_component/add-form";

const EditorMain = () => {
  const { mapSettings, tileData } = useSelector((state: any) => ({
    mapSettings: state.mapSettings.value,
    tileData: state.tileSettings?.data, // Add this to your Redux state
  }));

  const { id } = useParams();
  const mapId = Array.isArray(id) ? id[0] : id;
  const [mapOwner, setMapOwner] = useState();

  const router = useRouter();

  useEffect(() => {
    const getmapOwner = async () => {
      const { data } = await supabase
        .from("maps")
        .select()
        .eq("map_id", mapId)
        .single();

      setMapOwner(data.user_id);
    };
    getmapOwner();
  }, [mapId]);

  const renderSettingsWindow = () => {
    if (mapSettings === "none") return null;

    const settingComponents = {
      local: <LocalSettings />,
      global: <GlobalSettings />,
      parentCategoryLocal: <ParentCategoryLocalSettings />,
      tile: <TileSettings mapId={mapId} tileData={tileData} />,
      reorder: <Reordering mapId={mapId} />,
      addTile: <AddForm open={mapSettings === "addTile"} mapId={mapId} />,
    };

    const SettingComponent = settingComponents[mapSettings];

    if (!SettingComponent) return null;

    return SettingComponent;
  };

  return (
    <CustomLayout>
      <div className="h-full flex overflow-hidden">
        <PannableCanvas />
        {renderSettingsWindow()}
        <ToolsMenu />
      </div>
    </CustomLayout>
  );
};

export default EditorMain;
