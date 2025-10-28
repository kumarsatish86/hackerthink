import React from 'react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Delete Tool - Admin - LinuxConcept',
};

// Define tool type
interface Tool {
  id: number;
  title: string;
  slug: string;
  description: string;
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

async function deleteTool(formData: FormData) {
  'use server';
  
  const id = formData.get('id') as string;
  
  try {
    // Use relative URL to avoid CORS issues
    const response = await fetch(`/api/admin/tools/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete tool');
    }
    
    // Redirect to the tools list page after successful deletion
    redirect('/admin/content/tools');
  } catch (error) {
    console.error('Error deleting tool:', error);
    throw error;
  }
}

export default async function DeleteToolPage({ params }: { params: { id: string } }) {
  const tool = await getTool(params.id);
  
  if (!tool) {
    redirect('/admin/content/tools');
  }
  
  return (
    <div className="p-6 max-w-lg mx-auto">
      <div className="bg-white p-6 rounded-lg shadow">
        <h1 className="text-2xl font-bold text-red-600 mb-6">Delete Tool</h1>
        
        <p className="mb-6">
          Are you sure you want to delete the tool "{tool.title}"? This action cannot be undone.
        </p>
        
        <div className="flex items-center justify-between">
          <Link
            href={`/admin/content/tools/${tool.id}`}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Cancel
          </Link>
          
          <form action={deleteTool}>
            <input type="hidden" name="id" value={tool.id} />
            <button
              type="submit"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
            >
              Delete Permanently
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 