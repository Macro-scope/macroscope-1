import React from "react";

type Props = {};

const Watermark = (props: Props) => {
  return (
    <div
      className="bg-black flex justify-center items-center absolute text-white font-normal px-4 py-2 rounded-full text-5xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none"
      style={{ zIndex: "2000", opacity: 0.05, userSelect: "none" }}
    >
      Made with{" "}
      <img
        src="/logosmallwhite.svg"
        alt="Macroscope"
        className="ml-2 mr-1 h-[20vh]"
      />
      <span className="font-semibold">Macroscope</span>
    </div>
  );
};

export default Watermark;
