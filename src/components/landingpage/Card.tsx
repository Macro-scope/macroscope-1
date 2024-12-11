import Image from "next/image";
import React from "react";

const Card = ({ item }:any) => {
  return (
    <div className="px-3 pt-3 bg-white rounded-lg shadow-md pb-7 text-start w-96">
      <div className="bg-[#F3F2F0] h-[313px] rounded-2xl mb-6 content-center">
        {item?.image && <Image src={item?.image} alt="Image" />}
      </div>
      <div className="px-3">
        <h3 className="mb-2 font-sans text-lg font-extrabold text-[#464646] sm:text-2xl">
          {item?.title}
        </h3>
        <p className="font-sans text-base font-medium text-[#464646] sm:text-base">
          {item?.description}
        </p>
      </div>
    </div>
  );
};

export default Card;
