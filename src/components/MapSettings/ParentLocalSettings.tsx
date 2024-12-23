"use client";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { setMapSettings } from "@/redux/mapSettingsSlice";
import { 
  setContainerBorderColor,
  setContainerFillColor,
  setTitleBorderColor,
  setTitleFillColor,
  setParentCategoryLocalSettings
} from "@/redux/localParentCategorySlice";
import { saveParentCategoryStyle } from "@/hooks/saveParentCategoryStyle";
import {
  Card,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Separator } from "@/components/ui/separator";
import { ColorPicker } from "antd";
import { X } from "lucide-react";

const ParentCategoryLocalSettings = () => {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [localSettings, setLocalSettings] = useState(null);

  const { categoryId, settings } = useSelector((state: any) => ({
    categoryId: state.localParentCategoryId?.categoryId,
    settings: state.localParentCategorySettings
  }));

  const dispatch = useDispatch();
  let { id: mapId } = useParams();
  mapId = String(mapId);

  useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleColorChange = (type: string, property: string, color: any) => {
    const hexColor = color.toHexString();
    
    const updatedSettings = {
      ...settings,
      [type]: {
        ...settings[type],
        [property]: hexColor
      }
    };
    
    dispatch(setParentCategoryLocalSettings(updatedSettings));

    switch (type) {
      case 'container':
        if (property === 'borderColor') dispatch(setContainerBorderColor(hexColor));
        if (property === 'fillColor') dispatch(setContainerFillColor(hexColor));
        break;
      case 'title':
        if (property === 'borderColor') dispatch(setTitleBorderColor(hexColor));
        if (property === 'fillColor') dispatch(setTitleFillColor(hexColor));
        break;
    }
  };

  const handleSaveSettings = async () => {
    try {
      if (categoryId && settings) {
        await saveParentCategoryStyle(categoryId, settings);
        dispatch(setMapSettings('none'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleDiscard = () => {
    setShowDiscardDialog(true);
  };

  if (!settings) return null;

  return (
    <>
      <Card className="w-[360px] border-none shadow-none h-full">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-base">Parent Category Settings</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDiscard}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border" />

        <div className="p-4 space-y-6">
          {/* Container Styles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Container Styles</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Border Color</span>
              <ColorPicker
                showText
                value={settings.container.borderColor}
                onChange={(color) => handleColorChange('container', 'borderColor', color)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fill Color</span>
              <ColorPicker
                showText
                value={settings.container.fillColor}
                onChange={(color) => handleColorChange('container', 'fillColor', color)}
              />
            </div>
          </div>

          <Separator className="border-1" />

          {/* Title Styles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Title Styles</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Border Color</span>
              <ColorPicker
                showText
                value={settings.title.borderColor}
                onChange={(color) => handleColorChange('title', 'borderColor', color)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fill Color</span>
              <ColorPicker
                showText
                value={settings.title.fillColor}
                onChange={(color) => handleColorChange('title', 'fillColor', color)}
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 bg-white">
          <Button className="w-full" onClick={handleSaveSettings}>
            Save Changes
          </Button>
          <Button variant="outline" className="w-full" onClick={handleDiscard}>
            Discard
          </Button>
        </div>
      </Card>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="w-96">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              Save Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save the changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                dispatch(setMapSettings('none'));
                setShowDiscardDialog(false);
              }}
            >
              Discard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleSaveSettings();
                setShowDiscardDialog(false);
              }}
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ParentCategoryLocalSettings;