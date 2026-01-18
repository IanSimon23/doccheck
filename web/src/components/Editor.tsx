import { useState, useEffect } from 'react';
import { Save, Check, RotateCcw } from 'lucide-react';

interface EditorProps {
  content: string;
  onChange: (content: string) => void;
  onSave: (content: string) => void;
}

function Editor({ content, onChange, onSave }: EditorProps) {
  const [localContent, setLocalContent] = useState(content);
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  const handleChange = (value: string) => {
    setLocalContent(value);
    setSaved(false);
  };

  const handleSave = () => {
    onChange(localContent);
    onSave(localContent);
    setSaved(true);
  };

  const handleReset = () => {
    setLocalContent(content);
    setSaved(true);
  };

  const hasChanges = localContent !== content;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">CLAUDE.md Editor</h2>
          <p className="text-sm text-gray-500">
            Edit your CLAUDE.md directly. Changes are saved to your project.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              hasChanges
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : saved
                ? 'bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saved && !hasChanges ? (
              <>
                <Check className="w-4 h-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center gap-2">
          <span className="text-sm font-mono text-gray-600">CLAUDE.md</span>
          {hasChanges && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
              unsaved changes
            </span>
          )}
        </div>
        <textarea
          value={localContent}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full h-[600px] p-4 font-mono text-sm resize-none focus:outline-none"
          placeholder="# CLAUDE.md - Project Context

## Project Overview

Describe your project here..."
        />
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          Tip: Use the Interview tab for guided prompts, or edit directly here for full control.
        </p>
      </div>
    </div>
  );
}

export default Editor;
