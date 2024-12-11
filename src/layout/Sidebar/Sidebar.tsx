"use client"
import { ConfigProvider, Segmented } from "antd";
import { SegmentedValue } from "antd/es/segmented";
import { useState } from "react";
import { CiMap, CiViewTable } from "react-icons/ci";
// import { FaRegNoteSticky } from "react-icons/fa6";
// import { GoDatabase } from "react-icons/go";
// import { IoIosLink, IoIosSettings, IoLogoApple } from "react-icons/io";
// import { LuMonitor } from "react-icons/lu";
// import { PiNotepadBold } from "react-icons/pi";
// import { RiBarChart2Fill, RiMoneyDollarCircleLine } from "react-icons/ri";
import { useParams } from "next/navigation";
// import { BsDatabase } from "react-icons/bs";
import { IoSettingsOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import Image from "next/image";

const sidebarOptions = [
  {
    value: "dashboard",
    label: (
      <div className=" bg-transparent border-none p-1 flex flex-col items-center justify-center gap-0 my-2">
        {/* <IoLogoApple className="text-3xl"/> */}
        <img src="/logosmallwhite.svg" alt="logo" className="h-7" />
        {/* <span className="text-xs font-thin">Map</span> */}
      </div>
    ),
  },
  {
    value: "editor",
    label: (
      <div className=" bg-transparent border-none  flex flex-col items-center justify-center gap-0 my-2">
        <CiMap className="text-3xl" />
        <span className="text-xs font-thin">Map</span>
      </div>
    ),
  },
  {
    value: "database",
    label: (
      <div className=" bg-transparent border-none text-2xl flex flex-col items-center justify-center gap-0 my-2">
        <CiViewTable className="text-3xl" />
        <span className="text-xs font-thin">Database</span>
      </div>
    ),
  },

  // {
  //   value: "form",
  //   label: (
  //     <div className=" bg-transparent border-none text-2xl flex flex-col items-center justify-center gap-2 my-2">
  //       <PiNotepadBold className="text-3xl" />
  //       <span className="text-xs font-thin">Form</span>
  //     </div>
  //   ),
  // },

  // {
  //   value: "blog",
  //   label: (
  //     <div className="bg-transparent border-none text-2xl flex flex-col items-center justify-center gap-2 my-2">
  //       <FaRegNoteSticky />
  //       <span className="text-xs">Blog</span>
  //     </div>
  //   ),
  // },
  // {
  //   value: "monetize",
  //   label: (
  //     <div className=" bg-transparent border-none text-2xl flex flex-col items-center justify-center gap-2 my-2">
  //       <RiMoneyDollarCircleLine />
  //       <span className="text-xs">Monetize</span>
  //     </div>
  //   ),
  // },
  // {
  //   value: "analytics",
  //   label: (
  //     <div className=" bg-transparent border-none text-2xl flex flex-col items-center justify-center gap-2 my-2">
  //       <RiBarChart2Fill />
  //       <span className="text-xs">Analytics</span>
  //     </div>
  //   ),
  // },
  // {
  //   value: "domain",
  //   label: (
  //     <div className=" bg-transparent border-none text-2xl flex flex-col items-center justify-center gap-2 my-2">
  //       <IoIosLink />
  //       <span className="text-xs">Domain</span>
  //     </div>
  //   ),
  // },
  // {
  //   value: "settings",
  //   label: (
  //     <div className=" bg-transparent border-none text-2xl flex flex-col items-center justify-center gap-0 my-2">
  //       <IoSettingsOutline className="text-2xl" />
  //       <span className="text-xs font-thin">Settings</span>
  //     </div>
  //   ),
  // },
];

const SideNavbar = () => {
  const router = useRouter()
  const [option, setOption] = useState<SegmentedValue>("");

  let { id: map_id } = useParams();
  map_id = String(map_id)

  const loadWindow = (value: SegmentedValue) => {
    console.log(value)
    setOption(value);
    if (value === "dashboard") router.push(`/dashboard`);
    else router.push(`/${value}/${map_id}`);
  };

  return (
    <ConfigProvider
      theme={{
        components: {
          Segmented: {
            /* here is your component tokens */
            itemSelectedBg: "#000",
            itemSelectedColor: "#fff",
            itemColor: "#fff",
            itemHoverColor: "#fff",
          },
        },
      }}
    >
      <Segmented
        vertical
        defaultValue={"none"}
        className="bg-black  rounded-none"
        options={sidebarOptions}
        value={option}
        onChange={loadWindow}
      />
    </ConfigProvider>
  );
};

export default SideNavbar;
