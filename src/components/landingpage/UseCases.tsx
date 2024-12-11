"use client";
import React from "react";
import Creator from "../../../public/Creator.png";
import Directorymaker from "../../../public/Directorymaker.png";
import Community from "../../../public/Community.png";
import Image from "next/image";
import Card from "./Card";

const UseCases = () => {
  const data = [
    {
      image: Creator,
      title: "Creators",
      description:
        "Create a market map of your niche that becomes a go-to resource for your audience and drive qualified leads to your courses, newsletter, YouTube channel and more.",
    },
    {
      image: Community,
      title: "Directory Makers",
      description:
        "Turn your directory data into a visually engaging market map that easily captures attention, gets shared on social media, and drives traffic back to your directory site.",
    },
    {
      image: Directorymaker,
      title: "Communities",
      description:
        "Engage your community members with a crowed-sourced map that promotes active participation and discussions, while creating a valuable asset for the community.",
    },
  ];

  return (
    <section className="bg-[#F3F2F0] py-[146px]">
      <div className="container px-8 mx-auto text-center max-w-7xl">
        <div className="text-sm font-bold tracking-wide border border-customGray w-fit justify-self-center px-6 py-2 rounded-[130px] text-customGray uppercase mb-4">
          USE CASES
        </div>
        <h2 className="justify-self-center text-2xl font-sans mx-4 md:mx-5 xl:mx-24 2xl:mx-48 max-w-5xl sm:text-3xl lg:text-5xl font-medium text-[#464646] mb-[72px]">
          Create interactive and insightful market maps that get attention,
          drive traffic, engage audience and boost shares
        </h2>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 justify-items-center"> */}
        <div className="flex justify-center flex-wrap gap-2.5">
          {/* Card 1 */}
          {data?.map((item,i) => {
            return (
              <Card item={item} key={i} />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default UseCases;
