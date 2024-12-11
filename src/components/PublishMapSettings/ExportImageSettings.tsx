import { setCanvasSize } from "@/redux/canvasSizeSlice";
import html2canvas from "html2canvas";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

type Props = {};

const ExportImageSettings = (props: Props) => {
  const [isToggled, setIsToggled] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const { canvasWidth, canvasHeight, mapCards,images } = useSelector((state: any) => ({
    canvasWidth: state.canvasSize.width,
    canvasHeight: state.canvasSize.height,
    mapCards: state.mapCards,
    images: state.images,
  }));

  const dispatch = useDispatch();

  const exportAsImage = async () => {
    if (!mapCards?.data?.length && (!images || !Array.isArray(images))) return;
  
    // Calculate the bounding box of all cards and images
    let maxX = 0;
    let maxY = 0;
  
    // Update maxX and maxY based on card dimensions and positions
    mapCards.data.forEach((card: any) => {
      maxX = Math.max(maxX, Number(card.position[0]) + Number(card.dimension[0]));
      maxY = Math.max(maxY, Number(card.position[1]) + Number(card.dimension[1]));
    });
  
    // Update maxX and maxY based on image dimensions and positions
    images.forEach((image: any) => {
      maxX = Math.max(maxX, Number(image.position[0]) + Number(image.dimension[0]));
      maxY = Math.max(maxY, Number(image.position[1]) + Number(image.dimension[1]));
    });
  
    // Add padding
    const padding = 50;
    maxX += padding;
    maxY += padding;
  
    // Update the Redux store with the new canvas size
    dispatch(setCanvasSize({ width: maxX, height: maxY }));

    // //update the watermark position
    // const watermark = document.getElementById("watermark");
    // if (watermark) {
    //   watermark.style.left = `${maxX - 150}px`;
    //   watermark.style.top = `${maxY - 150}px`;
    // }
  
    // Get the element to capture (with updated size)
    const element = document.getElementById("capture"); // Select the div
    if (!element) return;
  
    // Set the element's size to the calculated dimensions
    element.style.width = `${maxX}px`;
    element.style.height = `${maxY}px`;
  
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging for debugging
      }); // Capture the div as a canvas
      const dataURL = canvas.toDataURL("image/png"); // Convert canvas to Data URL
  
      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "div-image.png"; // File name for the downloaded image
      link.click();
    } catch (error) {
      console.error("Error capturing the div:", error);
    }
  
    // After exporting, set the canvas size to 3000x3000
    const newElement = document.getElementById("capture");
    if (newElement) {
      newElement.style.width = "3000px";
      newElement.style.height = "3000px";
    }
  
    // Optionally, update the Redux store to reflect the new canvas size
    dispatch(setCanvasSize({ width: 3000, height: 3000 }));
  };
  
  const handleToggleClick = () => {
    // setIsToggled(!isToggled);
    setShowPopup(true);
    // Hide popup after 3 seconds
    setTimeout(() => setShowPopup(false), 3000);
  };

  return (
    <div>
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-gray-800">Download full map as an image</h2>
        <button
          className="flex items-center px-2 py-2 w-40 bg-black text-white text-sm rounded-2xl shadow hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
          onClick={exportAsImage}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16v-8m0 8l4-4m-4 4l-4-4M4 20h16"
            />
          </svg>
          Download PNG
        </button>
      </div>
      <div className="flex justify-start gap-12 mt-10 relative">
        <h1 className="font-medium text-sm">
          Macroscope branding{" "}
          <span className="py-1 px-2 bg-green-300">Pro</span>
        </h1>
        <label className="flex items-center cursor-pointer">
          <div
            className={`relative w-12 h-6 ${
              isToggled ? "bg-black" : "bg-gray-300"
            } rounded-full transition-colors duration-300`}
            onClick={handleToggleClick}
          >
            <div
              className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 transform ${
                isToggled ? "translate-x-6" : "translate-x-1"
              }`}
            ></div>
          </div>
        </label>

        {showPopup && (
          <div className="absolute right-0 top-8 bg-gray-800 text-white px-4 py-2 rounded-md shadow-lg">
            This feature is under construction
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportImageSettings;
