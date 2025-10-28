import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// Mock data for development - replace with actual database queries
const mockTags = [
  {
    id: '1',
    name: 'beginner',
    slug: 'beginner',
    content_type: 'articles',
    item_count: 25,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    name: 'advanced',
    slug: 'advanced',
    content_type: 'articles',
    item_count: 18,
    created_at: '2024-01-14T09:00:00Z',
    updated_at: '2024-01-14T09:00:00Z'
  },
  {
    id: '3',
    name: 'bash',
    slug: 'bash',
    content_type: 'scripts',
    item_count: 32,
    created_at: '2024-01-12T14:30:00Z',
    updated_at: '2024-01-12T14:30:00Z'
  },
  {
    id: '4',
    name: 'docker',
    slug: 'docker',
    content_type: 'courses',
    item_count: 12,
    created_at: '2024-01-10T11:15:00Z',
    updated_at: '2024-01-10T11:15:00Z'
  },
  {
    id: '5',
    name: 'ssh',
    slug: 'ssh',
    content_type: 'lab_exercises',
    item_count: 8,
    created_at: '2024-01-08T16:45:00Z',
    updated_at: '2024-01-08T16:45:00Z'
  },
  {
    id: '6',
    name: 'ubuntu',
    slug: 'ubuntu',
    content_type: 'articles',
    item_count: 22,
    created_at: '2024-01-05T12:20:00Z',
    updated_at: '2024-01-05T12:20:00Z'
  },
  {
    id: '7',
    name: 'centos',
    slug: 'centos',
    content_type: 'articles',
    item_count: 15,
    created_at: '2024-01-03T08:30:00Z',
    updated_at: '2024-01-03T08:30:00Z'
  },
  {
    id: '8',
    name: 'automation',
    slug: 'automation',
    content_type: 'tools',
    item_count: 9,
    created_at: '2024-01-02T13:45:00Z',
    updated_at: '2024-01-02T13:45:00Z'
  }
];

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get('content_type');

    // Filter by content type if specified
    let filteredTags = mockTags;
    if (contentType && contentType !== 'all') {
      filteredTags = mockTags.filter(tag => tag.content_type === contentType);
    }

    return NextResponse.json({
      tags: filteredTags,
      total: filteredTags.length
    });

  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, content_type } = body;

    // Validate required fields
    if (!name || !slug || !content_type) {
      return NextResponse.json(
        { error: 'Name, slug, and content_type are required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate the slug is unique
    // 2. Insert into database
    // 3. Return the created tag

    const newTag = {
      id: Date.now().toString(),
      name,
      slug,
      content_type,
      item_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      tag: newTag,
      message: 'Tag created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, content_type } = body;

    // Validate required fields
    if (!id || !name || !slug || !content_type) {
      return NextResponse.json(
        { error: 'ID, name, slug, and content_type are required' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate the slug is unique
    // 2. Update in database
    // 3. Return the updated tag

    const updatedTag = {
      id,
      name,
      slug,
      content_type,
      item_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json({
      tag: updatedTag,
      message: 'Tag updated successfully'
    });

  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Tag ID is required' },
        { status: 400 }
        );
    }

    // In a real implementation, you would:
    // 1. Check if the tag has items
    // 2. Delete from database
    // 3. Return success message

    return NextResponse.json({
      message: 'Tag deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

