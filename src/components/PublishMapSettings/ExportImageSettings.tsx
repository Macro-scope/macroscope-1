import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCanvasSize } from "@/redux/canvasSizeSlice";
import html2canvas from "html2canvas";
import { Download, Image, Settings2, Check } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ExportImageSettings = () => {
  const [exporting, setExporting] = useState(false);
  const [quality, setQuality] = useState("2");
  const [showSuccess, setShowSuccess] = useState(false);

  const { canvasWidth, canvasHeight, mapCards, images } = useSelector(
    (state: any) => ({
      canvasWidth: state.canvasSize.width,
      canvasHeight: state.canvasSize.height,
      mapCards: state.mapCards,
      images: state.images,
    })
  );

  const dispatch = useDispatch();

  const exportAsImage = async () => {
    if (!mapCards?.data?.length && (!images || !Array.isArray(images))) {
      return;
    }

    setExporting(true);

    try {
      let maxX = 0;
      let maxY = 0;

      mapCards.data.forEach((card: any) => {
        const contentPadding = 20;
        maxX = Math.max(
          maxX,
          Number(card.position[0]) + Number(card.dimension[0]) + contentPadding
        );
        maxY = Math.max(
          maxY,
          Number(card.position[1]) + Number(card.dimension[1]) + contentPadding
        );
      });

      images.forEach((image: any) => {
        maxX = Math.max(
          maxX,
          Number(image.position[0]) + Number(image.dimension[0])
        );
        maxY = Math.max(
          maxY,
          Number(image.position[1]) + Number(image.dimension[1])
        );
      });

      const padding = 100;
      maxX += padding;
      maxY += padding;

      dispatch(setCanvasSize({ width: maxX, height: maxY }));

      const element = document.getElementById("capture");
      if (!element) return;

      element.style.width = `${maxX}px`;
      element.style.height = `${maxY}px`;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: true,
        scale: Number(quality),
        backgroundColor: "#ffffff", // Set white background
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("capture");
          if (clonedElement) {
            clonedElement.style.overflow = "visible";
            clonedElement.style.backgroundColor = "#ffffff"; // Ensure white background in cloned element
            Array.from(clonedElement.getElementsByTagName("*")).forEach(
              (el) => {
                const element = el as HTMLElement;
                element.style.overflow = "visible";
              }
            );
          }
        },
      });

      const dataURL = canvas.toDataURL("image/png", 1.0);

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "mindmap-export.png";
      link.click();

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error capturing the div:", error);
    } finally {
      const newElement = document.getElementById("capture");
      if (newElement) {
        newElement.style.width = "3000px";
        newElement.style.height = "3000px";
      }

      dispatch(setCanvasSize({ width: 3000, height: 3000 }));
      setExporting(false);
    }
  };

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Export Settings
        </CardTitle>
        <CardDescription>
          Configure and download your mind map as an image
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Image Quality
            </label>
            <Select value={quality} onValueChange={setQuality}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Standard (1x)</SelectItem>
                <SelectItem value="2">High (2x)</SelectItem>
                <SelectItem value="3">Ultra (3x)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-500">
              Higher quality will result in a larger file size
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button
              className={`flex items-center px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                exporting
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : showSuccess
                  ? "bg-green-50 text-green-600 border border-green-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
              onClick={exportAsImage}
              disabled={exporting}
            >
              {exporting ? (
                <>
                  <Settings2 className="w-4 h-4 mr-2 animate-spin" />
                  Exporting...
                </>
              ) : showSuccess ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Exported!
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Download PNG
                </>
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ExportImageSettings;
