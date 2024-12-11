// @ts-nocheck

import { NodeViewProps, NodeViewWrapper } from '@tiptap/react'
import { useState, useRef } from 'react'

export const ResizableImage = (props: any) => {
  const [isResizing, setIsResizing] = useState(false)
  const imageRef = useRef<HTMLImageElement>(null)

  const handleMouseDown = (event: React.MouseEvent) => {
    event.preventDefault()
    setIsResizing(true)

    const startX = event.clientX
    const startWidth = imageRef.current?.width || 0

    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && imageRef.current) {
        const diff = e.clientX - startX
        const newWidth = startWidth + diff
        props.updateAttributes({ width: newWidth })
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <NodeViewWrapper as="span" className="relative inline-block">
      <img
        ref={imageRef}
        src={props.node.attrs.src}
        width={props.node.attrs.width}
        className="max-w-full rounded-lg"
      />
      <div
        className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize opacity-0 hover:opacity-100 bg-blue-500"
        onMouseDown={handleMouseDown}
      />
    </NodeViewWrapper>
  )
}