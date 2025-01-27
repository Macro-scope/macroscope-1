"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useSelector } from "react-redux";
import { X } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  tileId: string;
  cancelDrawer: () => void;
};

const TileEditDrawer = (props: Props) => {
  const [tile, setTile] = useState<any>();
  const [categories, setCategories] = useState([]);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    url: "",
    category: "",
    description: "",
  });

  const { mapCards } = useSelector((state: any) => ({
    mapCards: state.mapCards,
  }));

  useEffect(() => {
    setCategories(
      mapCards.data.map((c: any) => ({
        value: c.card_id,
        label: c.name,
      }))
    );
  }, [mapCards]);

  useEffect(() => {
    const getTileInfo = async (tileId: string) => {
      const { data } = await supabase
        .from("tiles")
        .select()
        .eq("tile_id", tileId)
        .single();

      setTile(data);
      setFormData({
        name: data?.name || "",
        url: data?.url || "",
        category: data?.card_id || "",
        description: data?.description || "",
      });
    };

    getTileInfo(props.tileId);
  }, [props.tileId]);

  const convertToDate = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.toDateString() === today.toDateString();
    const isYesterday = date.toDateString() === yesterday.toDateString();

    if (isToday) return "Today";
    if (isYesterday) return "Yesterday";
    return new Date(timestamp).toLocaleString();
  };

  const saveTileSettings = async () => {
    const { error } = await supabase
      .from("tiles")
      .update({
        name: formData.name,
        url: formData.url,
        card_id: formData.category,
        description: formData.description,
      })
      .eq("tile_id", props.tileId);

    if (error) {
      console.error(error);
    } else {
      props.cancelDrawer();
    }
  };

  return (
    <>
      <Card className="w-[360px] border-none shadow-lg h-full overflow-y-auto">
        <div className="p-2">
          <div className="flex items-center justify-between">
            <span className="text-base">Edit Tile</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowDiscardDialog(true)}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="h-[1px] w-full bg-border" />

        <CardContent className="space-y-6 pt-6">
          {/* Logo Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Logo</h3>
            </div>
            <div className="flex flex-col items-center gap-4">
              <img
                src={`https://icons.duckduckgo.com/ip3/www.${tile?.url}.ico`}
                alt=""
                className="h-20 w-20 object-contain"
              />
              <Button variant="outline" size="sm">
                Upload New Logo
              </Button>
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
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-48 h-8"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">URL</span>
                <Input
                  value={formData.url}
                  onChange={(e) =>
                    setFormData({ ...formData, url: e.target.value })
                  }
                  className="w-48 h-8"
                />
              </div>
            </div>
          </div>

          <Separator className="border-1" />

          {/* Category Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-sm">Category</h3>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Select Category
              </span>
              <Select
                value={formData.category}
                onValueChange={(value) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger className="w-48 h-8">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator className="border-1" />

          {/* Description Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm">Description</h3>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px]"
            />
            <div className="text-sm text-muted-foreground">
              Last Modified: {convertToDate(tile?.updated_at)}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex absolute bottom-0 left-0 right-0 py-4 bg-background gap-2">
          <Button className="w-full" onClick={saveTileSettings}>
            Save Changes
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowDiscardDialog(true)}
          >
            Discard
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <AlertDialogContent className="w-96">
          <AlertDialogHeader>
            <AlertDialogTitle>Save Changes</AlertDialogTitle>
            <AlertDialogDescription>
              Do you want to save these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={props.cancelDrawer}>
              Discard
            </AlertDialogCancel>
            <AlertDialogAction onClick={saveTileSettings}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default TileEditDrawer;
