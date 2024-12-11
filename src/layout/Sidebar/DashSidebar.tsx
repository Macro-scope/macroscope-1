"use client"
import Image from "next/image";
import { useRouter } from "next/navigation";
import { CiCreditCard1, CiGlobe, CiMail } from "react-icons/ci";
import { IoIosHelpCircleOutline } from "react-icons/io";
import { MdSubscriptions } from "react-icons/md";
import { FaArrowCircleUp } from "react-icons/fa";
import { FaRegCreditCard } from "react-icons/fa6";
import { PiArrowCircleUpLight } from "react-icons/pi";

const DashSidebar = () => {
  const router = useRouter()
  return (
    <div className="text-white h-full w-[300px] bg-black flex flex-col justify-between">
      <div className="p-5 cursor-pointer" onClick={() => router.push("/dashboard")}>
        <img src="/logowhite.svg" alt="logo" className="h-9"/>
      </div>
      <div className="flex flex-col gap-2">
        
        <div onClick={() => router.push("/dashboard/subscriptions")} className="p-2 pl-5 hover:bg-[#121212] flex gap-3 items-center cursor-pointer">
        <PiArrowCircleUpLight className="text-2xl" />
          Upgrade
        </div>
        <div className="p-2 pl-5 hover:bg-[#121212] flex gap-3 items-center cursor-pointer" onClick={() => router.push("/dashboard/portal")}>
        <CiCreditCard1  className="text-2xl" />
          Billing
        </div>
        <div className="p-2 pl-5 hover:bg-[#121212] flex gap-3 items-center">
          <IoIosHelpCircleOutline className="text-2xl" />
          Support
        </div>
        <div className="flex gap-3 justify-start p-2 pb-3 pl-5 items-center">
          <CiGlobe className="text-[28px]" />
          <img src="/twitter.svg" alt="" className="h-[26px] invert" />
          <img src="/linkedin.svg" alt="" className="h-[30px]" />
          <CiMail className="text-[29px]" />
        </div>
      </div>
    </div>
  );
};

export default DashSidebar;
