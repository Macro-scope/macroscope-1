"use client"

import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Trash2, Upload } from 'lucide-react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { TiptapEditor } from "../editor/tiptap-editor"

const SettingsTab = () => {
  const [logo, setLogo] = React.useState<string | null>(null)
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false)
  const [description, setDescription] = useState("")

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogo(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDescriptionSave = (content: { html: string; markdown: string }) => {
    setDescription(content.markdown)
    setIsDescriptionDialogOpen(false)
  }

  return (
    <div className="flex flex-col space-y-6 p-4">
      {/* Title Section */}
      <div className="space-y-2">
        <Label htmlFor="title" className="block text-sm font-normal">
          Title
        </Label>
        <Input
          id="title"
          placeholder="Map Name"
          className="w-full"
        />
      </div>

      {/* Description Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="block text-sm font-normal">
            Description
          </Label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDescriptionDialogOpen(true)}
          >
            Edit
          </Button>
        </div>
        <textarea
          value={description}
          readOnly
          placeholder="Name | Email | Website"
          className="w-full h-24 rounded-md border p-2 resize-none text-sm bg-white"
        />
      </div>

      {/* NavBar Logo Section */}
      <div className="space-y-2">
        <Label className="block text-sm font-normal">
          NavBar Logo
        </Label>
        <p className="text-xs text-gray-500">
          Recommended size: 80 × 250 px
        </p>
        
        <div className="flex flex-col gap-2">
          <div className="w-full bg-gray-50 h-20 rounded border border-gray-200 flex items-center justify-center">
            {logo ? (
              <Image
                src={logo}
                alt="Navbar Logo"
                width={250}
                height={80}
                className="object-contain"
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
              />
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2 border-gray-200"
              >
                <Upload className="h-4 w-4" />
                Upload
              </Button>
            </div>
            {logo && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLogo(null)}
                className="text-gray-500 hover:text-gray-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Suggestion Form Link */}
      <div className="space-y-2">
        <Label htmlFor="suggestion-link" className="block text-sm font-normal">
          Suggestion form link
        </Label>
        <Input
          id="suggestion-link"
          placeholder="Enter suggestion form link"
          className="w-full"
        />
      </div>

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
            initialContent={description}
            onSave={handleDescriptionSave}
            onCancel={() => setIsDescriptionDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default SettingsTab