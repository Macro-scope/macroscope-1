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

  const { id: mapId } = useParams();


  // //termporay code
  // let { id: name } = useParams();
  // name = String(name)
  // const [mapId, setMapId] = useState<any>();

  // useEffect(() => {
  //   const getMapId = async () => {
  //     const { data } = await supabase
  //       .from("maps")
  //       .select("map_id")
  //       .eq("name", name?.replace(/-/g, " "))
  //       .single();

  //     // console.log(name)
  //     setMapId(data?.map_id);
  //   };

  //   getMapId();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  // //termporay code

  const [nav, setNav] = useState<any>();
  useEffect(() => {
    const getMapNav = async () => {
      const { data } = await supabase
        .from("maps")
        .select("navbar")
        .eq("map_id", mapId)
        .single();
      console.log(data?.navbar)
      setNav(data?.navbar);
    };

    if (mapId) getMapNav();
  }, [mapId]);

  return (
    <div className="flex justify-between items-center bg-white px-2 pb-1">
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
      >
        <p className="text-white text-sm px-3 pb-0.5 h-[35px] w-[80px] flex items-center justify-center bg-black rounded-full">Suggest</p>
      </a>
    </div>
  );
};

export default MapNavbar;
