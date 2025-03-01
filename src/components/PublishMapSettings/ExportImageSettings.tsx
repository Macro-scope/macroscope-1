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

      // Pre-load all images before capturing
      const preloadImages = async () => {
        const imgElements = element.querySelectorAll("img");
        const loadPromises = Array.from(imgElements).map((img) => {
          return new Promise((resolve) => {
            const imgEl = img as HTMLImageElement;

            // If image is already loaded or has no src, resolve immediately
            if (imgEl.complete || !imgEl.src) {
              resolve(null);
              return;
            }
            // Create a new image to preload
            const newImg = document.createElement("img");
            newImg.crossOrigin = "anonymous"; // Try with CORS

            // Set up event handlers
            newImg.onload = () => resolve(null);
            newImg.onerror = () => {
              console.warn(`Failed to load image: ${imgEl.src}`);
              resolve(null);
            };

            // Start loading
            newImg.src = imgEl.src;

            // Set a timeout to avoid hanging
            setTimeout(resolve, 3000);
          });
        });

        return Promise.all(loadPromises);
      };

      // Wait for images to preload
      await preloadImages();

      // Additional delay to ensure rendering
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        logging: true,
        scale: Number(quality),
        backgroundColor: "#ffffff",
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.getElementById("capture");
          if (clonedElement) {
            clonedElement.style.overflow = "visible";
            clonedElement.style.backgroundColor = "#ffffff";

            // Hide UI elements that shouldn't be in the export
            const uiElements = clonedElement.querySelectorAll(
              ".card-actions, .card-toolbar"
            );
            uiElements.forEach((el) => {
              (el as HTMLElement).style.display = "none";
            });

            // Fix broken images by replacing them with a colored div if needed
            const imgElements = clonedElement.querySelectorAll("img");
            imgElements.forEach((img) => {
              const imgEl = img as HTMLImageElement;
              if (!imgEl.complete || imgEl.naturalWidth === 0) {
                // Create a replacement colored div for the broken image
                const replacementDiv = document.createElement("div");
                replacementDiv.style.width = "24px";
                replacementDiv.style.height = "24px";
                replacementDiv.style.backgroundColor = "#888";
                replacementDiv.style.display = "inline-block";
                replacementDiv.style.borderRadius = "4px";

                // Replace the broken image with our div
                imgEl.parentNode?.replaceChild(replacementDiv, imgEl);
              }
            });

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
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Image className="w-5 h-5" />
          Export Settings
        </div>
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
