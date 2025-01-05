'use client';
import { useEditor, EditorContent, type Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Strikethrough,
  Italic,
  List,
  ListOrdered,
  LinkIcon,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { Separator } from '@/components/ui/separator';
import Link from '@tiptap/extension-link';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
// s
const RichTextEditor = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (content: { html: string; markdown: string }) => void;
}) => {
  const editor = useEditor({
    editorProps: {
      attributes: {
        class:
          'min-h-[50px] max-h-[100px] w-full rounded-md rounded-br-none rounded-bl-none border border-input bg-transparent px-3 py-2 border-b-0 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 overflow-auto',
      },
      handleClick: (view, pos, event) => {
        const { state } = view;
        const link = (event.target as HTMLElement).closest('a');
        if (link) {
          event.preventDefault();
          window.open(link.href, '_blank', 'noopener,noreferrer');
          return true;
        }
        return false;
      },
    },
    extensions: [
      StarterKit.configure({
        orderedList: {
          HTMLAttributes: {
            class: 'list-decimal pl-4',
          },
        },
        bulletList: {
          HTMLAttributes: {
            class: 'list-disc pl-4',
          },
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-600 cursor-pointer',
          target: '_blank',
          rel: 'noopener noreferrer',
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
    <>
      <EditorContent editor={editor} />
      {editor ? <RichTextEditorToolbar editor={editor} /> : null}
    </>
  );
};

const RichTextEditorToolbar = ({ editor }: { editor: Editor }) => {
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const handleLink = () => {
    let formattedUrl = linkUrl;
    if (
      linkUrl !== '' &&
      !linkUrl.startsWith('http://') &&
      !linkUrl.startsWith('https://')
    ) {
      formattedUrl = `https://${linkUrl}`;
    }

    if (linkUrl === '') {
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

    setLinkUrl('');
    setLinkText('');
    setIsLinkDialogOpen(false);
  };

  return (
    <div className="border border-input bg-transparent rounded-br-md rounded-bl-md p-1 flex flex-row items-center gap-1">
      <Toggle
        size="sm"
        pressed={editor.isActive('bold')}
        onPressedChange={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('italic')}
        onPressedChange={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('strike')}
        onPressedChange={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Toggle>
      <Separator orientation="vertical" className="w-[1px] h-8" />
      <Toggle
        size="sm"
        pressed={editor.isActive('bulletList')}
        onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('orderedList')}
        onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Toggle>
      <Toggle
        size="sm"
        pressed={editor.isActive('link')}
        onPressedChange={() => {
          const previousUrl = editor.getAttributes('link').href;
          setLinkUrl(previousUrl || '');
          setIsLinkDialogOpen(true);
        }}
      >
        <LinkIcon className="h-4 w-4" />
      </Toggle>

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
