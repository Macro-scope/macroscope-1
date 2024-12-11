"use client";
import React from "react";
import rightArrow from "../../../public/right_arrow.png";
import Image from "next/image";

const Launcher = () => {
  return (
    <section className="container mx-auto px-4 flex flex-col items-center justify-center text-center pt-[91px] pb-[113px]">
      <h1 className="justify-self-center text-2xl font-sans mx-4 md:mx-5 xl:mx-24 2xl:mx-48 max-w-5xl sm:text-3xl lg:text-5xl font-medium text-[#464646] mb-4">
        Be the first to launch a map in your niche.
      </h1>
      <p className="mb-4 font-sans text-base font-medium text-[#464646] sm:text-base">
        Start for free. Try premium features with a 15 day free trial.
      </p>
      <button className="flex items-center px-6 py-2 space-x-2 text-lg font-medium text-white bg-black rounded-full xl:px-8 xl:py-4 xl:text-2xl hover:bg-gray-800">
        <span>Create A Map For Free</span>
        <Image
          src={rightArrow}
          alt="rightArrow image"
          className="h-[22px] w-[22px] self-center"
        />
      </button>
    </section>
  );
};

export default Launcher;
