'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import TipTapEditor from './TipTapEditor';
import { toast, Toaster } from 'react-hot-toast';

// Make sure this CSS import is available


interface TermContentEditorProps {
  termId: string;
  initialDefinition: string;
  initialUsageExamples: string;
  onSave?: (updatedTerm: { definition: string; usage_examples: string }) => void;
}

const TermContentEditor: React.FC<TermContentEditorProps> = ({
  termId,
  initialDefinition,
  initialUsageExamples,
  onSave,
}) => {
  const { data: session, status } = useSession();
  const [definition, setDefinition] = useState(initialDefinition);
  const [usageExamples, setUsageExamples] = useState(initialUsageExamples);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize with props values
  useEffect(() => {
    setDefinition(initialDefinition);
    setUsageExamples(initialUsageExamples);
  }, [initialDefinition, initialUsageExamples]);

  // Quill modules configuration - matches the article editor from the screenshot
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }], // Normal, H1, H2, H3
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }], // Text and background color
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }], // Subscript and superscript
      [{ 'indent': '-1' }, { 'indent': '+1' }], // Indentation
      [{ 'align': [] }], // Text alignment
      ['link', 'image', 'code-block'],
      ['blockquote', 'code'],
      ['clean'] // Remove formatting
    ],
  };

  const handleSave = async () => {
    if (!session) {
      toast.error("You must be logged in to save changes");
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/terms/${termId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          definition: definition,
          usage_examples: usageExamples,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to save term');
      }

      const data = await response.json();
      
      // Call the onSave callback if provided
      if (onSave) {
        onSave({
          definition: definition,
          usage_examples: usageExamples,
        });
      }

      setIsEditing(false);
      toast.success('Changes saved successfully');
    } catch (err) {
      console.error('Error saving term:', err);
      setError(err instanceof Error ? err.message : 'Failed to save changes');
      toast.error('Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset to original values
    setDefinition(initialDefinition);
    setUsageExamples(initialUsageExamples);
    setIsEditing(false);
    setError(null);
  };

  // Show login prompt if not logged in
  if (status === 'loading') {
    return <div className="animate-pulse bg-gray-100 p-4 rounded-md">Loading editor...</div>;
  }

  if (!session) {
    return (
      <div className="bg-yellow-50 border border-yellow-100 rounded-md p-4 mb-6">
        <p className="text-yellow-700 text-sm">
          You need to be logged in to edit content. 
          <a href="/api/auth/signin" className="ml-2 text-blue-600 hover:text-blue-800 underline">
            Sign in
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-8">
      <Toaster position="bottom-right" />
      
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-800">Term Content Editor</h2>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Edit Content
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 p-4 border-b border-red-100">
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <div className="p-6 space-y-6">
        {isEditing ? (
          <>
            <div>
              <label htmlFor="definition" className="block text-sm font-medium text-gray-700 mb-2">
                Definition
              </label>
              <div className="mb-4">
                <TipTapEditor
                  theme="snow"
                  value={definition}
                  onChange={setDefinition}
                  modules={quillModules}
                  placeholder="Write the term definition here..."
                  style={{ minHeight: '200px' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="usageExamples" className="block text-sm font-medium text-gray-700 mb-2">
                Usage Examples
              </label>
              <div>
                <TipTapEditor
                  theme="snow"
                  value={usageExamples}
                  onChange={setUsageExamples}
                  modules={quillModules}
                  placeholder="Add usage examples here..."
                  style={{ minHeight: '200px' }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Usage examples can be formatted with numbered items or HTML.
              </p>
            </div>
          </>
        ) : (
          <div className="space-y-6">
            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">Definition</h3>
              <div className="prose prose-blue max-w-none border border-gray-100 rounded-md p-4 bg-gray-50">
                <div dangerouslySetInnerHTML={{ __html: definition }} />
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-800 mb-2">Usage Examples</h3>
              <div className="prose prose-blue max-w-none border border-gray-100 rounded-md p-4 bg-gray-50">
                {usageExamples ? (
                  <div dangerouslySetInnerHTML={{ __html: usageExamples }} />
                ) : (
                  <p className="text-gray-500 italic">No usage examples available.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermContentEditor; 
