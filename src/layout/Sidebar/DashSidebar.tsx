"use client"

import { useRouter } from "next/navigation";


import {ArrowUpCircle,HelpCircle,CreditCard,Globe,Globe2, Mail} from "lucide-react"

const DashSidebar = () => {
  const router = useRouter()
  return (
    <div className="text-white h-full w-[300px] bg-black flex flex-col justify-between">
      <div className="p-5 cursor-pointer" onClick={() => router.push("/dashboard")}>
        <img src="/logowhite.svg" alt="logo" className="h-9"/>
      </div>
      <div className="flex flex-col gap-2">
        
        <div onClick={() => router.push("/dashboard/subscriptions")} className="p-2 pl-5 hover:bg-[#121212] flex gap-3 items-center cursor-pointer">
        <ArrowUpCircle className="text-2xl" />
          Upgrade
        </div>
        <div className="p-2 pl-5 hover:bg-[#121212] flex gap-3 items-center cursor-pointer" onClick={() => router.push("/dashboard/portal")}>
        <CreditCard  className="text-2xl" />
          Billing
        </div>
        <div className="p-2 pl-5 hover:bg-[#121212] flex gap-3 items-center">
          <HelpCircle className="text-2xl" />
          Support
        </div>
        <div className="flex gap-3 justify-start p-2 pb-3 pl-5 items-center">
          <Globe2 className="text-[28px]" />
          <img src="/twitter.svg" alt="" className="h-[26px] invert" />
          <img src="/linkedin.svg" alt="" className="h-[30px]" />
          <Mail className="text-[29px]" />
        </div>
      </div>
    </div>
  );
};

export default DashSidebar;
