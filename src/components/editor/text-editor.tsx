"use client";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
} from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { Separator } from "@/components/ui/separator";
import Link from "@tiptap/extension-link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const RichTextEditor = ({
  value,
  valueMarkdown,
  onChange,
  features = ["bold", "italic", "strike", "bulletList", "orderedList", "link"],
  placeholder = "",
}: {
  value: string;
  valueMarkdown: string;
  onChange: (content: { html: string; markdown: string }) => void;
  features?: string[];
  placeholder?: string;
}) => {
  console.log("value");
  console.log(typeof valueMarkdown);
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          "min-h-[80px]  w-full  rounded-t-0 border border-input bg-transparent px-3 py-2 border-t-0 text-sm ring-offset-background  focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto rounded-bl-md rounded-br-md",
      },
      handleClick: (view, pos, event) => {
        const { state } = view;
        const link = (event.target as HTMLElement).closest("a");
        if (link) {
          event.preventDefault();
          window.open(link.href, "_blank", "noopener,noreferrer");
          return true;
        }
        return false;
      },
    },
    extensions: [
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === "heading") {
            return "Heading placeholder";
          }
          return placeholder;
        },
      }),
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: "list-decimal pl-4",
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: "list-disc pl-4",
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-600 hover:text-blue-600 cursor-pointer",
          target: "_blank",
          rel: "noopener noreferrer",
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const markdown = editor.getText();

      onChange({
        html,
        markdown,
      });
    },
  });

  return (
    <div>
      {editor ? (
        <RichTextEditorToolbar editor={editor} features={features} />
      ) : null}
      <EditorContent editor={editor} />
    </div>
  );
};

const RichTextEditorToolbar = ({
  editor,
  features,
}: {
  editor: Editor;
  features: string[];
}) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const handleLink = () => {
    let formattedUrl = linkUrl;
    if (
      linkUrl !== "" &&
      !linkUrl.startsWith("http://") &&
      !linkUrl.startsWith("https://")
    ) {
      formattedUrl = `https://${linkUrl}`;
    }

    if (linkUrl === "") {
      editor.chain().focus().unsetLink().run();
      return;
    }

    if (editor.state.selection.empty && linkText) {
      editor
        .chain()
        .focus()
        .insertContent(`<a href="${formattedUrl}">${linkText}</a>`)
        .run();
    } else {
      editor.chain().focus().setLink({ href: formattedUrl }).run();
    }

    setLinkUrl("");
    setLinkText("");
    setIsLinkDialogOpen(false);
  };

  return (
    <div className="border border-input bg-transparent rounded-tl-md rounded-tr-md p-1 flex flex-row items-center gap-1">
      {features.includes("bold") && (
        <Toggle
          size="sm"
          pressed={editor.isActive("bold")}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
      )}
      {features.includes("italic") && (
        <Toggle
          size="sm"
          pressed={editor.isActive("italic")}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
      )}
      {features.includes("strike") && (
        <Toggle
          size="sm"
          pressed={editor.isActive("strike")}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>
      )}
      {(features.includes("bulletList") ||
        features.includes("orderedList")) && (
        <Separator orientation="vertical" className="w-[1px] h-8" />
      )}
      {features.includes("bulletList") && (
        <Toggle
          size="sm"
          pressed={editor.isActive("bulletList")}
          onPressedChange={() =>
            editor.chain().focus().toggleBulletList().run()
          }
        >
          <List className="h-4 w-4" />
        </Toggle>
      )}
      {features.includes("orderedList") && (
        <Toggle
          size="sm"
          pressed={editor.isActive("orderedList")}
          onPressedChange={() =>
            editor.chain().focus().toggleOrderedList().run()
          }
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
      )}
      {features.includes("link") && (
        <Toggle
          size="sm"
          pressed={editor.isActive("link")}
          onPressedChange={() => {
            const previousUrl = editor.getAttributes("link").href;
            setLinkUrl(previousUrl || "");
            setIsLinkDialogOpen(true);
          }}
        >
          <LinkIcon className="h-4 w-4" />
        </Toggle>
      )}

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Link</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="url">URL</label>
              <Input
                id="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://app.macroscope.so"
              />
            </div>
            {editor.state.selection.empty && (
              <div className="flex flex-col gap-2">
                <label htmlFor="text">Link Text</label>
                <Input
                  id="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="Enter link text"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsLinkDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLink}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RichTextEditor;
