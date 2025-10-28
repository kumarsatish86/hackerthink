'use client';

import React, { useEffect, useRef, useState } from 'react';

interface TableEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

const TableEditor: React.FC<TableEditorProps> = ({ 
  value, 
  onChange,
  height = '500px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstanceRef = useRef<any>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    if (!editorRef.current || editorLoaded) return;
    
    const loadQuillEditor = async () => {
      try {
        // Load Quill CSS
        if (!document.getElementById('quill-snow-css')) {
          const link = document.createElement('link');
          link.id = 'quill-snow-css';
          link.rel = 'stylesheet';
          link.href = 'https://cdn.quilljs.com/1.3.7/quill.snow.css';
          document.head.appendChild(link);
        }
        
        // Add custom CSS for toolbar and tables
        if (!document.getElementById('quill-custom-css')) {
          const style = document.createElement('style');
          style.id = 'quill-custom-css';
          style.textContent = `
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
              border: 1px solid #ddd;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            tr {
              display: table-row;
            }
            tbody {
              display: table-row-group;
            }
            .ql-table {
              width: auto !important;
              display: inline-block !important;
              background-color: #f0f0f0 !important;
              border: 1px solid #ccc !important;
              border-radius: 3px !important;
              padding: 3px 5px !important;
              margin-left: 5px !important;
              color: #444 !important;
              cursor: pointer !important;
              font-weight: bold !important;
              font-size: 14px !important;
            }
            .ql-table:hover {
              background-color: #e0e0e0 !important;
            }
            /* Fix for double scrollbar issue */
            .table-editor {
              position: relative;
            }
            .table-editor .ql-container {
              height: ${typeof height === 'string' ? height : '500px'} !important;
              overflow: hidden !important;
            }
            .table-editor .ql-editor {
              position: absolute;
              top: 0;
              right: 0;
              bottom: 0;
              left: 0;
              overflow-y: auto;
              height: 100% !important;
              min-height: ${typeof height === 'string' ? height : '500px'} !important;
            }
            /* Hide the default scrollbar on Quill container */
            .table-editor .ql-container::-webkit-scrollbar {
              display: none;
            }
            .ql-container.ql-snow {
              border-bottom-left-radius: 4px;
              border-bottom-right-radius: 4px;
            }
            .ql-toolbar.ql-snow {
              border-top-left-radius: 4px;
              border-top-right-radius: 4px;
            }
          `;
          document.head.appendChild(style);
        }
        
        // Load Quill
        const script = document.createElement('script');
        script.src = 'https://cdn.quilljs.com/1.3.7/quill.min.js';
        script.async = true;
        
        // Wait for Quill to load
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.body.appendChild(script);
        });
        
        // Check if Quill loaded
        if (!window.Quill) {
          throw new Error('Failed to load Quill');
        }
        
        // We need to check editorRef.current again after the async operations
        if (!editorRef.current) return;
        
        // Configure toolbar with table insertion
        const toolbarOptions = [
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ 'header': 1 }, { 'header': 2 }],
          [{ 'list': 'ordered' }, { 'list': 'bullet' }],
          [{ 'indent': '-1' }, { 'indent': '+1' }],
          [{ 'size': ['small', false, 'large', 'huge'] }],
          [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
          ['link', 'image'],
          ['clean']
        ];
        
        // Create editor
        const quill = new window.Quill(editorRef.current, {
          modules: {
            toolbar: {
              container: toolbarOptions,
              handlers: {
                'table': function() {
                  const tableHTML = `
                    <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%; margin: 15px 0px; border: 1px solid rgb(221, 221, 221);">
                      <tbody>
                        <tr>
                          <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Header 1</td>
                          <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Header 2</td>
                        </tr>
                        <tr>
                          <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 1</td>
                          <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 2</td>
                        </tr>
                        <tr>
                          <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 3</td>
                          <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 4</td>
                        </tr>
                      </tbody>
                    </table>
                  `;
                  
                  const range = quill.getSelection();
                  if (range) {
                    quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
                  } else {
                    quill.clipboard.dangerouslyPasteHTML(quill.getLength(), tableHTML);
                  }
                }
              }
            }
          },
          placeholder: 'Compose content...',
          theme: 'snow'
        });
        
        // Add TABLE button to the toolbar
        setTimeout(() => {
          if (!editorRef.current) return;
          
          const toolbar = editorRef.current.querySelector('.ql-toolbar');
          if (toolbar) {
            // Create a div container for the TABLE button
            const tableButtonContainer = document.createElement('span');
            tableButtonContainer.className = 'ql-formats';
            
            // Create the TABLE button
            const tableButton = document.createElement('button');
            tableButton.className = 'ql-table';
            tableButton.innerHTML = 'TABLE';
            tableButton.setAttribute('type', 'button');
            tableButton.setAttribute('title', 'Insert Table');
            
            // Add click event to the TABLE button
            tableButton.addEventListener('click', function() {
              quill.theme.tooltip.root.classList.add('ql-hidden');
              const tableHTML = `
                <table border="1" cellpadding="5" style="border-collapse: collapse; width: 100%; margin: 15px 0px; border: 1px solid rgb(221, 221, 221);">
                  <tbody>
                    <tr>
                      <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Header 1</td>
                      <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Header 2</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 1</td>
                      <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 2</td>
                    </tr>
                    <tr>
                      <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 3</td>
                      <td style="border: 1px solid rgb(221, 221, 221); padding: 8px; text-align: left;">Cell 4</td>
                    </tr>
                  </tbody>
                </table>
              `;
              
              const range = quill.getSelection();
              if (range) {
                quill.clipboard.dangerouslyPasteHTML(range.index, tableHTML);
              } else {
                quill.clipboard.dangerouslyPasteHTML(quill.getLength(), tableHTML);
              }
            });
            
            // Add the button to the container
            tableButtonContainer.appendChild(tableButton);
            
            // Add the container to the toolbar
            toolbar.appendChild(tableButtonContainer);
          }
        }, 100);
        
        // Store Quill instance
        quillInstanceRef.current = quill;
        
        // Set initial content
        quill.clipboard.dangerouslyPasteHTML(value);
        
        // Handle content changes
        quill.on('text-change', function() {
          const html = quill.root.innerHTML;
          onChange(html);
        });
        
        setEditorLoaded(true);
        console.log('TableEditor loaded successfully');
        
        // Additional step to fix scrollbar issue
        setTimeout(() => {
          if (editorRef.current) {
            const container = editorRef.current.querySelector('.ql-container');
            if (container) {
              (container as HTMLElement).style.overflowY = 'hidden';
            }
          }
        }, 200);
        
      } catch (error) {
        console.error('Error initializing TableEditor:', error);
        
        // Fallback to a textarea if Quill fails to load
        if (editorRef.current) {
          editorRef.current.innerHTML = '';
          
          const textarea = document.createElement('textarea');
          textarea.value = value;
          textarea.style.width = '100%';
          textarea.style.minHeight = height;
          textarea.style.padding = '10px';
          textarea.style.border = '1px solid #ccc';
          textarea.style.borderRadius = '4px';
          
          textarea.addEventListener('input', (e) => {
            onChange((e.target as HTMLTextAreaElement).value);
          });
          
          editorRef.current.appendChild(textarea);
        }
      }
    };
    
    loadQuillEditor();
    
    // Cleanup function
    return () => {
      if (quillInstanceRef.current) {
        try {
          quillInstanceRef.current.off('text-change');
        } catch (e) {
          console.error('Error cleaning up Quill:', e);
        }
      }
    };
  }, [editorLoaded, value, height]); 
  
  // Update content when value changes
  useEffect(() => {
    if (quillInstanceRef.current && editorLoaded && value) {
      const currentContent = quillInstanceRef.current.root.innerHTML;
      if (value !== currentContent) {
        quillInstanceRef.current.clipboard.dangerouslyPasteHTML(value);
      }
    }
  }, [value, editorLoaded]);
  
  return (
    <div className="table-editor" style={{ height: `calc(${height} + 42px)` }}>
      <div ref={editorRef} style={{ height: '100%' }}></div>
    </div>
  );
};

// Add types for global objects
declare global {
  interface Window {
    Quill: any;
  }
}

export default TableEditor; 