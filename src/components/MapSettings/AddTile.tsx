"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X, Upload, Link2, Camera, Trash2, Plus, XCircle } from "lucide-react";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Select from "react-select/creatable";
import { supabase } from "@/lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { setMapSettings } from "@/redux/mapSettingsSlice";
import { setCards } from "@/redux/mapCardsSlice";
import { getMapData } from "@/hooks/getMapData";
import { TiptapEditor } from "../editor/tiptap-editor";
import { ImageUpload } from "../database/image-upload";
import { toast } from "sonner";
import { Tile } from "@/types/data";
import { RootState } from "@/redux/store";
import { Input } from "../ui/input";

interface TileSettingsProps {
  mapId: string;
  tileData: Tile;
}

const AddTile = ({ mapId, tileData }: TileSettingsProps) => {
  const cardId = useSelector((state: RootState) => state.localCardId);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formErrors, setFormErrors] = useState({
    name: false,
    url: false,
    category: false,
    description: false,
  });

  const [formData, setFormData] = useState({
    name: "",
    url: "",
    logo: "",
    category: { value: "", label: "", color: "" },
    description: "",
    tags: [] as string[],
  });

  const dispatch = useDispatch();

  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      url: !formData.url.trim(),
      category: !formData.category.value,
      description: !formData.description.trim(),
    };

    setFormErrors(errors);
    return !Object.values(errors).some((error) => error);
  };
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .eq("map_id", mapId);

      if (error) {
        console.error("Error fetching categories:", error);
        return;
      }

      const formattedCategories = categories.map((category) => ({
        value: category.category_id,
        label: category.name,
        color: category.color || "#000000",
      }));

      setCategoryOptions(formattedCategories);
    } catch (error) {
      console.error("Error in fetchCategories:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateNewCategory = async (categoryName: string) => {
    try {
      setIsLoading(true);
      const { data: newCategory, error: categoryError } = await supabase
        .from("categories")
        .insert({
          map_id: mapId,
          name: categoryName,
          color: "#000000",
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      const { data: newCard, error: cardError } = await supabase
        .from("cards")
        .insert({
          map_id: mapId,
          category_id: newCategory.category_id, // Changed from tag_id
          name: categoryName,
        })
        .select("*, categories!inner(category_id, name, color)")
        .single();

      if (cardError) throw cardError;

      const newCategoryOption = {
        value: newCategory.category_id,
        label: categoryName,
        color: "#000000",
      };

      setFormData((prev) => ({
        ...prev,
        category: newCategoryOption,
      }));

      await fetchCategories();
      return newCard;
    } catch (error) {
      console.error("Error creating new category:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { data } = await supabase
      .from("tiles")
      .select()
      .eq("card_id", cardId.cardId);

    try {
      setIsSaving(true);
      const { error: updateError } = await supabase.from("tiles").insert({
        name: formData.name,
        url: formData.url,
        logo: formData.logo,
        description_markdown: formData.description,
        card_id: cardId.cardId,
        order: data?.length || 0,
        tags: formData.tags,
      });

      if (updateError) throw updateError;

      const mapData = await getMapData(mapId);
      if (mapData) {
        dispatch(setCards(mapData.cards));
      }
      toast.success("Tile Added");
      dispatch(setMapSettings("none"));
    } catch (error) {
      console.error("Error updating tile:", error);
      toast.error("Failed to add tile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDescriptionSave = async (content: {
    html: string;
    markdown: string;
  }) => {
    setFormData((prev) => ({
      ...prev,
      description: content.markdown,
    }));
    setIsDescriptionDialogOpen(false);
  };

  const handleDiscard = () => {
    setShowDiscardDialog(true);
  };

  return (
    <Card className="w-[360px] border-none shadow-lg h-full overflow-y-auto border-l-2 border-gray-200">
      <div className="p-2">
        <div className="flex items-center justify-between">
          <span className="text-base">Add Tile </span>
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
      <div className="p-4 space-y-6"></div>

      <CardContent className="space-y-6">
        {/* Image Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Image</h3>
          </div>
          <div className="relative w-full h-40 bg-gray-50 rounded-lg flex items-center justify-center group">
            {formData.logo ? (
              <img
                src={formData.logo}
                alt="Logo"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <Camera className="w-12 h-12 text-gray-300" />
            )}
            <div className="absolute right-2 bottom-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsImageDialogOpen(true)}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
              {formData.logo && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setFormData((prev) => ({ ...prev, logo: "" }))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        <Separator className="border-1" />

        {/* Basic Info Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Basic Info</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Name</span>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-48 h-8 rounded-md border px-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">URL</span>
              <div className="relative w-48">
                <input
                  type="text"
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-full h-8 rounded-md border px-2 pr-8"
                />
                <Link2 className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        <Separator className="border-1" />

        {/* Category Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Category</h3>
          </div>

          <Select
            isDisabled={isLoading}
            isClearable
            placeholder={
              isLoading
                ? "Loading categories..."
                : "Search or create category..."
            }
            value={formData.category}
            options={categoryOptions} // Changed from tagOptions
            onChange={(newValue: any) => {
              if (!newValue) {
                setFormData((prev) => ({
                  ...prev,
                  category: { value: "", label: "", color: "" },
                }));
                return;
              }

              if (newValue.__isNew__) {
                handleCreateNewCategory(newValue.label); // Changed from handleCreateNewTag
              } else {
                setFormData((prev) => ({
                  ...prev,
                  category: newValue,
                }));
              }
            }}
            classNames={{
              control: () => "border rounded-md !min-h-[40px]",
              menu: () => "mt-1 bg-white border rounded-md shadow-lg",
              option: () => "px-3 py-2 hover:bg-gray-50",
            }}
          />
        </div>

        <Separator className="border-1" />

        {/* Description Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Description</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDescriptionDialogOpen(true)}
            >
              Edit
            </Button>
          </div>

          <textarea
            value={formData.description}
            readOnly
            className="w-full h-24 rounded-md border p-2 resize-none text-sm"
          />
        </div>
      </CardContent>

      <CardFooter className="flex gap-2 mt-6">
        <Button disabled={isSaving} className="w-full" onClick={handleSave}>
          {isSaving ? "Adding tile..." : "Add tile"}
        </Button>
        <Button variant="outline" className="w-full" onClick={handleDiscard}>
          Discard
        </Button>
      </CardFooter>

      {/* Image Upload Dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <ImageUpload
            initialImage={formData.logo}
            initialUrl={formData.url}
            onImageSelect={(imageUrl) => {
              setFormData((prev) => ({ ...prev, logo: imageUrl }));
              setIsImageDialogOpen(false);
            }}
            onClose={() => setIsImageDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Description Editor Dialog */}
      <Dialog
        open={isDescriptionDialogOpen}
        onOpenChange={setIsDescriptionDialogOpen}
      >
        <DialogContent className="sm:max-w-[900px] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Description</DialogTitle>
          </DialogHeader>
          <TiptapEditor
            initialContent={""}
            onSave={handleDescriptionSave}
            onCancel={() => setIsDescriptionDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Discard Dialog */}
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
                dispatch(setMapSettings("none"));
                setShowDiscardDialog(false);
              }}
            >
              Discard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleSave();
                setShowDiscardDialog(false);
              }}
            >
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default AddTile;
