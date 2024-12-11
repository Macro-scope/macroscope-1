import { mergeAttributes, Node } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { UniversalEmbedView } from './universal-embed-view';

export interface UniversalEmbedOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    universalEmbed: {
      setUniversalEmbed: (options: { url: string }) => ReturnType;
    };
  }
}

export const UniversalEmbed = Node.create<UniversalEmbedOptions>({
  name: 'universalEmbed',
  
  group: 'block',
  
  atom: true,
  
  draggable: true,

  addOptions() {
    return {
      HTMLAttributes: {
        class: 'universal-embed',
      },
    };
  },

  addAttributes() {
    return {
      url: {
        default: null,
      },
      type: {
        default: 'website',
      },
      metadata: {
        default: {},
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-universal-embed]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { 'data-universal-embed': '' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(UniversalEmbedView);
  },

  addCommands() {
    return {
      setUniversalEmbed:
        (options) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              url: options.url,
            },
          });
        },
    };
  },
});