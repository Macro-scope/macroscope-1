'use client';

import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { Plate } from '@udecode/plate-common/react';

import { useCreateEditor } from '@/components/editor/use-create-editor';
import { SettingsDialog } from '@/components/editor/settings';
import { Editor, EditorContainer } from '@/components/plate-ui/editor';
import { Button } from '../ui/button';
import { serializeHtml } from '@udecode/plate-common';
interface PlateEditorProps {
  initialValue?: any;
}
export function PlateEditor({ initialValue }: PlateEditorProps) {
  const editor = useCreateEditor({
    initialValue,
  });
  const handleSave = () => {
    console.log('editor', editor);
    if (!editor) return;
    // const html = editor.children
    //   .map((node) => editor.serialize(node))
    //   .join('\n');
    // const html = editor.getHtml();
    // const html = serializeHtml(editor, {
    //   nodes: editor.children,
    //   // You can add custom serialization options here
    // });
    // console.log('html', html);
    // const html = editor?.html?.(); // Get HTML content
    // const markdown = htmlToMarkdown(html); // Convert HTML to markdown
    // onSave({ html, markdown });
  };
  return (
    <div className="flex flex-col h-full">
      <DndProvider backend={HTML5Backend}>
        <Plate editor={editor}>
          <EditorContainer>
            <Editor variant="demo" />
          </EditorContainer>

          <SettingsDialog />
        </Plate>
      </DndProvider>
      <Button onClick={handleSave}>Save</Button>
    </div>
  );
}
