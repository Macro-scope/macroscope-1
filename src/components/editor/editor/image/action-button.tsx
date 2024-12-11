// @ts-nocheck
import { useRef, useState } from 'react'
import { ImagePlus, Link2, Upload } from 'lucide-react'



import { ImageCropper } from './image-cropper'

import { actionDialogImage, useDialogImage } from './store'
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'

// Custom Label component
const Label = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
  <label
    htmlFor={htmlFor}
    className="text-sm font-medium text-gray-700 leading-none"
  >
    {children}
  </label>
)

// Custom Checkbox component
const Checkbox = ({ checked, onChange }: { checked: boolean; onChange: (checked: boolean) => void }) => (
  <div className="flex items-center">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
    />
  </div>
)

function ActionImageButton(props: any) {


  const dialogImage = useDialogImage()

  const [link, setLink] = useState<string>('')
  const fileInput = useRef<HTMLInputElement>(null)

  const [imageInline, setImageInline] = useState(false)

  async function handleFile(event: any) {
    const files = event?.target?.files
    if (!props.editor || props.editor.isDestroyed || files.length === 0) {
      return
    }
    const file = files[0]
    const uploadOptions = props.editor.extensionManager.extensions.find(
      (extension: any) => extension.name === 'image',
    )?.options

    let src = ''
    if (uploadOptions.upload) {
      src = await uploadOptions.upload(file)
    }
    else {
      src = URL.createObjectURL(file)
    }

    props.editor.chain().focus().setImageInline({ src, inline: imageInline }).run()
    actionDialogImage.setOpen(false)
    setImageInline(false)
  }
  function handleLink(e: any) {
    e.preventDefault()
    e.stopPropagation()

    props.editor.chain().focus().setImageInline({ src: link, inline: imageInline }).run()
    actionDialogImage.setOpen(false)
    setImageInline(false)
  }

  function handleClick(e: any) {
    e.preventDefault()
    fileInput.current?.click()
  }

  return (
    <Dialog open={dialogImage.isOpen} onOpenChange={actionDialogImage.setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="p-2 bg-white hover:bg-gray-100 rounded-md"
          onClick={() => actionDialogImage.setOpen(true)}
          title={props.tooltip}
        >
          <ImagePlus className="h-4 w-4 text-gray-700" />
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white p-6 rounded-lg shadow-lg max-w-[425px]">
        <DialogTitle className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
          <ImagePlus className="h-5 w-5 text-gray-700" />
          Insert Image
        </DialogTitle>

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-md mb-4">
            <TabsTrigger 
              value="upload" 
              className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger 
              value="link" 
              className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              <Link2 className="h-4 w-4" />
              URL
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center space-x-2 py-4 border-b border-gray-200">
            <Checkbox
              checked={imageInline}
              onChange={(checked) => setImageInline(checked)}
            />
            <Label htmlFor="inline">
              Insert as inline image
            </Label>
          </div>

          <TabsContent value="upload">
            <div className="flex items-center gap-2 mt-4">
              <Button 
                className="flex items-center text-black justify-center px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 flex-1"
                onClick={handleClick}
              >
                <Upload className="h-4 w-4 mr-2 text-gray-600" />
                Choose File
              </Button>
              <ImageCropper
                editor={props.editor}
                imageInline={imageInline}
                onClose={() => actionDialogImage.setOpen(false)}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              ref={fileInput}
              className="hidden"
              onChange={handleFile}
            />
          </TabsContent>

          <TabsContent value="link">
            <form onSubmit={handleLink} className="space-y-4 mt-4">
              <div className="flex flex-col space-y-2">
                <Label htmlFor="url">Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={link}
                    onChange={e => setLink(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                    required
                  />
                  <Button 
                    type="submit"
                    className="px-4 py-2  bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Insert
                  </Button>
                </div>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default ActionImageButton