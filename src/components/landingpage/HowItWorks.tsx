import React from "react";

const HowItWorks = () => {
  return (
    <section className="py-[160px]">
      <div className="container px-8 mx-auto text-center max-w-7xl">
        <div className="text-sm font-bold tracking-wide border border-customGray w-fit justify-self-center px-6 py-2 rounded-[130px] text-customGray uppercase mb-4">
          How it works
        </div>
        <h2 className="justify-self-center text-2xl font-sans mx-4 md:mx-5 xl:mx-24 2xl:mx-48 max-w-5xl sm:text-3xl lg:text-5xl font-medium text-[#464646] mb-[72px]">
          We’ve made it easy to create and publish maps so you can focus on
          research and curation
        </h2>
        <div className="flex flex-wrap lg:flex-nowrap max-w-[1200px] gap-5 ">
          <div className="my-14">
            <h2 className="text-start font-sans text-lg font-extrabold sm:text-2xl mb-1.5 text-[#464646]">
              Add or import data
            </h2>
            <p className="text-start font-sans text-base font-medium sm:text-base border-b pb-6 text-[#464646]">
              Add the data manually or simply copy paste data form Google Sheet
              or Excel
            </p>
            <h2 className="text-start font-sans text-lg font-extrabold sm:text-2xl mb-1.5 text-[#464646] mt-6">
              Organize the map
            </h2>
            <p className="text-start font-sans text-base font-medium sm:text-base border-b pb-6 text-[#464646]">
              Rearrange and resize groups freely in the map in a way that makes
              most sense
            </p>
            <h2 className="text-start font-sans text-lg font-extrabold sm:text-2xl mb-1.5 text-[#464646] mt-6">
              Customize the map theme
            </h2>
            <p className="text-start font-sans text-base font-medium sm:text-base border-b pb-6 text-[#464646]">
              Customize the map’s look and feel using the suite of styling
              options.
            </p>
            <h2 className="text-start font-sans text-lg font-extrabold sm:text-2xl mb-1.5 text-[#464646] mt-6">
              Publish the Map
            </h2>
            <p className="text-start font-sans text-base font-medium sm:text-base text-[#464646]">
              Export as website, embed inside your website or download a image
            </p>
          </div>
          <div className="w-[751px] h-[570px] rounded-xl bg-[#F3F2F0]"></div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
