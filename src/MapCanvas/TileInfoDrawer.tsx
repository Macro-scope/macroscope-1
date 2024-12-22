"use client";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useEffect, useState } from "react";
import { FiExternalLink } from "react-icons/fi";

type Props = {
  tileId: string;
};

const TileInfoDrawer = (props: Props) => {
  const [tile, setTile] = useState<any>();

  useEffect(() => {
    const getTileInfo = async (tileId: string) => {
      const { data } = await supabase
        .from("tiles")
        .select()
        .eq("tile_id", tileId)
        .single();

      setTile(data);
      getTileTag(data?.tag_id);
      // console.log(data);
    };

    getTileInfo(props.tileId);
  }, [props.tileId]);

  const [tagName, setTagName] = useState<string | null>(null);

  const getTileTag = async (tagId: string) => {
    console.log("Hello server");
    try {
      const { data } = await supabase
        .from("tags")
        .select()
        .eq("tag_id", tagId)
        .single();
      console.log(data);
      setTagName(data?.name);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="" style={{ zIndex: "2000" }}>
      <div className="flex items-center gap-5 h-16">
        <img src={tile?.logo} className="h-full rounded-md" alt="" />
        <div className="">
          <div className="text-4xl font-semibold flex items-center gap-2">{tile?.name} <a href={tile?.url}><FiExternalLink className="text-xl" /></a></div>
          <div className="px-4 bg-blue-500 text-white w-fit rounded-full mt-2">
            {tagName || "Other"}
          </div>
        </div>
      </div>
      <div
        className="tile-description"
        dangerouslySetInnerHTML={{ __html: tile?.description }}
      ></div>
    </div>
  );
};

export default TileInfoDrawer;
