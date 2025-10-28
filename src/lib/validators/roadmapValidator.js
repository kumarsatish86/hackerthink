/**
 * Validator for roadmap data
 */

export function validateRoadmapData(data) {
  const errors = [];

  // Check required fields
  if (!data.title || data.title.trim() === '') {
    errors.push('Title is required');
  }

  if (!data.slug || data.slug.trim() === '') {
    errors.push('Slug is required');
  } else if (!/^[a-z0-9-]+$/.test(data.slug)) {
    errors.push('Slug must contain only lowercase letters, numbers, and hyphens');
  }

  // Validate slug format (URL-friendly)
  if (data.slug && data.slug.includes(' ')) {
    errors.push('Slug cannot contain spaces');
  }

  // Optional field validations
  if (data.duration && (isNaN(data.duration) || data.duration < 0)) {
    errors.push('Duration must be a positive number');
  }

  if (data.is_published !== undefined && typeof data.is_published !== 'boolean') {
    errors.push('Published status must be a boolean');
  }

  if (data.is_featured !== undefined && typeof data.is_featured !== 'boolean') {
    errors.push('Featured status must be a boolean');
  }

  return {
    isValid: errors.length === 0,
    errors: errors
  };
}

export function validateRoadmapModuleData(data) {
  const errors = {};
  
  // Validate roadmap_id
  if (!data.roadmap_id) {
    errors.roadmap_id = 'Roadmap ID is required';
  }
  
  // Validate title
  if (!data.title) {
    errors.title = 'Title is required';
  } else if (data.title.length < 3) {
    errors.title = 'Title must be at least 3 characters long';
  } else if (data.title.length > 255) {
    errors.title = 'Title must be less than 255 characters';
  }
  
  // Validate description (optional but if provided, must be valid)
  if (data.description && data.description.length > 5000) {
    errors.description = 'Description must be less than 5000 characters';
  }
  
  // Validate duration (optional)
  if (data.duration && data.duration.length > 100) {
    errors.duration = 'Duration must be less than 100 characters';
  }
  
  // Validate skills (optional)
  if (data.skills && data.skills.length > 2000) {
    errors.skills = 'Skills must be less than 2000 characters';
  }
  
  // Validate position
  if (data.position === undefined || data.position === null) {
    errors.position = 'Position is required';
  } else if (isNaN(Number(data.position))) {
    errors.position = 'Position must be a number';
  }
  
  // Return validation result
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
} 