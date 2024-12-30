"use client";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
  setGroupBorderColor,
  setGroupFillColor,
  setTileBorderColor,
  setTileFillColor,
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
import { ColorPicker } from "antd";
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

  return (
    <>
      <Card className="w-[360px] border-none shadow-none h-full">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <span className="font-medium text-md">Local Settings</span>
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
          {/* Group Styles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Group Styles</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Border Color
              </span>
              <ColorPicker
                showText
                value={group.borderColor}
                onChange={(color) =>
                  dispatch(setGroupBorderColor(color.toHexString()))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fill Color</span>
              <ColorPicker
                showText
                value={group.fillColor}
                onChange={(color) =>
                  dispatch(setGroupFillColor(color.toHexString()))
                }
              />
            </div>
          </div>

          <Separator className="border-1" />

          {/* Tile Styles */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Tile Styles</h3>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Border Color
              </span>
              <ColorPicker
                showText
                value={tile.borderColor}
                onChange={(color) =>
                  dispatch(setTileBorderColor(color.toHexString()))
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Fill Color</span>
              <ColorPicker
                showText
                value={tile.fillColor}
                onChange={(color) =>
                  dispatch(setTileFillColor(color.toHexString()))
                }
              />
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 flex flex-col gap-2 bg-white">
          <Button className="w-full" onClick={saveSettings}>
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
