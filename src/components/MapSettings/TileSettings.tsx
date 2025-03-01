import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  X,
  Upload,
  Link2,
  Camera,
  Trash2,
  Plus,
  XCircle,
  PenLineIcon,
  PenIcon,
  MoreVerticalIcon,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Select from "react-select/creatable";
import { supabase } from "@/lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { setMapSettings } from "@/redux/mapSettingsSlice";
import { setCards } from "@/redux/mapCardsSlice";
import { getMapData } from "@/hooks/getMapData";
import { TiptapEditor } from "../editor/tiptap-editor";
import { ImageUpload } from "../database/image-upload";
import { Input } from "../ui/input";
import { toast } from "sonner";
import { Sheet, SheetContent } from "../ui/sheet";
import { RootState } from "@/redux/store";
import RichTextEditor from "../editor/text-editor";

interface TileSettingsProps {
  mapId: string;
  tileData: any;
}

const TileSettings = ({ mapId, tileData }: TileSettingsProps) => {
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isTagDialogOpen, setIsTagDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editTagInput, setEditTagInput] = useState("");
  const [formData, setFormData] = useState({
    name: tileData?.name || "",
    url: tileData?.url || "",
    logo: tileData?.logo || "",
    category: tileData?.category || { value: "", label: "", color: "" },
    description: tileData?.description || "",
    tags: tileData?.tags || [],
    short_description_markdown: tileData?.short_description_markdown || "",
    short_description_html: tileData?.short_description_html || "",
    description_markdown: tileData?.description_markdown || "",
  });

  const { mapSettings, cards } = useSelector((state: RootState) => {
    return {
      mapSettings: state.mapSettings,
      cards: state.mapCards,
    };
  });
  const dispatch = useDispatch();

  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data: categories, error } = await supabase
        .from("categories")
        .select("*")
        .eq("map_id", mapId);
      console.log("categories", categories);

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
    console.log("cards", cards);
    fetchCategories();
  }, [fetchCategories, cards]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

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
          category_id: newCategory.category_id,
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
    try {
      const { error: updateError } = await supabase
        .from("tiles")
        .update({
          name: formData.name,
          url: formData.url,
          logo: formData.logo,
          tags: formData.tags,
          updated_at: new Date().toISOString(),
          short_description_markdown: formData.short_description_markdown,
          short_description_html: formData.short_description_html,
          description_markdown: formData.description_markdown,
          description: formData.description,
        })
        .eq("tile_id", tileData.tile_id);

      if (updateError) throw updateError;

      if (
        formData.category?.value &&
        formData.category?.value !== tileData.category?.value
      ) {
        const { data: existingCard, error: cardError } = await supabase
          .from("cards")
          .select("card_id")
          .eq("category_id", formData.category.value)
          .eq("map_id", mapId)
          .single();

        let cardId;

        if (cardError) {
          const { data: newCard, error: createError } = await supabase
            .from("cards")
            .insert({
              map_id: mapId,
              category_id: formData.category.value,
            })
            .select("card_id")
            .single();

          if (createError) throw createError;
          cardId = newCard.card_id;
        } else {
          cardId = existingCard.card_id;
        }

        const { error: tileUpdateError } = await supabase
          .from("tiles")
          .update({
            category_id: formData.category.value,
            card_id: cardId,
          })
          .eq("tile_id", tileData.tile_id);

        if (tileUpdateError) throw tileUpdateError;
      }

      const mapData = await getMapData(mapId);
      if (mapData) {
        dispatch(setCards(mapData.cards));
      }

      dispatch(setMapSettings("none"));
    } catch (error) {
      console.error("Error updating tile:", error);
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
    if (isFormModified()) {
      setShowDiscardDialog(true);
    } else {
      dispatch(setMapSettings("none"));
    }
  };

  const handleDeleteTile = async () => {
    try {
      const { error } = await supabase
        .from("tiles")
        .delete()
        .eq("tile_id", tileData.tile_id);

      if (error) throw error;

      const mapData = await getMapData(mapId);
      if (mapData) {
        console.log(mapData.cards);
        dispatch(setCards(mapData.cards));
      }

      dispatch(setMapSettings("none"));
      toast.success("Tile deleted successfully");
    } catch (error) {
      console.error("Error deleting tile:", error);
      toast.error("Failed to delete tile");
    }
  };
  const handleSaveEditTag = async () => {
    try {
      if (editTagInput.length == 0) {
        return;
      }
    } catch (error) {
    } finally {
      setIsTagDialogOpen(false);
    }
  };
  const isFormModified = () => {
    return (
      formData.name !== tileData?.name ||
      formData.url !== tileData?.url ||
      formData.logo !== tileData?.logo ||
      formData.category?.value !== tileData?.category?.value ||
      formData.description_markdown !== tileData?.description_markdown ||
      formData.description !== tileData?.description ||
      formData.short_description_markdown !==
        tileData?.short_description_markdown ||
      formData.short_description_html !== tileData?.short_description_html ||
      JSON.stringify(formData.tags) !== JSON.stringify(tileData?.tags)
    );
  };

  return (
    <Sheet
      open={mapSettings.value === "tile"}
      onOpenChange={() => {
        if (isFormModified()) {
          setShowDiscardDialog(true);
        } else {
          dispatch(setMapSettings("none"));
        }
      }}
    >
      <SheetContent
        className="w-[360px] shadow-none h-[calc(100vh-60px)] mt-12 pt-0 p-0"
        side="right"
      >
        <div className="px-4 py-2 flex justify-between items-center pb-2 border-b-[1.2px] border-gray-200">
          <div className="text-lg font-medium">Edit Tile</div>
          <Button variant="ghost" size="icon" onClick={handleDiscard}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
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
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, logo: "" }))
                    }
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
              <h3 className="font-medium text-sm">Group</h3>
            </div>

            <Select
              isDisabled={isLoading}
              isClearable
              placeholder={
                isLoading ? "Loading Groups..." : "Search or create group..."
              }
              value={formData.category}
              options={categoryOptions}
              onChange={(newValue: any) => {
                if (!newValue) {
                  setFormData((prev) => ({
                    ...prev,
                    category: { value: "", label: "", color: "" },
                  }));
                  return;
                }

                if (newValue.__isNew__) {
                  handleCreateNewCategory(newValue.label);
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

          {/* Tags Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Tags</h3>
            </div>

            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Select tags or create new..."
                  className="flex-1"
                />
                <Button
                  onClick={handleAddTag}
                  disabled={!tagInput.trim()}
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                    <div className="relative flex items-center">
                      <button
                        className=""
                        onClick={() =>
                          isTagDialogOpen
                            ? setIsTagDialogOpen(false)
                            : setIsTagDialogOpen(true)
                        }
                      >
                        <MoreVerticalIcon className="w-4 h-4" />
                      </button>
                      {isTagDialogOpen && (
                        <div className="absolute top-0  -right-28 bg-white border rounded-md shadow-lg px-4 py-2">
                          <ul>
                            <li>
                              <Dialog onOpenChange={setIsTagDialogOpen}>
                                <DialogTrigger>
                                  <button
                                    onClick={() => {
                                      setEditTagInput(tag);
                                    }}
                                    className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
                                  >
                                    Edit <PenIcon className="w-4 h-4" />
                                  </button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogTitle>Edit Tag</DialogTitle>
                                  <DialogDescription>
                                    <h1 className="text-sm mb-2">
                                      Edit the tag name
                                    </h1>
                                    <Input
                                      type="text"
                                      value={editTagInput}
                                      onChange={(e) => {
                                        setEditTagInput(e.target.value);
                                      }}
                                    />
                                  </DialogDescription>
                                  <DialogFooter>
                                    <Button onClick={handleSaveEditTag}>
                                      Save
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            </li>
                            <li>
                              <Dialog>
                                <DialogTrigger>
                                  <button className="text-gray-500 hover:text-gray-700 flex items-center gap-2">
                                    Delete <Trash2 className="w-4 h-4" />
                                  </button>
                                </DialogTrigger>
                              </Dialog>
                            </li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Separator className="border-1" />

          {/* Short Description Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Short Description</h3>
            </div>
            <RichTextEditor
              valueMarkdown={formData.short_description_markdown}
              placeholder="Add a short description..."
              features={["bold", "italic", "link"]}
              onChange={(content: { html: string; markdown: string }) => {
                setFormData((prev) => ({
                  ...prev,
                  short_description_markdown: content.markdown,
                  short_description_html: content.html,
                }));
              }}
              value={formData.short_description_html}
            />
          </div>

          {/* <Separator className="border-1" /> */}

          {/* Description Section */}
          {/* <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Page Content</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsDescriptionDialogOpen(true)}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Button>
            </div>
          </div> */}

          <Separator className="border-1" />

          {/* Danger Zone */}
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-sm">Danger zone</h3>
            <Dialog>
              <DialogTrigger>
                <Button variant="destructive" size="sm">
                  Delete Tile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Tile</DialogTitle>
                </DialogHeader>
                <DialogDescription>
                  Are you sure you want to delete this tile?
                </DialogDescription>
                <DialogFooter>
                  <Button onClick={handleDeleteTile}>Delete</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
          <Button
            className="w-full"
            onClick={handleSave}
            disabled={!isFormModified()}
          >
            Save Changes
          </Button>
          <Button variant="outline" className="w-full" onClick={handleDiscard}>
            {isFormModified() ? "Discard" : "Close"}
          </Button>
        </div>

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
              initialContent={tileData?.descriptionHtml || ""}
              onSave={handleDescriptionSave}
              onCancel={() => setIsDescriptionDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Discard Dialog */}

        <AlertDialog
          open={showDiscardDialog && isFormModified()}
          onOpenChange={(open) => {
            if (!open && !isFormModified()) {
              dispatch(setMapSettings("none"));
            }
            setShowDiscardDialog(open);
          }}
        >
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
      </SheetContent>
    </Sheet>
  );
};

export default TileSettings;
