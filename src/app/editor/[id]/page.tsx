"use client";

import GlobalSettings from "@/components/MapSettings/GlobalSettings";
import LocalSettings from "@/components/MapSettings/LocalSettings";
import ParentCategoryLocalSettings from "@/components/MapSettings/ParentLocalSettings";
import ToolsMenu from "@/components/MapSettings/ToolsMenu";
import CustomLayout from "@/layout/CustomLayout";
import { supabase } from "@/lib/supabaseClient";
import PannableCanvas from "@/MapCanvas/PannableCanvas";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const EditorMain = () => {
  const { mapSettings, user } = useSelector((state: any) => ({
    mapSettings: state.mapSettings.value,
    user: state.user.value,
  }));

  const { id: mapId } = useParams();
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
    // console.log('Current mapSettings:', mapSettings); // Debug log

    if (mapSettings === "none") return null;

    const settingComponents = {
      local: <LocalSettings />,
      global: <GlobalSettings />,
      parentCategoryLocal: <ParentCategoryLocalSettings />
    };

    const SettingComponent = settingComponents[mapSettings];
    
    if (!SettingComponent) return null;

    return (
      <div className="flex flex-col bg-white p-2 relative">
        {SettingComponent}
      </div>
    );
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