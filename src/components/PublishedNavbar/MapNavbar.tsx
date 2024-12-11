"use client"
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
// import { useSelector } from "react-redux";

const MapNavbar = () => {
  // const { nav } = useSelector((state: any) => ({
  //   nav: state.publishedMapNav,
  // }));

  // const { id: mapId } = useParams();


  //termporay code
  let { id: name } = useParams();
  name = String(name)
  const [mapId, setMapId] = useState<any>();

  useEffect(() => {
    const getMapId = async () => {
      const { data } = await supabase
        .from("maps")
        .select("map_id")
        .eq("name", name?.replace(/-/g, " "))
        .single();

      // console.log(name)
      setMapId(data?.map_id);
    };

    getMapId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  //termporay code

  const [nav, setNav] = useState<any>();
  useEffect(() => {
    const getMapNav = async () => {
      const { data } = await supabase
        .from("maps")
        .select("navbar")
        .eq("map_id", mapId)
        .single();
      setNav(data?.navbar);
    };

    if (mapId) getMapNav();
  }, [mapId]);

  return (
    <div className="flex justify-between items-center bg-white p-2">
      <a href="https://macroscope.so">
        <img
          src="/logosmallblack.png"
          alt="logo"
          className="h-10 w-10 rounded-full"
        />
      </a>
      <div className="flex flex-col justify-center items-center">
        <h1 className="text-xl font-semibold">{nav?.title}</h1>
        <p className="text-sm">{nav?.subtext}</p>
      </div>
      <a
        href={`${
          nav?.suggest?.startsWith("http")
            ? nav?.suggest
            : `https://${nav?.suggest}`
        }`}
        target="_blank"
        className="bg-black text-white font-semibold rounded-full px-4 py-2"
      >
        {/* <button > */}
        +Suggest
        {/* </button> */}
      </a>
    </div>
  );
};

export default MapNavbar;
