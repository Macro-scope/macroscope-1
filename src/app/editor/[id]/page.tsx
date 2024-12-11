"use client"

import GlobalSettings from "@/components/MapSettings/GlobalSettings";
import LocalSettings from "@/components/MapSettings/LocalSettings";
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

  const router = useRouter()

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (!user) router.push("/login");
  //   if (mapOwner && mapOwner !== user.user_id) router.push("/dashboard");
  //   // console.log(mapOwner, user.id);
  //   // console.log(mapOwner !== user.id);
  // }, [mapOwner, user]);

  const renderSettingsWindow = () => {
    if (mapSettings === "none") return;
    else if (mapSettings === "local")
      return (
        <div className="flex flex-col bg-white p-2 relative">
          <LocalSettings />
        </div>
      );
    else if (mapSettings === "global")
      return (
        <div className="flex flex-col bg-white p-2">
          <GlobalSettings />
        </div>
      );
  };

  
  return (
    <CustomLayout>
      <div className="h-full flex overflow-hidden">
        <PannableCanvas  />
        {renderSettingsWindow()}
        <ToolsMenu />
      </div>
    </CustomLayout>
  );
};

export default EditorMain;
