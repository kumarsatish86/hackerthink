// Roadmap service for frontend

// Get all roadmaps (admin)
async function getAllRoadmaps(publishedOnly = false) {
  try {
    const url = `/api/admin/roadmaps${publishedOnly ? '?published=true' : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch roadmaps');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching roadmaps:', error);
    throw error;
  }
}

// Get roadmap by ID (admin)
async function getRoadmapById(id) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch roadmap');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching roadmap with ID ${id}:`, error);
    throw error;
  }
}

// Create a new roadmap (admin)
async function createRoadmap(roadmapData) {
  try {
    console.log('Sending roadmap creation request with data:', roadmapData);
    
    const response = await fetch('/api/admin/roadmaps', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roadmapData)
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Roadmap creation failed with status:', response.status);
      console.error('Error details:', responseData);
      throw new Error(responseData.message || responseData.error || 'Failed to create roadmap');
    }

    console.log('Roadmap created successfully:', responseData);
    return responseData;
  } catch (error) {
    console.error('Error creating roadmap:', error);
    throw error;
  }
}

// Update a roadmap (admin)
async function updateRoadmap(id, roadmapData) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(roadmapData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update roadmap');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating roadmap with ID ${id}:`, error);
    throw error;
  }
}

// Delete a roadmap (admin)
async function deleteRoadmap(id) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete roadmap');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting roadmap with ID ${id}:`, error);
    throw error;
  }
}

// Toggle roadmap publish status (admin)
async function toggleRoadmapPublishStatus(id) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${id}/toggle-publish`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to toggle roadmap publish status');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error toggling publish status for roadmap with ID ${id}:`, error);
    throw error;
  }
}

// Get complete roadmap with all modules (public)
async function getCompleteRoadmap(slug) {
  try {
    console.log(`Fetching roadmap with slug: ${slug}`);
    
    const response = await fetch(`/api/learning-roadmap/${slug}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    console.log(`API response status: ${response.status}`);

    if (!response.ok) {
      const error = await response.json();
      console.error('API error response:', error);
      throw new Error(error.message || 'Failed to fetch roadmap');
    }

    const data = await response.json();
    console.log('API response data:', data);
    
    // Check if modules exist and are properly structured
    if (!data.modules) {
      console.warn('No modules found in roadmap data');
      data.modules = [];
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching complete roadmap with slug ${slug}:`, error);
    throw error;
  }
}

// MODULE MANAGEMENT

// Get all modules for a roadmap
async function getRoadmapModules(roadmapId) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${roadmapId}/modules`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch roadmap modules');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error fetching modules for roadmap ${roadmapId}:`, error);
    throw error;
  }
}

// Create a new module for a roadmap
async function createRoadmapModule(roadmapId, moduleData) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${roadmapId}/modules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create roadmap module');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating roadmap module:', error);
    throw error;
  }
}

// Update a module
async function updateRoadmapModule(roadmapId, moduleId, moduleData) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${roadmapId}/modules/${moduleId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(moduleData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update roadmap module');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating module ${moduleId}:`, error);
    throw error;
  }
}

// Delete a module
async function deleteRoadmapModule(roadmapId, moduleId) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${roadmapId}/modules/${moduleId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete roadmap module');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting module ${moduleId}:`, error);
    throw error;
  }
}

// RESOURCE MANAGEMENT

// Add a resource to a module
async function addModuleResource(roadmapId, moduleId, resourceData) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${roadmapId}/modules/${moduleId}/resources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resourceData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add module resource');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding module resource:', error);
    throw error;
  }
}

// Update a resource
async function updateModuleResource(roadmapId, moduleId, resourceId, resourceData) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${roadmapId}/modules/${moduleId}/resources/${resourceId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resourceData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update module resource');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating resource ${resourceId}:`, error);
    throw error;
  }
}

// Delete a resource
async function deleteModuleResource(roadmapId, moduleId, resourceId) {
  try {
    const response = await fetch(`/api/admin/roadmaps/${roadmapId}/modules/${moduleId}/resources/${resourceId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete module resource');
    }

    return await response.json();
  } catch (error) {
    console.error(`Error deleting resource ${resourceId}:`, error);
    throw error;
  }
}

// Export all roadmap service functions
const roadmapService = {
  getAllRoadmaps,
  getRoadmapById,
  createRoadmap,
  updateRoadmap,
  deleteRoadmap,
  toggleRoadmapPublishStatus,
  getCompleteRoadmap,
  
  // Module management
  getRoadmapModules,
  createRoadmapModule,
  updateRoadmapModule,
  deleteRoadmapModule,
  
  // Resource management
  addModuleResource,
  updateModuleResource,
  deleteModuleResource
};

export default roadmapService; 