'use client'
import { NodeViewWrapper } from '@tiptap/react';
import { useEffect, useState } from 'react';

import { X } from 'lucide-react';
import { getMetadata } from '../../hooks/metadata';
import { Button } from '../ui/button';

interface Metadata {
  type: string;
  url: string;
  title?: string;
  description?: string;
  thumbnail?: string;
  embedUrl?: string;
}

export function UniversalEmbedView({ node, deleteNode }: any) {
  const [metadata, setMetadata] = useState<Metadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
      {renderEmbed()}
    </NodeViewWrapper>
  );
}