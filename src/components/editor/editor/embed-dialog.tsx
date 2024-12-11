import { useState } from 'react'


import { FilePlus } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface EmbedDialogProps {
  open: boolean
  onClose: () => void
  onEmbed: (url: string) => void
}

export function EmbedDialog({ open, onClose, onEmbed }: EmbedDialogProps) {
  const [url, setUrl] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (url.trim()) {
      onEmbed(url.trim())
      setUrl('')
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-white">
        <DialogTitle className="flex items-center gap-2">
          <FilePlus className="h-5 w-5" />
          Add Embed
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Input
                id="url"
                placeholder="Paste URL here (YouTube, Twitter, etc.)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="col-span-3"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!url.trim()}>
              Embed
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}