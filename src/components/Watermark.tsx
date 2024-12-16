import React from "react";

type Props = {};

const Watermark = (props: Props) => {
  return (
    <div
      className="flex justify-center items-center absolute font-normal px-4 py-2 rounded-full text-5xl left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none pointer-events-none"
      style={{ zIndex: "2000", opacity: 0.3, userSelect: "none" }}
      draggable="false"
    >
      {/* Made with{" "} */}
      <img
        src="/watermark.svg"
        alt="Macroscope"
        className="ml-2 mr-1 h-[20vh] pointer-events-none"
        // SVG is black by default, so no filter needed
        draggable="false"
        onDragStart={(e) => e.preventDefault()}
      />
      {/* <span className="font-semibold">Macroscope</span> */}
    </div>
  );
};

export default Watermark;
