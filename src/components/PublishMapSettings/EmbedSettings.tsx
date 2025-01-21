"use client";

import React, { useState } from "react";

import { Copy, Check, WifiOff, Send } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const EmbedSettings = () => {
  const [publishStatus, setPublishStatus] = useState("published");
  const [isLoading, setIsLoading] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showUnpublishDialog, setShowUnpublishDialog] = useState(false);

  const dummyEmbedCode = `<iframe
  src="https://app.macroscope.so/embed/map"
  width="100%"
  height="600"
  frameborder="0"
></iframe>`;

  const handlePublish = async () => {
    setIsLoading(true);
    setTimeout(() => {
      setPublishStatus("published");
      setIsLoading(false);
    }, 1500);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(dummyEmbedCode);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleUnpublish = () => {
    setPublishStatus("unpublished");
    setShowUnpublishDialog(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-500 text-green-700";
      case "unpublished":
        return "bg-yellow-500 text-yellow-700";
      case "error":
        return "bg-red-500 text-red-700";
      default:
        return "bg-gray-500 text-gray-700";
    }
  };

  const getStatusText = () => {
    switch (publishStatus) {
      case "published":
        return "Published";
      case "unpublished":
        return "Not Published";
      case "error":
        return "Error";
      default:
        return "";
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Status Row */}
      {/* Status Row */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-gray-900">Status</h3>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-sm font-medium text-gray-900">
                Published
              </span>
              <span className="text-sm text-gray-500">4min ago</span>
            </div>
          </div>
          <Button
            variant="default"
            onClick={handlePublish}
            disabled={isLoading || publishStatus === "published"}
            className="bg-black hover:bg-gray-800 text-white gap-2"
          >
            <Send className="h-4 w-4" />
            {isLoading ? "Publishing..." : "Publish"}
          </Button>
        </div>
        <div className="h-px bg-gray-200" />
      </div>

      {/* Embed Code */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700">Embed Code</h3>
        <p className="text-sm text-gray-600 mb-3">
          Copy the code below and paste it in your web page's HTML
        </p>
        <div className="relative bg-gray-50 rounded-lg border overflow-hidden">
          <pre className="text-sm font-mono p-4 pb-14 overflow-x-auto whitespace-pre text-gray-800">
            <code>
              <span className="text-blue-600">&lt;iframe</span>
              {"\n"} <span className="text-purple-600">src</span>=
              <span className="text-green-600">
                "https://app.macroscope.so/embed/map"
              </span>
              {"\n"} <span className="text-purple-600">width</span>=
              <span className="text-green-600">"100%"</span>
              {"\n"} <span className="text-purple-600">height</span>=
              <span className="text-green-600">"600"</span>
              {"\n"} <span className="text-purple-600">frameborder</span>=
              <span className="text-green-600">"0"</span>
              {"\n"}
              <span className="text-blue-600">&gt;&lt;/iframe&gt;</span>
            </code>
          </pre>
          <div className="absolute right-3 bottom-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyCode}
                    className="h-8 w-8 bg-white"
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isCopied ? "Copied!" : "Copy code"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Unpublish */}
      <div className="pt-4 border-t">
        <div className="flex items-center justify-between p-4">
          <span className="text-sm font-medium text-red-500">Danger Zone</span>
          <Button
            variant="ghost"
            onClick={() => setShowUnpublishDialog(true)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <WifiOff className="mr-2 h-4 w-4" />
            Unpublish
          </Button>
        </div>
      </div>

      {/* Unpublish Dialog */}
      <AlertDialog
        open={showUnpublishDialog}
        onOpenChange={setShowUnpublishDialog}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure you want to unpublish?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will make your map inaccessible to others.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Go Back</AlertDialogCancel>
            <AlertDialogAction onClick={handleUnpublish}>
              Unpublish
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EmbedSettings;
