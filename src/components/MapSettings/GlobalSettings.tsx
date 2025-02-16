"use client";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { setMapSettings } from "../../redux/mapSettingsSlice";
import { setGlobalMapStyle } from "@/hooks/setGlobalMapStyle";
import { getGlobalMapStyles } from "@/hooks/getGlobalMapStyles";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

import {
  TbBorderCornerPill,
  TbBorderCornerRounded,
  TbBorderCornerSquare,
} from "react-icons/tb";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Toggle } from "@/components/ui/toggle";
import { ColorPicker } from "antd";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Underline,
  X,
} from "lucide-react";
import {
  setGlobalSettings,
  setGroupBorderWeight,
  setGroupCorner,
  setTileBorderWeight,
  setTileCorner,
  setTitleAlignment,
  setTitleBorder,
  setTitleCorner,
  setTitleFontColor,
  setTitleFont,
  setTitleBold,
  setTitleItalic,
  setTitleUnderline,
  setTitleFontSize,
  setCanvasBackground,
  setTitleBorderWeight,
} from "../../redux/globalSettingsSlice";
import { useState } from "react";
import { RootState } from "@/redux/store";

const GlobalSettings = () => {
  const mapSettings = useSelector(
    (state: RootState) => state.mapSettings.value
  );
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const { mapStyle, title, group, tileStyle, canvasBackground } = useSelector(
    (state: any) => ({
      mapStyle: state.globalSettings,
      title: state.globalSettings.title,
      group: state.globalSettings.group,
      tileStyle: state.globalSettings.tile,
      canvasBackground: state.globalSettings.canvasBackground,
    })
  );

  const dispatch = useDispatch();
  const { id: mapId } = useParams();

  const resetGlobalSetting = async () => {
    const globalStyles = await getGlobalMapStyles(String(mapId));
    if (Array.isArray(globalStyles)) {
      console.error("Unexpected array response from getGlobalMapStyles");
      return;
    }
    if (globalStyles?.settings) {
      dispatch(setGlobalSettings(globalStyles.settings));
    }
  };

  const saveSettings = () => {
    setGlobalMapStyle(String(mapId), mapStyle);
    dispatch(setMapSettings("none"));
  };

  const handleDiscard = () => {
    setShowDiscardDialog(true);
  };

  const fonts = [
    "Inter",
    "Arial",
    "Helvetica",
    "Times New Roman",
    "Roboto",
    "Open Sans",
    "Montserrat",
    "Poppins",
  ];

  const CornerButtons = ({ value, onChange }) => (
    <div className="flex gap-2">
      <Toggle
        pressed={value === "2px"}
        onPressedChange={() => onChange("2px")}
        size="sm"
      >
        <TbBorderCornerSquare className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={value === "7px"}
        onPressedChange={() => onChange("7px")}
        size="sm"
      >
        <TbBorderCornerRounded className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={value === "15px"}
        onPressedChange={() => onChange("15px")}
        size="sm"
      >
        <TbBorderCornerPill className="h-4 w-4" />
      </Toggle>
    </div>
  );

  const AlignmentButtons = ({ value, onChange }) => (
    <div className="flex gap-2">
      <Toggle
        pressed={value === "left"}
        onPressedChange={() => onChange("left")}
        size="sm"
      >
        <AlignLeft className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={value === "center"}
        onPressedChange={() => onChange("center")}
        size="sm"
      >
        <AlignCenter className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={value === "right"}
        onPressedChange={() => onChange("right")}
        size="sm"
      >
        <AlignRight className="h-4 w-4" />
      </Toggle>
    </div>
  );

  return (
    <>
      <Sheet
        open={mapSettings === "global"}
        onOpenChange={() => dispatch(setMapSettings("none"))}
      >
        <SheetContent
          className="w-[360px] p-0 shadow-none h-[calc(100vh-60px)] mt-12 pt-0"
          side="right"
        >
          <div className="px-4 flex justify-between items-center pb-2 border-b-[1.2px] border-gray-200">
            <div className="text-lg font-medium">Global Settings</div>
            <Button variant="ghost" size="icon" onClick={handleDiscard}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
            {/* Canvas Background */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">Canvas Background</h3>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Color</span>
                <ColorPicker
                  value={canvasBackground}
                  onChange={(color) =>
                    dispatch(setCanvasBackground(color.toHexString()))
                  }
                />
              </div>
            </div>

            <Separator className="border-1" />

            {/* Group Name Settings */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm">Group Name</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Font</span>
                  <Select
                    value={title.font}
                    onValueChange={(v) => dispatch(setTitleFont(v))}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fonts.map((font) => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Border Style
                  </span>
                  <Select
                    value={title.border}
                    onValueChange={(v) => dispatch(setTitleBorder(v))}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fill">Fill</SelectItem>
                      <SelectItem value="no_fill">No Fill</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Text Color
                  </span>
                  <Select
                    value={title.fontColor}
                    onValueChange={(v) => dispatch(setTitleFontColor(v))}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="#000000">Black</SelectItem>
                      <SelectItem value="#ffffff">White</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Font Size
                  </span>
                  <div className="w-32 flex items-center gap-2">
                    <Slider
                      min={12}
                      max={32}
                      step={1}
                      value={[
                        parseInt(title.fontSize?.replace("px", "") || "16"),
                      ]}
                      onValueChange={(v) =>
                        dispatch(setTitleFontSize(`${v[0]}px`))
                      }
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {parseInt(title.fontSize?.replace("px", "") || "16")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Style</span>
                  <div className="flex gap-1">
                    <Toggle
                      pressed={title.bold}
                      onPressedChange={(v) => dispatch(setTitleBold(v))}
                      size="sm"
                    >
                      <Bold className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                      pressed={title.italic}
                      onPressedChange={(v) => dispatch(setTitleItalic(v))}
                      size="sm"
                    >
                      <Italic className="h-4 w-4" />
                    </Toggle>
                    <Toggle
                      pressed={title.underline}
                      onPressedChange={(v) => dispatch(setTitleUnderline(v))}
                      size="sm"
                    >
                      <Underline className="h-4 w-4" />
                    </Toggle>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Alignment
                  </span>
                  <AlignmentButtons
                    value={title.alignment}
                    onChange={(v) => dispatch(setTitleAlignment(v))}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Border Weight
                  </span>
                  <div className="w-32 flex items-center gap-2">
                    <Slider
                      min={0}
                      max={8}
                      step={0.5}
                      value={[parseFloat(title.borderWeight)]}
                      onValueChange={(v) =>
                        dispatch(setTitleBorderWeight(`${v[0]}px`))
                      }
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {parseFloat(title.borderWeight)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Corner Style
                  </span>
                  <CornerButtons
                    value={title.corner}
                    onChange={(v) => dispatch(setTitleCorner(v))}
                  />
                </div>
              </div>
            </div>

            <Separator className="border-1" />

            {/* Group Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Group</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Border Weight
                  </span>
                  <div className="w-32 flex items-center gap-2">
                    <Slider
                      min={0}
                      max={8}
                      step={0.5}
                      value={[parseFloat(group.borderWeight)]}
                      onValueChange={(v) =>
                        dispatch(setGroupBorderWeight(`${v[0]}px`))
                      }
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {parseFloat(group.borderWeight)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Corner Style
                  </span>
                  <CornerButtons
                    value={group.corner}
                    onChange={(v) => dispatch(setGroupCorner(v))}
                  />
                </div>
              </div>
            </div>

            <Separator className="border-1" />

            {/* Tile Settings */}
            <div className="space-y-4">
              <h3 className="font-medium text-sm">Tile</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Border Weight
                  </span>
                  <div className="w-32 flex items-center gap-2">
                    <Slider
                      min={0}
                      max={8}
                      step={0.5}
                      value={[parseFloat(tileStyle.borderWeight)]}
                      onValueChange={(v) =>
                        dispatch(setTileBorderWeight(`${v[0]}px`))
                      }
                    />
                    <span className="text-sm text-muted-foreground w-8">
                      {parseFloat(tileStyle.borderWeight)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Corner Style
                  </span>
                  <CornerButtons
                    value={tileStyle.corner}
                    onChange={(v) => dispatch(setTileCorner(v))}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
            <Button className="w-full" onClick={saveSettings}>
              Save Changes
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => dispatch(setMapSettings("none"))}
            >
              Discard
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="w-96">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                resetGlobalSetting();
                dispatch(setMapSettings("none"));
                setShowDiscardDialog(false);
              }}
            >
              Discard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                saveSettings();
                setShowDiscardDialog(false);
              }}
            >
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default GlobalSettings;
