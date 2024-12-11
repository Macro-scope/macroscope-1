"use client";
import React from "react";
import Card from "./Card";

const Features = () => {
  const data = [
    {
      image: "",
      title: "Configure Layout",
      description:
        "Organize the groups on the map with easily  drag-and-drop. Resize the group with with auto adjusting items.",
    },
    {
      image: "",
      title: "Customize Style",
      description:
        "Tailor the style, shape and colors both at a group level and a map level to make the map look unique and reflect your style.",
    },
    {
      image: "",
      title: "Manage Data",
      description:
        "Easily add and update data in a familiar, Google Sheets like interface, for a smooth  and streamlined data management.",
    },
    {
      image: "",
      title: "Export as Image",
      description:
        "Export the map as high-quality images for sharing on your social media, newsletter and presentation.",
    },
    {
      image: "",
      title: "Publish as Website",
      description:
        "Publish the map on your domain or embed it inside your web page. The published map is optimized for SEO out of the box.",
    },
    {
      image: "",
      title: "Analyze Traffic",
      description:
        "Get real-time analytics of traffic and events across the map and pages. Analytics Powered by Umami.is",
    },
  ];

  return (
    <section className=" bg-[#F3F2F0] pt-[146px] py-[122px] ">
      <div className="container px-8 mx-auto text-center max-w-7xl">
        <div className="text-sm font-bold tracking-wide border border-customGray w-fit justify-self-center px-6 py-2 rounded-[130px] text-customGray uppercase mb-4">
          Features
        </div>
        <h2 className="justify-self-center text-2xl font-sans mx-4 md:mx-5 xl:mx-24 2xl:mx-48 max-w-5xl sm:text-3xl lg:text-5xl font-medium text-[#464646] mb-[72px]">
          All you need to create interactive market maps, in one place
        </h2>
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 justify-items-center"> */}
        <div className="flex flex-wrap justify-center gap-5">
          {/* Card 1 */}
          {data?.map((item, i) => {
            return <Card item={item} key={i} />;
          })}
        </div>
        <h4 className="justify-self-center font-medium font-sans text-xl mt-[72px] max-w-96 px-4">
          We are constantly adding new features{" "}
          <span className="underline w-fit">Roadmap</span> and{" "}
          <span className="underline w-fit">Changelog</span>
        </h4>
      </div>
    </section>
  );
};

export default Features;
