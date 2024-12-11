// @ts-nocheck
"use client"

import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import Link from "@tiptap/extension-link";
// import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import Youtube from "@tiptap/extension-youtube";
import { useState, useRef, useEffect } from "react";
import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { useImperativeHandle, forwardRef } from "react";
import type { Editor, Range } from "@tiptap/core";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import Underline from '@tiptap/extension-underline'

import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table2,
  ImageOff,
  Link2Off,
  FilePlus,
 
  MinusIcon,
  TrashIcon,
  PlusIcon,
  UnderlineIcon,
} from "lucide-react";

// Add this custom extension for iframe embeds

import { UniversalEmbed } from "./universal-embed";

import { Image } from './editor/image/image'

import { createRoot } from 'react-dom/client'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { supabase } from "@/lib/supabaseClient";
import ActionImageButton from "./editor/image/action-button";




const Iframe = Extension.create({
  name: "iframe",
  addOptions() {
    return {
      allowFullscreen: true,
      HTMLAttributes: {
        class: "w-full aspect-video rounded-lg my-4",
      },
    };
  },
  group: "block",
  atom: true,
  selectable: true,
  draggable: true,
  addAttributes() {
    return {
      src: {
        default: null,
      },
      frameborder: {
        default: "0",
      },
      allowfullscreen: {
        default: this.options.allowFullscreen,
        parseHTML: () => this.options.allowFullscreen,
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: "iframe",
      },
    ];
  },
  renderHTML({ HTMLAttributes  }) {
    return ["iframe", HTMLAttributes];
  },
});

interface TiptapEditorProps {
  initialContent: string;
  onSave: (content: { html: string; markdown: string }) => void;
  onCancel: () => void;
}

interface CommandItem {
  title: string;
  icon?: string;
  command: (props: { editor: Editor; range: Range }) => void;
}

interface SlashCommandListProps {
  items: CommandItem[];
  command: (item: CommandItem) => void;
}

interface SlashCommandListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const SlashCommandList = forwardRef<SlashCommandListRef, SlashCommandListProps>(
  (props, ref) => {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const commandListRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const commandItem = commandListRef.current?.children[
        selectedIndex
      ] as HTMLElement;
      if (commandItem) {
        commandItem.scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
    }, [selectedIndex]);

    useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }) => {
        if (event.key === "ArrowUp") {
          setSelectedIndex(
            (selectedIndex + props.items.length - 1) % props.items.length
          );
          return true;
        }
        if (event.key === "ArrowDown") {
          setSelectedIndex((selectedIndex + 1) % props.items.length);
          return true;
        }
        if (event.key === "Enter") {
          props.command(props.items[selectedIndex]);
          return true;
        }
        return false;
      },
    }));

    return (
      <div
        ref={commandListRef}
        className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 overflow-y-auto max-h-[300px] min-w-[200px] z-50"
        style={{ maxHeight: "300px" }}
      >
        {props.items.map((item, index) => (
          <button
            key={index}
            className={`flex items-center w-full px-3 py-2 text-sm rounded-md transition-colors ${
              index === selectedIndex
                ? "bg-gray-100 text-gray-900"
                : "text-gray-700 hover:bg-gray-50"
            }`}
            onClick={() => props.command(item)}
          >
            {item.icon && <span className="mr-2 text-lg">{item.icon}</span>}
            <span>{item.title}</span>
          </button>
        ))}
      </div>
    );
  }
);

SlashCommandList.displayName = "SlashCommandList";

const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: Editor;
          range: Range;
          props: any;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
        items: ({ query }: { query: string }) => {
          const commands: CommandItem[] = [
            {
              title: "Heading 1",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHeading({ level: 1 })
                  .run();
              },
            },
            {
              title: "Heading 2",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHeading({ level: 2 })
                  .run();
              },
            },

            {
              title: "Heading 3",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .setHeading({ level: 3 })
                  .run();
              },
            },

            {
              title: "Bullet List",

              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleBulletList()
                  .run();
              },
            },
            {
              title: "Numbered List",

              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleOrderedList()
                  .run();
              },
            },
            {
              title: "Quote",

              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .toggleBlockquote()
                  .run();
              },
            },

            {
              title: "Table",
              command: ({ editor, range }) => {
                editor
                  .chain()
                  .focus()
                  .deleteRange(range)
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run();
              },
            },
            {
              title: "Embed",
              command: ({ editor, range }) => {
                const embedDialog = document.createElement('div');
                document.body.appendChild(embedDialog);

                const cleanup = () => {
                  document.body.removeChild(embedDialog);
                };

                const root = createRoot(embedDialog);
                root.render(
                  <EmbedDialog
                    open={true}
                    onClose={() => {
                      cleanup();
                      root.unmount();
                    }}
                    onSubmit={(url) => {
                      editor
                        .chain()
                        .focus()
                        .deleteRange(range)
                        .setUniversalEmbed({ url })
                        .run();
                      cleanup();
                      root.unmount();
                    }}
                  />
                );
              },
            },
          ];
          return commands.filter((item) =>
            item.title.toLowerCase().includes(query.toLowerCase())
          );
        },
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: any[] | null = null;

          return {
            onStart: (props: any) => {
              component = new ReactRenderer(SlashCommandList, {
                props,
                editor: props.editor,
              });

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                arrow: false,
                offset: [0, 10],
                maxWidth: "400px",
                zIndex: 9999,
                onHide() {
                  component?.destroy();
                },

                popperOptions: {
                  strategy: "fixed",
                  modifiers: [
                    {
                      name: "flip",
                      options: {
                        fallbackPlacements: ["top-start", "bottom-start"],
                      },
                    },
                  ],
                },
              });
            },

            onUpdate(props: any) {
              component?.updateProps(props);

              popup?.[0].setProps({
                getReferenceClientRect: props.clientRect,
              });
            },

            onKeyDown(props: any) {
              if (props.event.key === "Escape") {
                popup?.[0].hide();
                return true;
              }
              return component?.ref?.onKeyDown(props);
            },

            onExit() {
              popup?.[0].destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});

const EmbedDialog = ({ open, onClose, onSubmit }: {
  open: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(url);
    setUrl('');
    onClose();
  };

  return (
    <Dialog open={open}  onOpenChange={onClose}>
      <DialogContent className="bg-white p-6 rounded-lg shadow-lg z-[999]">
        <DialogHeader>
          <DialogTitle>Add Embed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter URL to embed..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Embed
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const TableControls = ({ editor }: { editor: Editor }) => {
  const [hoveredCell, setHoveredCell] = useState({ row: 0, col: 0 });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          size="sm" 
          variant={editor.isActive("table") ? "default" : "ghost"} 
          className="h-8 w-8 p-0"
        >
          <Table2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] bg-white p-3 rounded-lg shadow-lg" align="start">
        {!editor.isActive("table") ? (
          // Table creation grid
          <div>
            <div className="text-sm font-medium mb-2">Insert Table</div>
            <div 
              className="grid gap-1 p-2 border rounded-md"
              style={{ 
                gridTemplateColumns: `repeat(8, 1fr)`,
                background: '#f4f4f5' // Light gray background
              }}
            >
              {Array.from({ length: 8 * 8 }, (_, i) => {
                const row = Math.floor(i / 8);
                const col = i % 8;
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 border rounded-sm transition-colors`}
                    style={{
                      background: row <= hoveredCell.row && col <= hoveredCell.col
                        ? '#2563eb' // Blue for selected cells
                        : '#ffffff', // White for unselected cells
                      borderColor: row <= hoveredCell.row && col <= hoveredCell.col
                        ? '#2563eb' // Blue border for selected cells
                        : '#e4e4e7', // Gray border for unselected cells
                    }}
                    onMouseEnter={() => setHoveredCell({ row, col })}
                    onClick={() => {
                      editor
                        .chain()
                        .focus()
                        .insertTable({ 
                          rows: hoveredCell.row + 1, 
                          cols: hoveredCell.col + 1, 
                          withHeaderRow: true 
                        })
                        .run();
                    }}
                  />
                );
              })}
            </div>
            <div className="text-sm text-gray-500 mt-1">
              {hoveredCell.row + 1} x {hoveredCell.col + 1} table
            </div>
          </div>
        ) : (
          // Table editing controls
          <div className="flex flex-col gap-2">
            <div className="text-sm">Table Controls</div>
            <div className="flex flex-col gap-1">
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => editor.chain().focus().addColumnBefore().run()}
                >
                  Insert Column Before
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => editor.chain().focus().addColumnAfter().run()}
                >
                  Insert Column After
                </Button>
              </div>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => editor.chain().focus().addRowBefore().run()}
                >
                  Insert Row Before
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => editor.chain().focus().addRowAfter().run()}
                >
                  Insert Row After
                </Button>
              </div>
              {/* <Separator className="my-1" /> */}
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => editor.chain().focus().deleteColumn().run()}
                >
                  Delete Column
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => editor.chain().focus().deleteRow().run()}
                >
                  Delete Row
                </Button>
              </div>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => editor.chain().focus().deleteTable().run()}
              >
                Delete Table
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};

export const TiptapEditor = ({
  initialContent,
  onSave,
  onCancel,
}: TiptapEditorProps) => {
  const [showImageDialog, setShowImageDialog] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 hover:text-blue-600 underline",
        },
      }),
      // ... existing extensions
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: "border-collapse table-auto w-full",
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2",
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: "border border-gray-300 p-2 bg-gray-100",
        },
      }),
      // Image.configure({
      //   HTMLAttributes: {
      //     class: "max-w-full rounded-lg",
      //   },
      // }),

      Image.configure({
        // Configure image upload handler
        upload: async (file: File) => {
          try {
            // Example using Supabase storage
            const { data, error } = await supabase.storage
              .from('images')
              .upload(`public/${file.name}`, file)

            if (error) throw error
            
            // Get public URL
            const { data: { publicUrl } } = supabase.storage
              .from('images')
              .getPublicUrl(`public/${file.name}`)

            return publicUrl
          } catch (error) {
            console.error('Error uploading image:', error)
            throw error
          }
        },
        // Configure accepted mime types
        acceptMimes: ['image/jpeg', 'image/png', 'image/gif'],
        // Configure max file size (5MB)
        maxSize: 5 * 1024 * 1024,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: "w-full aspect-video rounded-lg",
        },
      }),
      Iframe,
      UniversalEmbed.configure({
        HTMLAttributes: {
          class: 'universal-embed',
        },
      }),
      SlashCommand,Underline
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[200px] px-4",
      },
    },
  });

  const insertTable = () => {
    const rows = 3;
    const cols = 3;
    const withHeaderRow = true;

    editor?.chain().focus().insertTable({ rows, cols, withHeaderRow }).run();
  };

  const addTableColumn = () => {
    editor?.chain().focus().addColumnAfter().run();
  };

  const deleteTableColumn = () => {
    editor?.chain().focus().deleteColumn().run();
  };

  const addTableRow = () => {
    editor?.chain().focus().addRowAfter().run();
  };

  const deleteTableRow = () => {
    editor?.chain().focus().deleteRow().run();
  };

  const deleteTable = () => {
    editor?.chain().focus().deleteTable().run();
  };

  const addLink = () => {
    const url = window.prompt("URL");
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addEmbed = () => {
    const embedDialog = document.createElement('div');
    document.body.appendChild(embedDialog);

    const cleanup = () => {
      document.body.removeChild(embedDialog);
    };

    const root = createRoot(embedDialog);
    root.render(
      <EmbedDialog
        open={true}
        onClose={() => {
          cleanup();
          root.unmount();
        }}
        onSubmit={(url) => {
          editor?.commands.setUniversalEmbed({ url });
          cleanup();
          root.unmount();
        }}
      />
    );
  };

  const deleteImage = () => {
    editor?.chain().focus().deleteSelection().run();
  };

  const removeLink = () => {
    editor?.chain().focus().unsetLink().run();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border rounded-lg overflow-hidden bg-white shadow-sm flex flex-col h-full">
        {editor && (
          <>
            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              shouldShow={({ editor, view, state, oldState, from, to }) => {
                return editor.isActive("image");
              }}
              className="flex gap-1 p-1 bg-white border rounded-lg shadow-lg"
            >
              <Button
                size="sm"
                variant="outline"
                onClick={deleteImage}
                className="h-8 px-2"
              >
                <ImageOff className="h-4 w-4" />
              </Button>
            </BubbleMenu>

            <BubbleMenu
              editor={editor}
              tippyOptions={{ duration: 100 }}
              shouldShow={({ editor, view, state, oldState, from, to }) => {
                return !editor.isActive("image") && !state.selection.empty;
              }}
              className="flex gap-1 p-1 bg-white border rounded-lg shadow-lg"
            >
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive("bold") ? "bg-muted" : ""}
              >
                <Bold className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive("italic") ? "bg-muted" : ""}
              >
                <Italic className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={addLink}
                className={editor.isActive("link") ? "bg-muted" : ""}
              >
                <LinkIcon className="h-4 w-4" />
              </Button>
              {editor.isActive("link") && (
                <Button size="sm" variant="outline" onClick={removeLink}>
                  <Link2Off className="h-4 w-4" />
                </Button>
              )}
            </BubbleMenu>

            {/* Toolbar - fixed at top */}
            <div className="border-b bg-white p-2 flex  items-center gap-1 sticky top-0 z-10">
              {/* Row 1 */}
              <div className="flex items-center gap-1">
                {/* History */}
                <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().undo().run()} className="h-8 w-8 p-0">
                  <Undo className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => editor.chain().focus().redo().run()} className="h-8 w-8 p-0">
                  <Redo className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-gray-200 mx-1" /> {/* Divider */}

                {/* Text style dropdown */}
                <select 
                  className="h-8 px-2 border rounded-md text-sm"
                  value={editor.isActive('heading', { level: 1 }) 
                    ? 'heading-1' 
                    : editor.isActive('heading', { level: 2 }) 
                    ? 'heading-2' 
                    : 'paragraph'}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === 'heading-1') {
                      editor.chain().focus().toggleHeading({ level: 1 }).run();
                    } else if (value === 'heading-2') {
                      editor.chain().focus().toggleHeading({ level: 2 }).run();
                    } else {
                      editor.chain().focus().setParagraph().run();
                    }
                  }}
                >
                  <option value="paragraph">Paragraph</option>
                  <option value="heading-1">Heading 1</option>
                  <option value="heading-2">Heading 2</option>
                </select>

                <div className="w-px h-4 bg-gray-200 mx-1" /> {/* Divider */}

                {/* Text formatting */}
                <Button size="sm" variant={editor.isActive("bold") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBold().run()} className="h-8 w-8 p-0">
                  <Bold className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={editor.isActive("italic") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleItalic().run()} className="h-8 w-8 p-0">
                  <Italic className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={editor.isActive("underline") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleUnderline().run()} className="h-8 w-8 p-0">
    <UnderlineIcon className="h-4 w-4" />
  </Button>
                <Button size="sm" variant={editor.isActive("strike") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleStrike().run()} className="h-8 w-8 p-0">
                  <Strikethrough className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={editor.isActive("code") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleCode().run()} className="h-8 w-8 p-0">
                  <Code className="h-4 w-4" />
                </Button>
                <Button 
    size="sm" 
    variant={editor.isActive("blockquote") ? "default" : "ghost"} 
    onClick={() => editor.chain().focus().toggleBlockquote().run()} 
    className="h-8 w-8 p-0"
  >
    <Quote className="h-4 w-4" />
  </Button>
              </div>

              {/* Row 2 */}
              <div className="flex items-center gap-1 w-full">
                {/* Lists */}
                <Button size="sm" variant={editor.isActive("bulletList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleBulletList().run()} className="h-8 w-8 p-0">
                  <List className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={editor.isActive("orderedList") ? "default" : "ghost"} onClick={() => editor.chain().focus().toggleOrderedList().run()} className="h-8 w-8 p-0">
                  <ListOrdered className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-gray-200 mx-1" /> {/* Divider */}

                {/* Alignment */}
                <Button size="sm" variant={editor.isActive({ textAlign: "left" }) ? "default" : "ghost"} onClick={() => editor.chain().focus().setTextAlign("left").run()} className="h-8 w-8 p-0">
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={editor.isActive({ textAlign: "center" }) ? "default" : "ghost"} onClick={() => editor.chain().focus().setTextAlign("center").run()} className="h-8 w-8 p-0">
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={editor.isActive({ textAlign: "right" }) ? "default" : "ghost"} onClick={() => editor.chain().focus().setTextAlign("right").run()} className="h-8 w-8 p-0">
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button size="sm" variant={editor.isActive({ textAlign: "justify" }) ? "default" : "ghost"} onClick={() => editor.chain().focus().setTextAlign("justify").run()} className="h-8 w-8 p-0">
                  <AlignJustify className="h-4 w-4" />
                </Button>

                <div className="w-px h-4 bg-gray-200 mx-1" /> {/* Divider */}

                {/* Links and Media */}
                <Button size="sm" variant={editor.isActive("link") ? "default" : "ghost"} onClick={addLink} className="h-8 w-8 p-0">
                  <LinkIcon className="h-4 w-4" />
                </Button>
                <ActionImageButton editor={editor} icon={<ImageIcon className="h-4 w-4 bg-white text-black" />} tooltip="Insert image" />
                <Button size="sm" variant="ghost" onClick={addEmbed} className="h-8 w-8 p-0">
  <FilePlus className="h-4 w-4" />
</Button>
                <div className="w-px h-4 bg-gray-200 mx-1" /> {/* Divider */}

                {/* Table */}
                {/* <TableControls editor={editor} /> */}
              </div>
            </div>

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <EditorContent editor={editor} />
              </div>
            </div>

            {/* Footer - fixed at bottom */}
            <div className="flex justify-end gap-2 p-4 border-t bg-gray-50 sticky bottom-0">
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (editor) {
                    onSave({
                      html: editor.getHTML(),
                      markdown: editor.getText(),
                    });
                  }
                }}
              >
                Save
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
