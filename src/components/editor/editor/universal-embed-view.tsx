// @ts-nocheck
import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useState, useRef } from 'react';

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMetadata } from '@/hooks/metadata';


interface Metadata {
  type: string;
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  embedUrl?: string;
}

export function UniversalEmbedView({ node, updateAttributes, deleteNode }: any) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isResizing, setIsResizing] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setLoading(true);
        const data = await getMetadata(node.attrs.url);
        setMetadata(data);
      } catch (err) {
        setError('Failed to load embed preview');
      } finally {
        setLoading(false);
      }
    };

    fetchMetadata();
  }, [node.attrs.url]);

  const handleMouseDown = (e: React.MouseDown) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = embedRef.current?.offsetWidth || 0;
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return;

    const diff = e.clientX - startXRef.current;
    const newWidth = Math.max(200, startWidthRef.current + diff);
    const parentWidth = embedRef.current?.parentElement?.offsetWidth || 0;
    const widthPercentage = `${Math.min(100, (newWidth / parentWidth) * 100)}%`;
    
    updateAttributes({ width: widthPercentage });
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const renderEmbed = () => {
    if (loading) {
      return <div className="animate-pulse h-32 bg-gray-100 rounded-lg" />;
    }

    if (error) {
      return <div className="text-red-500">{error}</div>;
    }

    if (!metadata) {
      return null;
    }

    switch (metadata.type) {
      case 'youtube':
      case 'vimeo':
        return (
          <iframe
            src={metadata.embedUrl || metadata.url}
            className="w-full aspect-video rounded-lg"
            allowFullScreen
          />
        );

      case 'twitter':
        return (
          <iframe
            src={metadata.embedUrl}
            className="w-full min-h-[300px] rounded-lg"
            allowFullScreen
          />
        );

      case 'github':
        return (
          <div className="border rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              {metadata.thumbnail && (
                <img 
                  src={metadata.thumbnail} 
                  alt="Repository owner" 
                  className="w-10 h-10 rounded-full"
                />
              )}
              <h3 className="font-bold text-lg">{metadata.title}</h3>
            </div>
            {metadata.description && (
              <p className="text-sm text-gray-600 mb-2">{metadata.description}</p>
            )}
            <a 
              href={metadata.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 text-sm inline-flex items-center gap-1"
            >
              View Repository
            </a>
          </div>
        );
      
      default:
        return (
          <div className="border rounded-lg p-4">
            {metadata.thumbnail && (
              <img 
                src={metadata.thumbnail} 
                alt={metadata.title} 
                className="w-full h-48 object-cover rounded-lg mb-2"
              />
            )}
            <h3 className="font-bold">{metadata.title}</h3>
            {metadata.description && (
              <p className="text-sm text-gray-600 mb-2">{metadata.description}</p>
            )}
            <a 
              href={metadata.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 text-sm"
            >
              Visit Website
            </a>
          </div>
        );
    }
  };

  return (
    <NodeViewWrapper className="relative group">
      <div 
        ref={embedRef}
        style={{ width: node.attrs.width }}
        className="relative"
      >
        {renderEmbed()}
        
        {/* Resize handles */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize opacity-0 group-hover:opacity-100 bg-blue-500/20"
          onMouseDown={handleMouseDown}
        />
        
        {/* Delete button */}
        <div className="absolute -top-4 right-0 hidden group-hover:block">
          <Button
            variant="outline"
            size="sm"
            onClick={deleteNode}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </NodeViewWrapper>
  );
}