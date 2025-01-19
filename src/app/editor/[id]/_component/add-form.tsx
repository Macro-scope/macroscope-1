import React, { useState, useCallback, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Camera,
  Upload,
  Link2,
  Trash2,
  X,
  Pencil,
  Plus,
  XCircle,
} from "lucide-react";
import Select from "react-select/creatable";
import { supabase } from "@/lib/supabaseClient";
import { useDispatch, useSelector } from "react-redux";
import { setCards } from "@/redux/mapCardsSlice";
import { getMapData } from "@/hooks/getMapData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TiptapEditor } from "@/components/editor/tiptap-editor";
import { ImageUpload } from "@/components/database/image-upload";
import RichTextEditor from "@/components/editor/text-editor";
import { Input } from "@/components/ui/input";
import { setMapSettings } from "@/redux/mapSettingsSlice";
import { toast } from "sonner";
import { RootState } from "@/redux/store";
import { setLocalCard, setLocalCardId } from "@/redux/localSettingsSlice";

interface AddSheetProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  mapId: string;
}

const AddForm = ({ open, onOpenChange, mapId }: AddSheetProps) => {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    logo: "",
    category: { value: "", label: "", color: "" },
    description: "",
    short_description_markdown: "",
    short_description_html: "",
    tags: [] as string[],
  });
  const localCard = useSelector((state: RootState) => state.localCardId);
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

  useEffect(() => {
    if (localCard && localCard.card && localCard.card.value !== "") {
      setFormData((prev) => ({
        ...prev,
        category: {
          value: localCard.card.value,
          label: localCard.card.label,
          color: "#000000",
        },
      }));
    }
  }, [localCard]);

  const handleCreateNewCategory = async (categoryName: string) => {
    try {
      setIsLoading(true);
      const newCategoryId = crypto.randomUUID();

      const { data: newCategory, error: categoryError } = await supabase
        .from("categories")
        .insert({
          category_id: newCategoryId,
          map_id: mapId,
          name: categoryName,
          color: "#000000",
        })
        .select()
        .single();

      if (categoryError) throw categoryError;

      const newCategoryOption = {
        value: newCategoryId,
        label: categoryName,
        color: "#000000",
      };

      setFormData((prev) => ({
        ...prev,
        category: newCategoryOption,
      }));

      await fetchCategories();
    } catch (error) {
      console.error("Error creating new category:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      let cardId: string;
      let categoryId: string;
      const tileName = formData.name.trim() || "New Tile";

      if (!formData.category?.value) {
        // Get or create "Other" category
        const { data: existingCategory, error: categoryError } = await supabase
          .from("categories")
          .select("category_id")
          .eq("name", "Other")
          .eq("map_id", mapId)
          .single();

        if (categoryError) {
          // Create new "Other" category
          const newCategoryId = crypto.randomUUID();
          const { data: newCategory, error: createCategoryError } =
            await supabase
              .from("categories")
              .insert({
                category_id: newCategoryId,
                map_id: mapId,
                name: "Other",
                color: "#000000",
              })
              .select("category_id")
              .single();

          if (createCategoryError) throw createCategoryError;
          categoryId = newCategoryId;
        } else {
          categoryId = existingCategory.category_id;
        }

        // Get or create "Other" card
        const { data: existingCard, error: cardError } = await supabase
          .from("cards")
          .select("card_id")
          .eq("name", "Other")
          .eq("category_id", categoryId)
          .eq("map_id", mapId)
          .single();

        if (cardError) {
          const { data: newCard, error: createCardError } = await supabase
            .from("cards")
            .insert({
              map_id: mapId,
              category_id: categoryId,
              name: "Other",
            })
            .select("card_id")
            .single();

          if (createCardError) throw createCardError;
          cardId = newCard.card_id;
        } else {
          cardId = existingCard.card_id;
        }
      } else {
        categoryId = formData.category.value;
        // Get or create card for selected category
        const { data: existingCard, error: cardError } = await supabase
          .from("cards")
          .select("card_id")
          .eq("category_id", categoryId)
          .eq("map_id", mapId)
          .single();

        if (cardError) {
          const { data: newCard, error: createCardError } = await supabase
            .from("cards")
            .insert({
              map_id: mapId,
              category_id: categoryId,
              name: formData.category.label,
            })
            .select("card_id")
            .single();

          if (createCardError) throw createCardError;
          cardId = newCard.card_id;
        } else {
          cardId = existingCard.card_id;
        }
      }

      // Create the tile with valid card_id and category_id
      const { error: tileError } = await supabase.from("tiles").insert({
        card_id: cardId,
        name: tileName,
        url: formData.url || "#",
        logo: formData.logo,
        category_id: categoryId,
        description_markdown: formData.description,
        short_description_markdown: formData.short_description_markdown,
        short_description_html: formData.short_description_html,
      });

      if (tileError) throw tileError;

      const mapData = await getMapData(mapId);
      if (mapData) {
        dispatch(setCards(mapData.cards));
      }

      toast.success("Tile Added");

      onOpenChange(false);
      dispatch(setMapSettings("none"));
      dispatch(setLocalCardId(""));
      dispatch(setLocalCard({ label: "", value: "" }));
      setFormData({
        name: "",
        url: "",
        logo: "",
        category: { value: "", label: "", color: "" },
        description: "",
        short_description_markdown: "",
        short_description_html: "",
        tags: [],
      });
    } catch (error) {
      console.error("Error creating tile:", error);
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
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        className="w-[360px]  shadow-none h-[calc(100vh-60px)] mt-12 pt-0"
        side="right"
      >
        <div className="p-2  flex justify-between items-center pb-2">
          <div className="text-lg font-medium">Add New Item</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              if (onOpenChange) {
                onOpenChange(false);
              }
              dispatch(setLocalCardId(""));
              dispatch(setLocalCard({ label: "", value: "" }));
              dispatch(setMapSettings("none"));
            }}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-140px)]">
          {/* Image Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Image</h3>
            </div>
            {/* s */}
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
              value={formData.category.value === "" ? null : formData.category}
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
                  placeholder="Add a tag..."
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
                  </span>
                ))}
              </div>
            </div>
          </div>

          <Separator className="border-1" />

          {/* Description Section */}
          <div className="space-y-4">
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
          </div>

          <Separator className="border-1" />

          {/* Short Description Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Short Description</h3>
            </div>
            <RichTextEditor
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
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t flex gap-2">
          <Button className="w-full" onClick={handleCreate}>
            Create Tile
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            Discard
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
              initialContent=""
              onSave={handleDescriptionSave}
              onCancel={() => setIsDescriptionDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
};

export default AddForm;
