"use client"

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
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
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  
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

  const handleDiscard = () => {
    setShowDiscardDialog(true);
  };

  const ColorSection = ({ title, items }) => (
    <div className="space-y-4">
      <h3 className="text-base">{title}</h3>
      <div className="space-y-3">
        {items.map(({ label, value, onChange }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{label}</span>
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
    <>
      <Card className="w-[360px] border-none shadow-none h-full">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-base">Local Settings</span>
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
          <ColorSection
            title={<span className="font-medium text-sm">Group Styles</span>}
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

          <div className="h-[1px] w-full bg-border" />

          <ColorSection
            title={<span className="font-medium text-sm">Tile Styles</span>}
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
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 bg-white">
          <Button 
            className="w-full" 
            onClick={saveSettings}
          >
            Save Changes
          </Button>
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleDiscard}
          >
            Discard
          </Button>
        </div>
      </Card>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              
              Save Changes?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save your changes to this card's appearance?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
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
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default LocalSettings;