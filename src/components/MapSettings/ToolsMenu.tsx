"use client"
import { PiCursorLight, PiHandLight } from "react-icons/pi";
// import { FaRegImage } from "react-icons/fa6";
// import { MdOutlineTextFields } from "react-icons/md";
// import { VscSettings } from "react-icons/vsc";
import { useDispatch, useSelector } from "react-redux";
import { GiSettingsKnobs } from "react-icons/gi";
// import { BiPointer } from "react-icons/bi";
import { setHandTool, setMapSettings } from "../../redux/mapSettingsSlice";
import { CiImageOn } from "react-icons/ci";
import { useRef } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useParams } from "next/navigation";
import { addImage } from "../../hooks/addImage";
import { getImages } from "../../hooks/getImages";
import { setImages } from "../../redux/imagesSlice";

const ToolsMenu = () => {
  const { handTool } = useSelector((state: any) => ({
    handTool: state.handTool.value,
  }));
  const dispatch = useDispatch();

  let { id: mapId } = useParams();
  mapId = String(mapId);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    try {
      const timestamp = Date.now();
      const fileName = `Image-${timestamp}-${file.name}`;

      // Optional: Upload to Supabase storage
      const { error } = await supabase.storage
        .from("map-images")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) throw error;
  
      const {
        data: { publicUrl },
      } = supabase.storage.from("map-images").getPublicUrl(fileName);

      //Store public url to database
      await addImage(mapId!, publicUrl)

      // alert(publicUrl);
      const images = await getImages(mapId!)

      dispatch(setImages(images))
    } catch (error) {
      console.error("Error handling image:", error);
      alert("Failed to upload image");
    }

    // Reset file input
    event.target.value = "";
  };

  // const handleDeleteImage = (imageId: string) => {
  //   setImages((prev) => prev.filter((img) => img.id !== imageId));
  // };

  return (
    <div className="absolute my-auto mt-[15%] ml-2 bg-white z-10 border-2 rounded-md shadow-md px-2 py-3 flex flex-col justify-center items-center gap-3 text-2xl">
      {handTool ? (
        <PiCursorLight
          onClick={() => {
            dispatch(setHandTool(!handTool));
          }}
          className={`cursor-pointer`} //${handTool?"bg-gray-400":""}
        />
      ) : (
        <PiHandLight
          onClick={() => {
            dispatch(setHandTool(!handTool));
          }}
          className={`cursor-pointer text-[30px]`} //${handTool?"bg-gray-400":""}
        />
      )}
      {/* <MdOutlineTextFields className="cursor-pointer"/> */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      <button onClick={() => fileInputRef.current?.click()}>
        <CiImageOn className="cursor-pointer text-3xl" />
      </button>
      <GiSettingsKnobs
        className="cursor-pointer"
        onClick={() => {
          dispatch(setMapSettings("global"));
        }}
      />
    </div>
  );
};

export default ToolsMenu;
