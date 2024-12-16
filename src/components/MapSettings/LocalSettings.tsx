"use client"

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { 
  setGroupBorderColor, 
  setGroupFillColor,
  setTileBorderColor,
  setTileFillColor 
} from "../../redux/localSettingsSlice";
import { saveLocalCardStyle } from "../../hooks/saveLocalCardStyle";
import { setMapSettings } from "../../redux/mapSettingsSlice";
import { getMapData } from "../../hooks/getMapData";
import { setCards } from "../../redux/mapCardsSlice";
import { getGlobalMapStyles } from "../../hooks/getGlobalMapStyles";
import { setGlobalSettings } from "../../redux/globalSettingsSlice";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Label } from "@/components/ui/label";
import { ColorPicker } from 'antd';
import { X, AlertCircle } from "lucide-react";

const LocalSettings = () => {
  const { cardId, localStyle, group, tile } = useSelector((state: any) => ({
    cardId: state.localCardId.cardId,
    localStyle: state.localSettings,
    group: state.localSettings.group,
    tile: state.localSettings.tile,
  }));

  const dispatch = useDispatch();
  let { id: mapId } = useParams();
  mapId = String(mapId);

  useEffect(() => {
    console.log("localStyle", localStyle);
  }, [localStyle]);

  const saveSettings = async () => {
    console.log("Final ---- ", localStyle);
    await saveLocalCardStyle(cardId, localStyle);
    dispatch(setMapSettings("none"));

    try {
      const data = await getMapData(mapId);
      if (data) {
        dispatch(setCards(data.cards));
      }
      const globalStyles = await getGlobalMapStyles(mapId);
      if (Array.isArray(globalStyles)) {
        console.error("Unexpected globalStyles format:", globalStyles);
      } else {
        dispatch(setGlobalSettings(globalStyles?.settings));
      }
    } catch (error) {
      console.error("Error updating settings:", error);
    }
  };

  const ColorSection = ({ title, items }) => (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="space-y-3">
        {items.map(({ label, value, onChange }) => (
          <div key={label} className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground">{label}</Label>
            <ColorPicker
              style={{ width: 100 }}
              disabledAlpha
              showText
              value={value}
              onChange={(hex) => onChange(hex.toHexString())}
            />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="w-[360px] border-none shadow-none h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Local Settings</CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(setMapSettings("none"))}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <ColorSection
          title="Group Styles"
          items={[
            {
              label: "Border Color",
              value: group.borderColor,
              onChange: (hex) => dispatch(setGroupBorderColor(hex))
            },
            {
              label: "Fill Color",
              value: group.fillColor,
              onChange: (hex) => dispatch(setGroupFillColor(hex))
            }
          ]}
        />

        <Separator />

        <ColorSection
          title="Tile Styles"
          items={[
            {
              label: "Border Color",
              value: tile.borderColor,
              onChange: (hex) => dispatch(setTileBorderColor(hex))
            },
            {
              label: "Fill Color",
              value: tile.fillColor,
              onChange: (hex) => dispatch(setTileFillColor(hex))
            }
          ]}
        />
      </CardContent>

      <CardFooter className="absolute bottom-0 left-0 right-0 pb-4 px-6 flex flex-col gap-2">
        <Button 
          className="w-full" 
          onClick={saveSettings}
        >
          Save Changes
        </Button>
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => dispatch(setMapSettings("none"))}
        >
          Discard
        </Button>
      </CardFooter>

      <AlertDialog>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500" />
              Save Changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save your changes to this card's appearance?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => dispatch(setMapSettings("none"))}>
              Discard
            </AlertDialogCancel>
            <AlertDialogAction onClick={saveSettings}>
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default LocalSettings;