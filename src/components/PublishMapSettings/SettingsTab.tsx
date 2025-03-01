"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { addLogo } from "@/hooks/addLogo";
import RichTextEditor from "../editor/text-editor";

const SettingsTab = ({ mapId }: { mapId: string }) => {
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    title: "",
    description: "",
    navbar_logo: null as string | null,
    suggestion_form_link: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch initial settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from("publish_settings")
          .select("*")
          .eq("map_id", mapId)
          .single();

        if (error) throw error;

        if (data) {
          setSettings({
            title: data.title || "",
            description: data.description || "",
            navbar_logo: data.navbar_logo || null,
            suggestion_form_link: data.suggestion_form_link || "",
          });
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
        toast({
          title: "Error",
          description: "Failed to load settings",
          variant: "destructive",
        });
      } finally {
        setIsInitialLoading(false);
      }
    };

    if (mapId) {
      fetchSettings();
    }
  }, [mapId, toast]);

  const handleLogoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageUrl = reader.result as string;
        const publicUrl = await addLogo(imageUrl);
        if (publicUrl) {
          setSettings((prev) => ({ ...prev, navbar_logo: publicUrl }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast({
        title: "Error",
        description: "Failed to upload logo",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("publish_settings")
        .update({
          title: settings.title,
          description: settings.description,
          navbar_logo: settings.navbar_logo,
          suggestion_form_link: settings.suggestion_form_link,
        })
        .eq("map_id", mapId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex items-center justify-center h-full p-4">
        <div className="animate-pulse space-y-4 w-full">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 rounded w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded w-full"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-6 p-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="block font-medium text-sm">
          Title
        </Label>
        <Input
          id="title"
          value={settings.title}
          onChange={(e) =>
            setSettings((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="Map Name"
          className="w-full"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description" className="block font-medium text-sm">
          Description
        </Label>
        <RichTextEditor
          value={settings.description}
          valueMarkdown={settings.description}
          onChange={(content: { html: string; markdown: string }) => {
            setSettings((prev) => ({
              ...prev,
              description: content.html,
            }));
          }}
        />
      </div>

      {/* NavBar Logo Section */}
      <div className="space-y-2">
        <Label className="block font-medium text-sm">NavBar Logo</Label>
        <p className="text-xs text-gray-500">Recommended size: 80 × 250 px</p>

        <div className="flex flex-col gap-2">
          <div className="w-full overflow-hidden bg-gray-50 h-20 rounded border border-gray-200 flex items-center justify-center">
            {settings.navbar_logo ? (
              <Image
                src={settings.navbar_logo}
                alt="Navbar Logo"
                width={250}
                height={80}
                className="object-fit"
              />
            ) : (
              <Image
                src="/placeholder.svg"
                alt="Placeholder"
                width={24}
                height={24}
                className="text-gray-400"
              />
            )}
          </div>

          <div className="flex gap-2">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-gray-200"
                disabled={isUploading}
              >
                <Upload className="h-4 w-4" />
                {isUploading ? "Uploading..." : "Upload"}
              </Button>
            </div>
            {settings.navbar_logo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, navbar_logo: null }))
                }
                className="text-gray-500 hover:text-gray-600"
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestion Form Link */}
      <div className="space-y-2">
        <Label htmlFor="suggestion-link" className="block font-medium text-sm">
          Suggestion form link
        </Label>
        <Input
          id="suggestion-link"
          value={settings.suggestion_form_link}
          onChange={(e) =>
            setSettings((prev) => ({
              ...prev,
              suggestion_form_link: e.target.value,
            }))
          }
          placeholder="Enter suggestion form link"
          className="w-full"
        />
      </div>

      <div className="bg-white w-full py-2  ">
        <Button onClick={handleSaveChanges} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsTab;
