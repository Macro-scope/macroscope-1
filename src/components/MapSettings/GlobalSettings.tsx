"use client";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { setMapSettings } from "../../redux/mapSettingsSlice";
import { setGlobalMapStyle } from "@/hooks/setGlobalMapStyle";
import { getGlobalMapStyles } from "@/hooks/getGlobalMapStyles";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
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
  Square,
  CircleOff,
  Circle,
  X,
  Type,
  PaintBucket,
} from "lucide-react";
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

const GlobalSettings = () => {
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
        <Square className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={value === "7px"}
        onPressedChange={() => onChange("7px")}
        size="sm"
      >
        <CircleOff className="h-4 w-4" />
      </Toggle>
      <Toggle
        pressed={value === "15px"}
        onPressedChange={() => onChange("15px")}
        size="sm"
      >
        <Circle className="h-4 w-4" />
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
    <Card className="w-[360px] border-none shadow-none h-full overflow-y-auto">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Global Settings</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              resetGlobalSetting();
              dispatch(setMapSettings("none"));
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Canvas Background */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <PaintBucket className="h-4 w-4" />
            <h3 className="font-semibold">Canvas Background</h3>
          </div>
          <div className="flex items-center justify-between">
            <Label>Color</Label>
            <ColorPicker
              value={canvasBackground}
              onChange={(color) =>
                dispatch(setCanvasBackground(color.toHexString()))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Group Name Settings */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Type className="h-4 w-4" />
            <h3 className="font-semibold">Group Name</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Font</Label>
              <Select
                value={title.font}
                onValueChange={(v) => dispatch(setTitleFont(v))}
              >
                <SelectTrigger className="w-32">
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
              <Label>Font Size</Label>
              <div className="w-32 flex items-center gap-2">
                <Slider
                  min={12}
                  max={32}
                  step={1}
                  value={[parseInt(title.fontSize?.replace("px", "") || "16")]}
                  onValueChange={(v) => dispatch(setTitleFontSize(`${v[0]}px`))}
                />
                <span className="text-sm text-muted-foreground w-8">
                  {parseInt(title.fontSize?.replace("px", "") || "16")}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Style</Label>
              <div className="flex gap-2">
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
              <Label>Alignment</Label>
              <AlignmentButtons
                value={title.alignment}
                onChange={(v) => dispatch(setTitleAlignment(v))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Border Weight</Label>
              <div className="w-32">
                <Slider
                  min={1}
                  max={8}
                  step={0.5}
                  value={[parseFloat(title.borderWeight)]}
                  onValueChange={(v) =>
                    dispatch(setTitleBorderWeight(`${v[0]}px`))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Corner Style</Label>
              <CornerButtons
                value={title.corner}
                onChange={(v) => dispatch(setTitleCorner(v))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Group Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Group</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Border Weight</Label>
              <div className="w-32">
                <Slider
                  min={1}
                  max={8}
                  step={0.5}
                  value={[parseFloat(group.borderWeight)]}
                  onValueChange={(v) =>
                    dispatch(setGroupBorderWeight(`${v[0]}px`))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Corner Style</Label>
              <CornerButtons
                value={group.corner}
                onChange={(v) => dispatch(setGroupCorner(v))}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Tile Settings */}
        <div className="space-y-4">
          <h3 className="font-semibold">Tile</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Border Weight</Label>
              <div className="w-32">
                <Slider
                  min={1}
                  max={8}
                  step={0.5}
                  value={[parseFloat(tileStyle.borderWeight)]}
                  onValueChange={(v) =>
                    dispatch(setTileBorderWeight(`${v[0]}px`))
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label>Corner Style</Label>
              <CornerButtons
                value={tileStyle.corner}
                onChange={(v) => dispatch(setTileCorner(v))}
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 mt-6">
        <Button className="w-full" onClick={saveSettings}>
          Save Changes
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            resetGlobalSetting();
            dispatch(setMapSettings("none"));
          }}
        >
          Discard
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GlobalSettings;
