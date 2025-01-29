"use client";

import { useDispatch, useSelector } from "react-redux";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { setLocalSettings, MapSettings } from "../../redux/localSettingsSlice";
import {
  saveLocalCardNameAndDescription,
  saveLocalCardStyle,
} from "../../hooks/saveLocalCardStyle";
import { setMapSettings } from "../../redux/mapSettingsSlice";
import { getMapData } from "../../hooks/getMapData";
import { setCards } from "../../redux/mapCardsSlice";
import { getGlobalMapStyles } from "../../hooks/getGlobalMapStyles";
import { setGlobalSettings } from "../../redux/globalSettingsSlice";
import { Card, CardContent } from "@/components/ui/card";
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
import { Alert, ColorPicker } from "antd";
import { X, AlertCircle, Loader, Trash } from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { RootState } from "@/redux/store";
import Skeleton from "@/components/ui/skeleton";
import { toast } from "react-toastify";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { Sheet, SheetContent } from "../ui/sheet";

const LocalSettings = () => {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const { toast } = useToast();
  const [localSettingsState, setLocalSettingsState] = useState<MapSettings>({
    cardId: "",
    group: {
      name: null,
      description: null,
      borderColor: null,
      fillColor: null,
    },
    tile: {
      borderColor: null,
      fillColor: null,
    },
  });

  const { cardId, reduxSettings } = useSelector((state: RootState) => ({
    cardId: state.localCardId.cardId,
    reduxSettings: state.localSettings,
  }));

  const dispatch = useDispatch();
  const mapSettings = useSelector(
    (state: RootState) => state.mapSettings.value
  );
  let { id: mapId } = useParams();
  mapId = String(mapId);

  useEffect(() => {
    setLocalSettingsState({ ...reduxSettings, cardId });
    setTimeout(() => setIsInitialLoading(false), 500);
  }, [reduxSettings]);

  const handleInputChange = (
    section: "group" | "tile",
    field: string,
    value: string
  ) => {
    setLocalSettingsState((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };
  const handleDeleteOption = async (deleteItems: boolean) => {
    if (!cardId) return;

    try {
      setLoading(true);

      if (deleteItems) {
        const { data: cardData } = await supabase
          .from("cards")
          .select("*")
          .eq("card_id", cardId)
          .single();
        // Delete the card
        const { error: cardError } = await supabase
          .from("cards")
          .delete()
          .eq("card_id", cardId);
        const { error: categoryError } = await supabase
          .from("categories")
          .delete()
          .eq("category_id", cardData?.category_id);

        if (cardError) throw cardError;
        if (categoryError) throw categoryError;
      } else {
        // Find or create 'Other' category
        const { data: otherCategory, error: categoryError } = await supabase
          .from("categories")
          .select("category_id")
          .eq("map_id", mapId)
          .eq("name", "Other")
          .single();

        if (categoryError && categoryError.code !== "PGRST116")
          throw categoryError;

        const otherCategoryId =
          otherCategory?.category_id ||
          (await createOtherCategory()).category_id;

        // Update the card to use Other category
        const { error: updateError } = await supabase
          .from("cards")
          .update({
            category_id: otherCategoryId,
          })
          .eq("card_id", cardId);

        if (updateError) throw updateError;
      }

      // Update the Redux store and close dialogs
      const data = await getMapData(mapId);
      if (data) {
        dispatch(setCards(data.cards));
      }
      dispatch(setMapSettings("none"));
      setShowDeleteDialog(false);
      toast({
        title: deleteItems
          ? "Group deleted successfully"
          : "Group moved to 'Other' category",
      });
    } catch (error) {
      console.error("Error handling card deletion:", error);
      toast({
        title: "Error deleting group",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  const createOtherCategory = async () => {
    const { data, error } = await supabase
      .from("categories")
      .insert({
        name: "Other",
        color: "#808080",
        map_id: mapId,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      dispatch(setLocalSettings(localSettingsState));
      await saveLocalCardStyle(cardId, localSettingsState);
      await saveLocalCardNameAndDescription(
        cardId,
        localSettingsState.group.name,
        localSettingsState.group.description
      );
      console.log("cardId", cardId);
      const { data: categories, error } = await supabase
        .from("categories")
        .update({
          name: localSettingsState.group.name,
        })
        .eq("category_id", cardId);
      console.log("categories", categories);
      console.log("error", error);
      const data = await getMapData(mapId);
      if (data) dispatch(setCards(data.cards));

      const globalStyles = await getGlobalMapStyles(mapId);
      if (!Array.isArray(globalStyles)) {
        dispatch(setGlobalSettings(globalStyles?.settings));
      }

      setHasUnsavedChanges(false);
      dispatch(setMapSettings("none"));
      toast({ title: "Settings saved successfully" });
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscard = () => {
    if (hasUnsavedChanges) {
      setShowDiscardDialog(true);
    } else {
      dispatch(setMapSettings("none"));
    }
  };

  const discardChanges = () => {
    setLocalSettingsState({ ...reduxSettings, cardId });
    setHasUnsavedChanges(false);
    dispatch(setMapSettings("none"));
    setShowDiscardDialog(false);
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
  );

  const ColorPickerField = ({ label, value, onChange }) => (
    <div className="flex items-center justify-between">
      <span className="text-sm">{label}</span>
      {isInitialLoading ? (
        <Skeleton className="h-8 w-24" />
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 px-2 py-1 cursor-pointer">
            <div
              className="w-5 h-5 rounded border border-gray-200"
              style={{ backgroundColor: value || "#000000" }}
            />
            <span className="text-sm text-gray-600 font-mono">
              {value?.toUpperCase() || "#000000"}
            </span>
          </div>
          <input
            type="color"
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            value={value || "#000000"}
            onChange={(e) => {
              onChange(e.target.value);
            }}
          />
        </div>
      )}
    </div>
  );

  return (
    <Sheet
      open={mapSettings === "local"}
      onOpenChange={() => dispatch(setMapSettings("none"))}
    >
      <SheetContent
        className="w-[360px] shadow-none h-[calc(100vh-60px)] mt-12 pt-0 p-0"
        side="right"
      >
        <div className="px-4 py-2 flex justify-between items-center pb-2 border-b-[1.2px] border-gray-200">
          <div className="text-lg font-medium">Group Settings</div>
          <Button variant="ghost" size="icon" onClick={handleDiscard}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
          {/* Group Styles */}
          <div className="space-y-4">
            {isInitialLoading ? (
              <>
                <LoadingSkeleton />
                <LoadingSkeleton />
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label>Group Name</Label>
                  <Input
                    placeholder="Group name"
                    value={localSettingsState.group.name || ""}
                    onChange={(e) =>
                      handleInputChange("group", "name", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Group Description</Label>
                  <Textarea
                    placeholder="Group description"
                    value={localSettingsState.group.description || ""}
                    onChange={(e) =>
                      handleInputChange("group", "description", e.target.value)
                    }
                  />
                </div>
                <Separator className="border-1" />
              </>
            )}

            <div className="space-y-4">
              <Label>Group Style</Label>
              <ColorPickerField
                label="Border Color"
                value={localSettingsState.group.borderColor}
                onChange={(color) => {
                  handleInputChange("group", "borderColor", color);
                }}
              />
              <ColorPickerField
                label="Fill Color"
                value={localSettingsState.group.fillColor}
                onChange={(color) =>
                  handleInputChange("group", "fillColor", color)
                }
              />
            </div>
          </div>

          <Separator className="border-1" />

          {/* Tile Styles */}
          <div className="space-y-4">
            <Label>Tile Style</Label>
            <ColorPickerField
              label="Border Color"
              value={localSettingsState.tile.borderColor}
              onChange={(color) =>
                handleInputChange("tile", "borderColor", color)
              }
            />
            <ColorPickerField
              label="Fill Color"
              value={localSettingsState.tile.fillColor}
              onChange={(color) =>
                handleInputChange("tile", "fillColor", color)
              }
            />
          </div>

          <Separator className="border-1" />

          {/* Danger Zone */}
          <div className="flex justify-between items-center">
            <Label className="text-red-600">Danger zone</Label>
            <Button
              variant="destructive"
              onClick={() => {
                setShowDeleteDialog(true);
              }}
            >
              <Trash className="w-4 h-4 mr-2" /> Delete Group
            </Button>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
          <Button
            className="w-full"
            onClick={saveSettings}
            disabled={!hasUnsavedChanges || loading}
          >
            {loading ? (
              <Loader className="animate-spin h-4 w-4" />
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleDiscard}
            disabled={loading}
          >
            Discard
          </Button>
        </div>

        {/* Delete Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent className="bg-white p-6 max-w-[400px]">
            <div className="flex justify-between items-center">
              <AlertDialogTitle className="text-xl font-semibold">
                Delete Group
              </AlertDialogTitle>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={() => setShowDeleteDialog(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <AlertDialogDescription>
              Deleting this group will remove it from the map and all items
            </AlertDialogDescription>
            <div className="space-y-3">
              {/* <button
                onClick={() => handleDeleteOption(false)}
                disabled={loading}
                className="w-full bg-black text-white p-3 text-sm rounded-md hover:bg-gray-800 disabled:opacity-50 text-center"
              >
                Move group to &apos;Other&apos; category
              </button> */}
              <button
                onClick={() => handleDeleteOption(true)}
                disabled={loading}
                className="w-full p-3 text-center text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Delete group permanently
              </button>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Discard Dialog */}
        <AlertDialog
          open={showDiscardDialog}
          onOpenChange={setShowDiscardDialog}
        >
          <AlertDialogContent className="w-96">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Unsaved Changes
              </AlertDialogTitle>
              <AlertDialogDescription>
                You have unsaved changes. Do you want to save them before
                closing?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={discardChanges}>
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
      </SheetContent>
    </Sheet>
  );
};

export default LocalSettings;
