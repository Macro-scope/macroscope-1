"use client";
import Faq from "@/components/landingpage/Faq";
import Features from "@/components/landingpage/Features";
import Hero from "@/components/landingpage/Hero";
import HowItWorks from "@/components/landingpage/HowItWorks";
import Launcher from "@/components/landingpage/Launcher";
import Pricing from "@/components/landingpage/Pricing";
import UseCases from "@/components/landingpage/UseCases";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  // const [domain, setDomain] = useState<string>();
  // useEffect(() => {
  //   setDomain(window.location.origin);
  // }, []);

  // const serverDomain = async() =>{
  //   await fetch('/api/resolve-domain/:path*')
  // }

  // if (domain === "https://app.macroscope.so/") {
  //   window.location.href = "https://macroscope.so";
  //   console.log("Navigate to https://macroscope.so");
  // } else{
  //   //Fetch domain from DB and serve the map
  //   serverDomain();
  // }
  return (
    // <div className="flex min-h-screen justify-center items-center">
    //   <embed className="border-2 shadow-md" src="https://app.macroscope.so/map/Directory-Stack-Market-Map" height={500} width={1000} />
    //   <Link
    //     href={"/dashboard"}
    //     className="bg-black text-white font-semibold px-3 py-2 rounded-full"
    //   >
    //     Dashboard
    //   </Link>
    // </div>
    <>
      <Hero />
      <UseCases />
      <HowItWorks />
      <Features />
      <Pricing />
      <Faq />
      <Launcher />
    </>
  );
}
