/* eslint-disable no-console */
// @ts-nocheck
import React, { useRef, useState } from 'react'

import ReactCrop, {
  type Crop,
  type PixelCrop,
} from 'react-image-crop'




import { dataURLtoFile, readImageAsBase64 } from './libs/file'

import 'react-image-crop/dist/ReactCrop.css'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogTitle, DialogTrigger } from '@/components/ui/dialog'


export function ImageCropper({ editor, imageInline, onClose }: any) {

  const [dialogOpen, setDialogOpen] = useState(false)

  const imgRef = React.useRef<HTMLImageElement | null>(null)

  const [crop, setCrop] = React.useState<Crop>()
  const [croppedImageUrl, setCroppedImageUrl] = React.useState<string>('')
  const fileInput = useRef<HTMLInputElement>(null)
  const [urlUpload, setUrlUpload] = useState<any>({
    src: '',
    file: null,
  })

  function onCropComplete(crop: PixelCrop) {
    if (imgRef.current && crop.width && crop.height) {
      const croppedImageUrl = getCroppedImg(imgRef.current, crop)
      setCroppedImageUrl(croppedImageUrl)
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: PixelCrop): string {
    const canvas = document.createElement('canvas')
    const scaleX = image.naturalWidth / image.width
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width * scaleX
    canvas.height = crop.height * scaleY

    const ctx = canvas.getContext('2d')

    if (ctx) {
      ctx.imageSmoothingEnabled = false

      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
      )
    }

    return canvas.toDataURL('image/png', 1.0)
  }

  async function onCrop() {
    try {
      const fileCrop = await dataURLtoFile(croppedImageUrl, urlUpload?.file?.name || 'image.png')

      const uploadOptions = editor.extensionManager.extensions.find(
        (extension: any) => extension.name === 'image',
      )?.options

      let src = ''
      if (uploadOptions.upload) {
        src = await uploadOptions.upload(fileCrop)
      }
      else {
        src = URL.createObjectURL(fileCrop)
      }

      editor.chain().focus().setImageInline({ src, inline: imageInline }).run()

      setDialogOpen(false)

      setUrlUpload({
        src: '',
        file: null,
      })
      onClose()
    }
    catch (error) {
      console.log('Error cropping image', error)
    }
  }

  function handleClick(e: any) {
    e.preventDefault()
    fileInput.current?.click()
  }

  const handleFile = async (event: any) => {
    const files = event?.target?.files
    if (!editor || editor.isDestroyed || files.length === 0) {
      return
    }
    const file = files[0]

    const base64 = await readImageAsBase64(file)

    setDialogOpen(true)
    setUrlUpload({
      src: base64.src,
      file,
    })
  }

  return (
    <>
      <Button 
        className="px-4 py-2 text-black bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        onClick={handleClick}
      >
        Crop Image
      </Button>

      <Dialog open={dialogOpen}>
        <DialogTrigger />

        <DialogContent className="bg-white p-6 rounded-lg shadow-lg">
          <DialogTitle className="text-lg font-semibold text-gray-900 mb-4">
            Crop Image
          </DialogTitle>

          <div className="border rounded-lg overflow-hidden">
            {urlUpload.src && (
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                onComplete={c => onCropComplete(c)}
                className="w-full"
              >
                <img
                  ref={imgRef}
                  alt="Crop me"
                  src={urlUpload.src}
                />
              </ReactCrop>
            )}
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-4">
            <Button
              className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => {
                setDialogOpen(false)
                setUrlUpload({
                  src: '',
                  file: null,
                })
              }}
            >
              Cancel
            </Button>
            <Button 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={onCrop}
            >
              Crop
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <input
        type="file"
        accept="image/*"
        ref={fileInput}
        multiple
        className="hidden"
        onChange={handleFile}
      />
    </>
  )
}