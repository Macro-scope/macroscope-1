import { setCanvasSize } from "@/redux/canvasSizeSlice";
import html2canvas from "html2canvas";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

type Props = {};

const ExportImageSettings = (props: Props) => {
  const { canvasWidth, canvasHeight, mapCards, images } = useSelector((state: any) => ({
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
  
    // Get the element to capture (with updated size)
    const element = document.getElementById("capture");
    if (!element) return;
  
    // Set the element's size to the calculated dimensions
    element.style.width = `${maxX}px`;
    element.style.height = `${maxY}px`;
  
    try {
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: true, // Enable logging for debugging
      });
      const dataURL = canvas.toDataURL("image/png");
  
      // Create a link element to trigger the download
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "div-image.png";
      link.click();
    } catch (error) {
      console.error("Error capturing the div:", error);
    }
  
    // After exporting, reset canvas size to 3000x3000
    const newElement = document.getElementById("capture");
    if (newElement) {
      newElement.style.width = "3000px";
      newElement.style.height = "3000px";
    }
  
    // Update the Redux store to reflect the new canvas size
    dispatch(setCanvasSize({ width: 3000, height: 3000 }));
  };

  return (
    <div className="p-6">
      <div className="flex flex-col gap-3">
        <h2 className="font-medium text-sm text-gray-800">Download full map as an image</h2>
        <button
          className="flex items-center px-4 py-2 w-40 bg-black text-white text-sm rounded hover:bg-gray-800 focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
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
    </div>
  );
};

export default ExportImageSettings;