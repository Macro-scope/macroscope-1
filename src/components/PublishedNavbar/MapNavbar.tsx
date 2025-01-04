"use client"
import { supabase } from "@/lib/supabaseClient";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
export type NavData={
  title:string | null,
  description:string | null,
  suggestion_form_link:string | null,
  navbar_logo:string | null
}
const MapNavbar = () => {
  const { id: mapId } = useParams();
  const [nav, setNav] = useState<NavData>();
  useEffect(() => {
    const fetchNav = async () => {
      try {
        const { data, error } = await supabase
          .from("publish_settings")
          .select("*")
          .eq("map_id", mapId)
          .single();
        if (error) throw error;
        setNav(data);
      } catch (error) {
        console.error("Error fetching settings:", error);
      }
    };
    fetchNav();
    console.log(nav)
  }, [mapId]);

  return (
    <div className="flex justify-between items-center bg-white px-2 pb-1">
      <a href="https://macroscope.so">
        <img
          src={ nav.navbar_logo ?? "/logosmallblack.png"}
          alt="logo"
          className="h-10 w-10 rounded-full"
        />
      </a>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-xl font-semibold">{nav?.title}</h1>
        <p className="text-sm">{nav?.description}</p>
      </div>
      {nav.suggestion_form_link && <a
        href={`${
          nav?.suggestion_form_link?.startsWith("http")
            ? nav?.suggestion_form_link
            : `https://${nav?.suggestion_form_link}`
        }`}
        target="_blank"
      >
        <p className="text-white text-sm px-3 pb-0.5 h-[35px] w-[80px] flex items-center justify-center bg-black rounded-full">Suggest</p>
      </a>}
    </div>
  );
};

export default MapNavbar;
