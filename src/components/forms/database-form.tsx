import React, { useState, useCallback, useEffect } from "react";
import { X, Upload, Link2, Camera, Trash2 } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Select from "react-select/creatable";
import { supabase } from "@/lib/supabaseClient";
import { TiptapEditor } from "../editor/tiptap-editor";
import { ImageUpload } from "../database/image-upload";
import { useTableData } from "@/hooks/use-table-data";
import { useTableColumns } from "@/hooks/use-table-columns";
import RichTextEditor from "../editor/text-editor";

interface FormData {
  name: string;
  url: string;
  logo: string;
  category: {
    value: string;
    label: string;
    color: string;
  };

  parentCategory: {
    value: string;

    label: string;
  } | null;

  description: string;
  last_updated: string;
  shortDescription?: string;
  shortDescriptionHtml?: string;
}

interface EditItemFormData extends FormData {
  descriptionHtml: string;
  tile_id: string;
  shortDescription?: string;
  shortDescriptionHtml?: string;
}

interface DatabaseFormProps {
  mapId: string;
  data: EditItemFormData;
  onSave: (updatedData: Partial<FormData>) => Promise<void>;
  onCancel: () => void;
}

interface Category {
  value: string;
  label: string;
  color: string;
}

const DatabaseForm = ({ mapId, data, onSave, onCancel }: DatabaseFormProps) => {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);

  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: data.name || "",
    url: data.url || "",
    logo: data.logo || "",
    category: data.category || { value: "", label: "", color: "" },
    description: data.description || "",
    last_updated: data.last_updated || new Date().toISOString(),
    parentCategory: data.parentCategory || null,
    shortDescription: data.shortDescription || "",
    shortDescriptionHtml: data.shortDescriptionHtml || "",
  });
  console.log("formData", formData);
  const { updateRow } = useTableData({ mapId });

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: cards, error } = await supabase
        .from("cards")
        .select(
          `
          card_id,
          name,
          settings
        `
        )
        .eq("map_id", mapId);

      if (error) {
        console.error("Error fetching cards:", error);
        return;
      }

      const formattedCards = cards.map((card) => ({
        value: card.card_id,
        label: card.name,
        color: card.settings?.tile?.fillColor || "#ffffff",
      }));

      setCategoryOptions(formattedCards);
    } catch (error) {
      console.error("Error in fetchCards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [mapId]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards, mapId]);

  const handleCreateNewCategory = async (cardName: string) => {
    try {
      setIsLoading(true);
      const { data: newCard, error: cardError } = await supabase
        .from("cards")
        .insert({
          map_id: mapId,
          name: cardName,
          settings: {
            tile: { fillColor: "#ffffff", borderColor: "#000000" },
            group: { fillColor: "#ffffff", borderColor: "#000000" },
          },
        })
        .select()
        .single();

      if (cardError) throw cardError;

      const newCardOption = {
        value: newCard.card_id,
        label: cardName,
        color: newCard.settings?.tile?.fillColor || "#ffffff",
      };

      setFormData((prev) => ({
        ...prev,
        category: newCardOption,
      }));

      await fetchCards();
      return newCard;
    } catch (error) {
      console.error("Error creating new card:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDiscard = () => {
    if (JSON.stringify(formData) !== JSON.stringify(data)) {
      setShowDiscardDialog(true);
    } else {
      onCancel();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updates: Partial<FormData> = {};
    if (formData.name !== data.name) updates.name = formData.name;
    if (formData.url !== data.url) updates.url = formData.url;
    if (formData.description !== data.description)
      updates.description = formData.description;
    if (formData.category.value !== data.category.value) {
      updates.category = formData.category;
    }
    if (formData.shortDescription !== data.shortDescription) {
      updates.shortDescription = formData.shortDescription;
      updates.shortDescriptionHtml = formData.shortDescriptionHtml;
    }

    console.log("updates", updates);
    await onSave(updates);
  };

  const handleDescriptionSave = async (content: {
    html: string;
    markdown: string;
  }) => {
    try {
      await updateRow(data.tile_id, {
        description: {
          html: content.html,
          markdown: content.markdown,
        },
      });
      setFormData((prev) => ({
        ...prev,
        description: content.markdown,
      }));
      setIsDescriptionDialogOpen(false);
    } catch (error) {
      console.error("Error saving description:", error);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-2 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-base">Edit Item</span>
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

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-6">
          {/* Image Upload Section */}
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
                  Upload
                </Button>
                {formData.logo && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, logo: "" }));
                      onSave({ logo: "" });
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator className="border-1" />

          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Basic Information</h3>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <div className="relative">
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    className="pr-10"
                  />
                  <Link2 className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
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
              value={formData.category.value ? formData.category : null}
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
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Description</h3>
            </div>
            <div className="relative">
              <Textarea
                value={formData.description}
                rows={4}
                className="pr-20"
                readOnly
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="absolute right-2 top-2"
                onClick={() => setIsDescriptionDialogOpen(true)}
              >
                Edit
              </Button>
            </div>
          </div>
          <Separator className="border-1" />
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Short Description</h3>
            </div>
            <RichTextEditor
              onChange={(content: { html: string; markdown: string }) => {
                setFormData((prev) => ({
                  ...prev,
                  shortDescription: content.markdown,
                  shortDescriptionHtml: content.html,
                }));
              }}
              value={formData.shortDescriptionHtml}
              valueMarkdown={formData.shortDescription}
            />
          </div>
          <div className="text-sm text-gray-500">
            Last Modified:{" "}
            <span className="font-medium">
              {new Date(data.last_updated).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex flex-col gap-2">
          <Button className="w-full" onClick={handleSubmit}>
            Save Changes
          </Button>
          <Button variant="outline" className="w-full" onClick={handleDiscard}>
            Discard
          </Button>
        </div>
      </div>

      {/* Dialogs */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[680px] max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
          </DialogHeader>
          <ImageUpload
            initialImage={data.logo}
            initialUrl={data.url}
            onImageSelect={async (imageUrl) => {
              setFormData((prev) => ({ ...prev, logo: imageUrl }));
              onSave({ logo: imageUrl });
              setIsImageDialogOpen(false);
            }}
            onClose={() => setIsImageDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={isDescriptionDialogOpen}
        onOpenChange={setIsDescriptionDialogOpen}
      >
        <DialogContent className="sm:max-w-[900px] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Description</DialogTitle>
          </DialogHeader>
          <TiptapEditor
            initialContent={data.descriptionHtml || ""}
            onSave={handleDescriptionSave}
            onCancel={() => setIsDescriptionDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

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
                onCancel();
                setShowDiscardDialog(false);
              }}
            >
              Discard
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleSubmit(new Event("submit") as any);
                setShowDiscardDialog(false);
              }}
            >
              Save Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DatabaseForm;
