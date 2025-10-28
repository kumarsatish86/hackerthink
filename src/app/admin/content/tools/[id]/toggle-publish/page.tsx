import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Toggle Publish Status - Admin - LinuxConcept',
};

// Define tool type
interface Tool {
  id: number;
  title: string;
  published: boolean;
}

async function getTool(id: string): Promise<Tool | null> {
  try {
    // Use relative URL to avoid CORS issues
    const res = await fetch(`/api/admin/tools/${id}`, { 
      cache: 'no-store'
    });
    
    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch tool: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.tool;
  } catch (error) {
    console.error(`Error fetching tool with ID ${id}:`, error);
    return null;
  }
}

async function togglePublishStatus(formData: FormData) {
  'use server';
  
  const id = formData.get('id') as string;
  const currentStatus = formData.get('current_status') === 'true';
  
  try {
    // Use relative URL to avoid CORS issues
    const response = await fetch(`/api/admin/tools/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        published: !currentStatus
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update tool status');
    }
    
    // Redirect to the tools list page after successful update
    redirect('/admin/content/tools');
  } catch (error) {
    console.error('Error updating tool status:', error);
    throw error;
  }
}

export default async function TogglePublishPage({ params }: { params: { id: string } }) {
  const tool = await getTool(params.id);
  
  if (!tool) {
    redirect('/admin/content/tools');
  }
  
  const action = tool.published ? 'Unpublish' : 'Publish';
  
  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className={tool.published ? "text-2xl font-bold text-yellow-600 mb-6" : "text-2xl font-bold text-green-600 mb-6"}>
          {action} Tool
        </h1>
        
        <p className="mb-6">
          Are you sure you want to {action.toLowerCase()} the tool "{tool.title}"?
        </p>
        
        <div className="flex items-center justify-between">
          <Link
            href="/admin/content/tools"
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </Link>
          
          <form action={togglePublishStatus}>
            <input type="hidden" name="id" value={tool.id} />
            <input type="hidden" name="current_status" value={tool.published.toString()} />
            <button
              type="submit"
              className={tool.published 
                ? "bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded"
                : "bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              }
            >
              {action}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 