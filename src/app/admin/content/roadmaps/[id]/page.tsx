'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import roadmapService from '@/lib/services/roadmapService';
import { validateRoadmapData, validateRoadmapModuleData } from '@/lib/validators/roadmapValidator';

export default function EditRoadmapPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    duration: '',
    level: '',
    meta_description: '',
    image_path: '',
    is_published: false,
    // SEO Settings
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    schema_json: '',
    // Prerequisites
    prerequisites: [],
    // Career Outcomes
    career_outcomes: [],
    // Related Roadmaps
    related_roadmaps: [],
    // Progress Tracking
    progress_tracking: {
      enabled: true,
      showProgress: true,
      showStreak: true,
      showTimeInvested: true,
      defaultProgress: 0,
      defaultStreak: 0,
      defaultTimeInvested: 0
    }
  });

  // State for content selection modals
  const [showPrerequisiteModal, setShowPrerequisiteModal] = useState(false);
  const [showRelatedRoadmapModal, setShowRelatedRoadmapModal] = useState(false);
  const [availableContent, setAvailableContent] = useState({
    tutorials: [],
    articles: [],
    exercises: [],
    roadmaps: []
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(true);
  const [modules, setModules] = useState([]);
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  
  // Module form data
  const [moduleFormData, setModuleFormData] = useState({
    title: '',
    description: '',
    position: 0,
    duration: '',
    skills: '',
    resources: []
  });
  
  // Resource form data for adding to modules
  const [newResource, setNewResource] = useState({
    title: '',
    type: 'article',
    url: '',
    description: '',
    position: 0
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchRoadmap();
        fetchModules();
        fetchAvailableContent();
      }
    }
  }, [status, session, router, id]);

  const fetchRoadmap = async () => {
    try {
      setLoading(true);
      
      // Add a fix for the database schema before fetching the roadmap
      try {
        const fixResponse = await fetch('/api/migrations/fix-roadmaps-table');
        console.log('Fix response:', await fixResponse.json());
      } catch (fixError) {
        console.error('Error running fix:', fixError);
        // Continue anyway, as the fix might not be needed
      }
      
      const roadmap = await roadmapService.getRoadmapById(id);
      console.log('Fetched roadmap:', roadmap);
      
      if (roadmap) {
        setFormData({
          title: roadmap.title || '',
          slug: roadmap.slug || '',
          description: roadmap.description || '',
          duration: roadmap.duration || '',
          level: roadmap.level || '',
          meta_description: roadmap.meta_description || '',
          image_path: roadmap.image_path || '',
          is_published: roadmap.is_published || false,
          // SEO Settings
          seo_title: roadmap.seo_title || '',
          seo_description: roadmap.seo_description || '',
          seo_keywords: roadmap.seo_keywords || '',
          schema_json: roadmap.schema_json || '',
          // Prerequisites
          prerequisites: roadmap.prerequisites ? JSON.parse(roadmap.prerequisites) : [],
          // Career Outcomes
          career_outcomes: roadmap.career_outcomes ? JSON.parse(roadmap.career_outcomes) : [],
          // Related Roadmaps
          related_roadmaps: roadmap.related_roadmaps ? JSON.parse(roadmap.related_roadmaps) : [],
          // Progress Tracking
          progress_tracking: roadmap.progress_tracking ? JSON.parse(roadmap.progress_tracking) : {
            enabled: true,
            showProgress: true,
            showStreak: true,
            showTimeInvested: true,
            defaultProgress: 0,
            defaultStreak: 0,
            defaultTimeInvested: 0
          }
        });
      } else {
        setFormError('Roadmap not found');
      }
    } catch (error) {
      console.error('Error fetching roadmap:', error);
      setFormError('Failed to load roadmap data: ' + (error.message || 'Unknown error'));
      
      // Add a button in the UI to fix the problem
      const fixButton = document.createElement('button');
      fixButton.textContent = 'Fix Roadmaps Table';
      fixButton.className = 'px-4 py-2 bg-red-600 text-white rounded';
      fixButton.onclick = async () => {
        try {
          const response = await fetch('/api/migrations/fix-roadmaps-table');
          const data = await response.json();
          alert('Table fixed: ' + JSON.stringify(data.details));
          window.location.reload();
        } catch (err) {
          alert('Error fixing table: ' + err);
        }
      };
      
      // Add the button to the error message div
      setTimeout(() => {
        const errorDiv = document.querySelector('.bg-red-100');
        if (errorDiv) {
          const buttonContainer = document.createElement('div');
          buttonContainer.className = 'mt-2';
          buttonContainer.appendChild(fixButton);
          errorDiv.appendChild(buttonContainer);
        }
      }, 500);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      const modulesList = await roadmapService.getRoadmapModules(id);
      // Sort modules by position
      modulesList.sort((a, b) => a.position - b.position);
      setModules(modulesList);
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear error for this field when it's edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAutoGenerateSEO = async () => {
    try {
      const response = await fetch('/api/admin/roadmaps/auto-generate-seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          level: formData.level,
          duration: formData.duration
        }),
      });

      if (response.ok) {
        const seoData = await response.json();
        setFormData(prev => ({
          ...prev,
          seo_title: seoData.seo_title || prev.seo_title,
          seo_description: seoData.seo_description || prev.seo_description,
          seo_keywords: seoData.seo_keywords || prev.seo_keywords,
          schema_json: seoData.schema_json || prev.schema_json
        }));
      } else {
        console.error('Failed to generate SEO data');
      }
    } catch (error) {
      console.error('Error generating SEO data:', error);
    }
  };

  // Helper functions for managing dynamic arrays
  const addPrerequisite = () => {
    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, { title: '', description: '', icon: 'check-circle' }]
    }));
  };

  const updatePrerequisite = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removePrerequisite = (index) => {
    setFormData(prev => ({
      ...prev,
      prerequisites: prev.prerequisites.filter((_, i) => i !== index)
    }));
  };

  const addCareerOutcome = () => {
    setFormData(prev => ({
      ...prev,
      career_outcomes: [...prev.career_outcomes, { title: '', description: '', salary: '', color: 'blue' }]
    }));
  };

  const updateCareerOutcome = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      career_outcomes: prev.career_outcomes.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeCareerOutcome = (index) => {
    setFormData(prev => ({
      ...prev,
      career_outcomes: prev.career_outcomes.filter((_, i) => i !== index)
    }));
  };

  const addRelatedRoadmap = () => {
    setFormData(prev => ({
      ...prev,
      related_roadmaps: [...prev.related_roadmaps, { title: '', description: '', slug: '', modules: 0, level: 'Intermediate', icon: 'database' }]
    }));
  };

  const updateRelatedRoadmap = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      related_roadmaps: prev.related_roadmaps.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeRelatedRoadmap = (index) => {
    setFormData(prev => ({
      ...prev,
      related_roadmaps: prev.related_roadmaps.filter((_, i) => i !== index)
    }));
  };

  // Fetch available content for selection
  const fetchAvailableContent = async () => {
    try {
      const [tutorialsRes, articlesRes, exercisesRes, roadmapsRes] = await Promise.all([
        fetch('/api/admin/tutorials'),
        fetch('/api/admin/articles'),
        fetch('/api/admin/lab-exercises'),
        fetch('/api/admin/roadmaps')
      ]);

      const [tutorials, articles, exercises, roadmaps] = await Promise.all([
        tutorialsRes.json(),
        articlesRes.json(),
        exercisesRes.json(),
        roadmapsRes.json()
      ]);

      setAvailableContent({
        tutorials: tutorials || [],
        articles: articles || [],
        exercises: exercises || [],
        roadmaps: roadmaps || []
      });
    } catch (error) {
      console.error('Error fetching available content:', error);
    }
  };

  // Add prerequisite from existing content
  const addPrerequisiteFromContent = (content, type) => {
    const newPrerequisite = {
      title: content.title,
      description: content.description || content.meta_description || '',
      icon: type === 'tutorial' ? 'book' : type === 'article' ? 'document' : 'flask',
      type: type,
      content_id: content.id,
      slug: content.slug,
      link: `/${type}s/${content.slug}`
    };

    setFormData(prev => ({
      ...prev,
      prerequisites: [...prev.prerequisites, newPrerequisite]
    }));

    setShowPrerequisiteModal(false);
  };

  // Add related roadmap from existing roadmaps
  const addRelatedRoadmapFromExisting = (roadmap) => {
    const newRelatedRoadmap = {
      title: roadmap.title,
      description: roadmap.description,
      slug: roadmap.slug,
      modules: 0, // Will be updated when modules are loaded
      level: roadmap.level || 'Intermediate',
      icon: 'database',
      roadmap_id: roadmap.id,
      link: `/learning-roadmap/${roadmap.slug}`
    };

    setFormData(prev => ({
      ...prev,
      related_roadmaps: [...prev.related_roadmaps, newRelatedRoadmap]
    }));

    setShowRelatedRoadmapModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Validate form data
    const validationResult = validateRoadmapData(formData);
    if (!validationResult.isValid) {
      setErrors(validationResult.errors);
      return;
    }
    
    try {
      setIsSubmitting(true);
      setFormError('');
      
      // Prepare the data for submission, converting arrays to JSON
      const submitData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : null,
        prerequisites: JSON.stringify(formData.prerequisites),
        career_outcomes: JSON.stringify(formData.career_outcomes),
        related_roadmaps: JSON.stringify(formData.related_roadmaps),
        progress_tracking: JSON.stringify(formData.progress_tracking)
      };
      
      await roadmapService.updateRoadmap(id, submitData);
      
      // Show success message
      alert('Roadmap updated successfully!');
    } catch (error) {
      console.error('Error updating roadmap:', error);
      setFormError('Failed to update roadmap. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Module form handlers
  const handleModuleChange = (e) => {
    const { name, value } = e.target;
    setModuleFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const openModuleForm = (module = null) => {
    if (module) {
      setModuleFormData({
        title: module.title || '',
        description: module.description || '',
        position: module.position || 0,
        duration: module.duration || '',
        skills: module.skills || '',
        resources: module.resources || []
      });
      setEditingModuleId(module.id);
    } else {
      // For new module, set position to the last position + 1
      const lastPosition = modules.length > 0 
        ? Math.max(...modules.map(m => m.position)) 
        : 0;
      
      setModuleFormData({
        title: '',
        description: '',
        position: lastPosition + 1,
        duration: '',
        skills: '',
        resources: []
      });
      setEditingModuleId(null);
    }
    setShowModuleForm(true);
  };

  const closeModuleForm = () => {
    setShowModuleForm(false);
    setEditingModuleId(null);
    setModuleFormData({
      title: '',
      description: '',
      position: 0,
      duration: '',
      skills: '',
      resources: []
    });
  };

  const handleModuleSubmit = async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare module data
      const moduleData = {
        roadmap_id: parseInt(id),
        title: moduleFormData.title,
        description: moduleFormData.description,
        position: parseInt(moduleFormData.position),
        duration: moduleFormData.duration,
        skills: moduleFormData.skills
      };
      
      if (editingModuleId) {
        // Update existing module
        await roadmapService.updateRoadmapModule(id, editingModuleId, moduleData);
      } else {
        // Create new module
      await roadmapService.createRoadmapModule(id, moduleData);
      }
      
      // Refresh modules list
      await fetchModules();
      
      // Close form
      closeModuleForm();
      
    } catch (error) {
      console.error('Error saving module:', error);
      setFormError('Failed to save module. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if (window.confirm('Are you sure you want to delete this module? This will also delete all resources associated with it.')) {
      try {
        await roadmapService.deleteRoadmapModule(id, moduleId);
        await fetchModules();
      } catch (error) {
        console.error('Error deleting module:', error);
        setFormError('Failed to delete module. Please try again.');
      }
    }
  };

  // Resource handlers
  const handleResourceChange = (e) => {
    const { name, value } = e.target;
    setNewResource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddResource = async (moduleId) => {
    try {
      if (!newResource.title.trim()) {
        alert('Resource title is required');
        return;
      }
      
      const resourceData = {
        ...newResource,
        module_id: moduleId
      };
      
      await roadmapService.addModuleResource(id, moduleId, resourceData);
      
      // Clear form
      setNewResource({
        title: '',
        type: 'article',
        url: '',
        description: '',
        position: 0
      });
      
      // Refresh modules list
      await fetchModules();
      
    } catch (error) {
      console.error('Error adding resource:', error);
      setFormError('Failed to add resource. Please try again.');
    }
  };

  const handleDeleteResource = async (moduleId, resourceId) => {
    if (window.confirm('Are you sure you want to delete this resource?')) {
      try {
        await roadmapService.deleteModuleResource(id, moduleId, resourceId);
        await fetchModules();
      } catch (error) {
        console.error('Error deleting resource:', error);
        setFormError('Failed to delete resource. Please try again.');
      }
    }
  };

  // Module reordering
  const moveModuleUp = async (moduleIndex) => {
    if (moduleIndex <= 0) return;
    
    try {
      const updatedModules = [...modules];
      const currentModule = updatedModules[moduleIndex];
      const prevModule = updatedModules[moduleIndex - 1];
      
      // Swap positions
      const tempPosition = currentModule.position;
      currentModule.position = prevModule.position;
      prevModule.position = tempPosition;
      
      // Update in database
      await roadmapService.updateRoadmapModule(id, currentModule.id, { 
        position: currentModule.position,
        roadmap_id: parseInt(id)
      });
      
      await roadmapService.updateRoadmapModule(id, prevModule.id, { 
        position: prevModule.position,
        roadmap_id: parseInt(id)
      });
      
      // Refresh modules
      await fetchModules();
    } catch (error) {
      console.error('Error reordering modules:', error);
    }
  };

  const moveModuleDown = async (moduleIndex) => {
    if (moduleIndex >= modules.length - 1) return;
    
    try {
      const updatedModules = [...modules];
      const currentModule = updatedModules[moduleIndex];
      const nextModule = updatedModules[moduleIndex + 1];
      
      // Swap positions
      const tempPosition = currentModule.position;
      currentModule.position = nextModule.position;
      nextModule.position = tempPosition;
      
      // Update in database
      await roadmapService.updateRoadmapModule(id, currentModule.id, { 
        position: currentModule.position,
        roadmap_id: parseInt(id)
      });
      
      await roadmapService.updateRoadmapModule(id, nextModule.id, { 
        position: nextModule.position,
        roadmap_id: parseInt(id)
      });
      
      // Refresh modules
      await fetchModules();
    } catch (error) {
      console.error('Error reordering modules:', error);
    }
  };

  if (loading && status !== 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Edit Roadmap</h1>
          <p className="text-gray-600">Update your learning roadmap information</p>
        </div>
        <Link
          href="/admin/content/roadmaps"
          className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-200 transition"
        >
          Back to Roadmaps
        </Link>
      </div>

      {formError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {formError}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium">Roadmap Details</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title}</p>
              )}
            </div>

            {/* Slug */}
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-500">{errors.slug}</p>
              )}
            </div>

            {/* Description */}
            <div className="col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            {/* Meta Description */}
            <div className="col-span-2">
              <label htmlFor="meta_description" className="block text-sm font-medium text-gray-700 mb-1">
                Meta Description
              </label>
              <textarea
                id="meta_description"
                name="meta_description"
                value={formData.meta_description}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.meta_description && (
                <p className="mt-1 text-sm text-red-500">{errors.meta_description}</p>
              )}
            </div>

            {/* Level */}
            <div>
              <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                Level
              </label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Select a level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="all-levels">All Levels</option>
              </select>
              {errors.level && (
                <p className="mt-1 text-sm text-red-500">{errors.level}</p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-1">
                Duration (in days)
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {errors.duration && (
                <p className="mt-1 text-sm text-red-500">{errors.duration}</p>
              )}
            </div>

            {/* Image Path */}
            <div className="col-span-2">
              <label htmlFor="image_path" className="block text-sm font-medium text-gray-700 mb-1">
                Image Path
              </label>
              <input
                type="text"
                id="image_path"
                name="image_path"
                value={formData.image_path}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., /images/roadmaps/devops-engineer.jpg"
              />
              {errors.image_path && (
                <p className="mt-1 text-sm text-red-500">{errors.image_path}</p>
              )}
            </div>

            {/* Publish Status */}
            <div className="col-span-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_published"
                  name="is_published"
                  checked={formData.is_published}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor="is_published" className="ml-2 block text-sm text-gray-700">
                  Publish this roadmap (make it visible to users)
                </label>
              </div>
            </div>
          </div>


          {/* Prerequisites Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Prerequisites Settings</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowPrerequisiteModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  + Add from Existing Content
                </button>
                <button
                  type="button"
                  onClick={addPrerequisite}
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-sm"
                >
                  + Add Custom Prerequisite
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {formData.prerequisites.map((prerequisite, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-700">Prerequisite {index + 1}</h4>
                      {prerequisite.content_id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Linked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {prerequisite.link && (
                        <a
                          href={prerequisite.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Content
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removePrerequisite(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={prerequisite.title}
                        onChange={(e) => updatePrerequisite(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., Basic Linux Knowledge"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        value={prerequisite.icon}
                        onChange={(e) => updatePrerequisite(index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="check-circle">Check Circle</option>
                        <option value="lightning">Lightning</option>
                        <option value="server">Server</option>
                        <option value="database">Database</option>
                        <option value="code">Code</option>
                        <option value="book">Book</option>
                      </select>
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={prerequisite.description}
                        onChange={(e) => updatePrerequisite(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Brief description of the prerequisite"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.prerequisites.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No prerequisites added yet. Click "Add Prerequisite" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Career Outcomes Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Career Outcomes Settings</h3>
              <button
                type="button"
                onClick={addCareerOutcome}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
              >
                + Add Career Outcome
              </button>
            </div>
            <div className="space-y-4">
              {formData.career_outcomes.map((outcome, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Career Outcome {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeCareerOutcome(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={outcome.title}
                        onChange={(e) => updateCareerOutcome(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., Virtualization Engineer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Salary Range
                      </label>
                      <input
                        type="text"
                        value={outcome.salary}
                        onChange={(e) => updateCareerOutcome(index, 'salary', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., $75,000 - $120,000"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Color Theme
                      </label>
                      <select
                        value={outcome.color}
                        onChange={(e) => updateCareerOutcome(index, 'color', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="blue">Blue</option>
                        <option value="green">Green</option>
                        <option value="purple">Purple</option>
                        <option value="orange">Orange</option>
                        <option value="red">Red</option>
                        <option value="indigo">Indigo</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={outcome.description}
                        onChange={(e) => updateCareerOutcome(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Brief description of the career role"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.career_outcomes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No career outcomes added yet. Click "Add Career Outcome" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Related Roadmaps Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Related Roadmaps Settings</h3>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setShowRelatedRoadmapModal(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                  + Add from Existing Roadmaps
                </button>
                <button
                  type="button"
                  onClick={addRelatedRoadmap}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
                >
                  + Add Custom Roadmap
                </button>
              </div>
            </div>
            <div className="space-y-4">
              {formData.related_roadmaps.map((roadmap, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-medium text-gray-700">Related Roadmap {index + 1}</h4>
                      {roadmap.roadmap_id && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          Linked
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {roadmap.link && (
                        <a
                          href={roadmap.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View Roadmap
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={() => removeRelatedRoadmap(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title
                      </label>
                      <input
                        type="text"
                        value={roadmap.title}
                        onChange={(e) => updateRelatedRoadmap(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., Linux Storage Management"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Slug
                      </label>
                      <input
                        type="text"
                        value={roadmap.slug}
                        onChange={(e) => updateRelatedRoadmap(index, 'slug', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., linux-storage-management"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Modules Count
                      </label>
                      <input
                        type="number"
                        value={roadmap.modules}
                        onChange={(e) => updateRelatedRoadmap(index, 'modules', parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="e.g., 6"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Level
                      </label>
                      <select
                        value={roadmap.level}
                        onChange={(e) => updateRelatedRoadmap(index, 'level', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Icon
                      </label>
                      <select
                        value={roadmap.icon}
                        onChange={(e) => updateRelatedRoadmap(index, 'icon', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="database">Database</option>
                        <option value="flask">Flask</option>
                        <option value="cloud">Cloud</option>
                        <option value="server">Server</option>
                        <option value="code">Code</option>
                        <option value="book">Book</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={roadmap.description}
                        onChange={(e) => updateRelatedRoadmap(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                        placeholder="Brief description of the related roadmap"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {formData.related_roadmaps.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>No related roadmaps added yet. Click "Add Related Roadmap" to get started.</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Tracking Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Progress Tracking Settings</h3>
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enable Progress Tracking
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.progress_tracking.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        progress_tracking: { ...prev.progress_tracking, enabled: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Show progress tracking section on roadmap page
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Show Progress Circle
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.progress_tracking.showProgress}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        progress_tracking: { ...prev.progress_tracking, showProgress: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Display circular progress indicator
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Show Streak Counter
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.progress_tracking.showStreak}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        progress_tracking: { ...prev.progress_tracking, showStreak: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Display learning streak counter
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Show Time Invested
                  </label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.progress_tracking.showTimeInvested}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        progress_tracking: { ...prev.progress_tracking, showTimeInvested: e.target.checked }
                      }))}
                      className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Display time invested counter
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Progress (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress_tracking.defaultProgress}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      progress_tracking: { ...prev.progress_tracking, defaultProgress: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Streak (days)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.progress_tracking.defaultStreak}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      progress_tracking: { ...prev.progress_tracking, defaultStreak: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Time Invested (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.progress_tracking.defaultTimeInvested}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      progress_tracking: { ...prev.progress_tracking, defaultTimeInvested: parseInt(e.target.value) || 0 }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SEO Settings Section */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">SEO Settings</h3>
              <button
                type="button"
                onClick={handleAutoGenerateSEO}
                className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors text-sm"
              >
                Auto Generate SEO
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="seo_title"
                  name="seo_title"
                  value={formData.seo_title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="SEO optimized title"
                />
              </div>
              <div>
                <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Keywords
                </label>
                <input
                  type="text"
                  id="seo_keywords"
                  name="seo_keywords"
                  value={formData.seo_keywords}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Comma-separated keywords"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-1">
                  SEO Description
                </label>
                <textarea
                  id="seo_description"
                  name="seo_description"
                  value={formData.seo_description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="SEO optimized description"
                />
              </div>
              <div className="col-span-2">
                <label htmlFor="schema_json" className="block text-sm font-medium text-gray-700 mb-1">
                  Schema Structure Data (JSON-LD)
                </label>
                <textarea
                  id="schema_json"
                  name="schema_json"
                  value={formData.schema_json}
                  onChange={handleChange}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md font-mono text-sm"
                  placeholder="JSON-LD structured data for search engines"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Modules Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-8">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium">Modules</h2>
          <button
            onClick={() => openModuleForm()}
            className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
          >
            Add Module
          </button>
        </div>

        <div className="p-6">
          {modules.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No modules added yet. Add your first module to get started.</p>
          ) : (
            <div className="space-y-4">
                  {modules.map((module, index) => (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                          {index + 1}
                        </span>
                        <h3 className="font-semibold">{module.title}</h3>
                        </div>
                      {module.duration && <p className="text-sm text-gray-600 mt-1">Duration: {module.duration}</p>}
                        </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => moveModuleUp(index)}
                        disabled={index === 0}
                        className={`px-2 py-1 text-xs rounded ${
                          index === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ↑
                      </button>
                      <button
                        onClick={() => moveModuleDown(index)}
                        disabled={index === modules.length - 1}
                        className={`px-2 py-1 text-xs rounded ${
                          index === modules.length - 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        ↓
                      </button>
                          <button
                        onClick={() => openModuleForm(module)}
                        className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                          >
                            Edit
                          </button>
                          <button
                        onClick={() => handleDeleteModule(module.id)}
                        className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                          >
                            Delete
                          </button>
                        </div>
                  </div>
                  
                  {module.description && (
                    <p className="text-sm text-gray-700 mb-4">{module.description}</p>
                  )}
                  
                  {/* Resources for this module */}
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Resources</h4>
                    
                    {module.resources && module.resources.length > 0 ? (
                      <div className="space-y-2 mb-4">
                        {module.resources.map((resource) => (
                          <div key={resource.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                            <div>
                              <span className="text-sm font-medium">{resource.title}</span>
                              <span className="ml-2 text-xs bg-gray-200 px-1 rounded">{resource.type}</span>
                              {resource.url && (
                                <a href={resource.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-blue-600 text-xs">
                                  Link
                                </a>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteResource(module.id, resource.id)}
                              className="text-red-600 text-xs hover:text-red-800"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 italic mb-4">No resources added yet.</p>
                    )}
                    
                    {/* Add resource form */}
                    <div className="border-t pt-3 mt-3">
                      <h5 className="text-sm font-medium mb-2">Add Resource</h5>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Resource Title"
                          value={newResource.title}
                          onChange={(e) => handleResourceChange({ target: { name: 'title', value: e.target.value } })}
                          className="px-2 py-1 border rounded text-sm"
                        />
                        <select
                          value={newResource.type}
                          onChange={(e) => handleResourceChange({ target: { name: 'type', value: e.target.value } })}
                          className="px-2 py-1 border rounded text-sm"
                        >
                          <option value="article">Article</option>
                          <option value="video">Video</option>
                          <option value="course">Course</option>
                          <option value="tutorial">Tutorial</option>
                          <option value="book">Book</option>
                          <option value="tool">Tool</option>
                          <option value="documentation">Documentation</option>
                        </select>
                      </div>
                      <div className="mb-2">
                        <input
                          type="text"
                          placeholder="URL"
                          value={newResource.url}
                          onChange={(e) => handleResourceChange({ target: { name: 'url', value: e.target.value } })}
                          className="w-full px-2 py-1 border rounded text-sm"
                        />
                      </div>
                      <div className="mb-2">
                        <textarea
                          placeholder="Description (optional)"
                          value={newResource.description}
                          onChange={(e) => handleResourceChange({ target: { name: 'description', value: e.target.value } })}
                          className="w-full px-2 py-1 border rounded text-sm"
                          rows={2}
                        />
                      </div>
                      <button
                        onClick={() => handleAddResource(module.id)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700 transition"
                        disabled={!newResource.title || !newResource.type}
                      >
                        Add Resource
                      </button>
                    </div>
            </div>
          </div>
              ))}
          </div>
        )}
        </div>
      </div>

      {/* Module Form Modal */}
      {showModuleForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium">{editingModuleId ? 'Edit Module' : 'Add New Module'}</h2>
            </div>
            
            <form onSubmit={handleModuleSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="module-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="module-title"
                    name="title"
                    value={moduleFormData.title}
                    onChange={handleModuleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="module-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="module-description"
                    name="description"
                    value={moduleFormData.description}
                    onChange={handleModuleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label htmlFor="module-skills" className="block text-sm font-medium text-gray-700 mb-1">
                    Skills You'll Learn
                  </label>
                  <textarea
                    id="module-skills"
                    name="skills"
                    value={moduleFormData.skills}
                    onChange={handleModuleChange}
                    rows={3}
                    placeholder="Enter skills separated by commas (e.g., Linux command line, Shell scripting, File permissions)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="module-position" className="block text-sm font-medium text-gray-700 mb-1">
                      Position <span className="text-red-500">*</span>
                  </label>
                      <input
                      type="number"
                      id="module-position"
                      name="position"
                      value={moduleFormData.position}
                      onChange={handleModuleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      required
                      min="1"
                    />
                </div>

                  <div>
                    <label htmlFor="module-duration" className="block text-sm font-medium text-gray-700 mb-1">
                      Duration
                  </label>
                        <input
                          type="text"
                      id="module-duration"
                      name="duration"
                      value={moduleFormData.duration}
                      onChange={handleModuleChange}
                      placeholder="e.g., 2-3 weeks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        />
                      </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModuleForm}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-md text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${
                    isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? 'Saving...' : (editingModuleId ? 'Update Module' : 'Add Module')}
                </button>
              </div>
            </form>
          </div>
          </div>
        )}

      {/* Prerequisite Content Selection Modal */}
      {showPrerequisiteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select Prerequisite Content</h3>
                <button
                  onClick={() => setShowPrerequisiteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-4">
                {/* Tutorials */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Tutorials</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableContent.tutorials.map((tutorial) => (
                      <div key={tutorial.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium">{tutorial.title}</p>
                          <p className="text-xs text-gray-500">{tutorial.description?.substring(0, 100)}...</p>
                        </div>
                        <button
                          onClick={() => addPrerequisiteFromContent(tutorial, 'tutorial')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Articles */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Articles</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableContent.articles.map((article) => (
                      <div key={article.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium">{article.title}</p>
                          <p className="text-xs text-gray-500">{article.meta_description?.substring(0, 100)}...</p>
                        </div>
                        <button
                          onClick={() => addPrerequisiteFromContent(article, 'article')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lab Exercises */}
                <div>
                  <h4 className="text-md font-medium text-gray-700 mb-2">Lab Exercises</h4>
                  <div className="max-h-40 overflow-y-auto space-y-2">
                    {availableContent.exercises.map((exercise) => (
                      <div key={exercise.id} className="flex items-center justify-between p-2 border rounded hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium">{exercise.title}</p>
                          <p className="text-xs text-gray-500">{exercise.description?.substring(0, 100)}...</p>
                        </div>
                        <button
                          onClick={() => addPrerequisiteFromContent(exercise, 'exercise')}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Related Roadmap Selection Modal */}
      {showRelatedRoadmapModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Select Related Roadmap</h3>
                <button
                  onClick={() => setShowRelatedRoadmapModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {availableContent.roadmaps
                  .filter(roadmap => roadmap.id !== parseInt(id)) // Exclude current roadmap
                  .map((roadmap) => (
                    <div key={roadmap.id} className="flex items-center justify-between p-3 border rounded hover:bg-gray-50">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{roadmap.title}</p>
                        <p className="text-xs text-gray-500">{roadmap.description?.substring(0, 150)}...</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-xs text-gray-400">Level: {roadmap.level || 'N/A'}</span>
                          <span className="text-xs text-gray-400">Duration: {roadmap.duration || 'N/A'} days</span>
                        </div>
                      </div>
                      <button
                        onClick={() => addRelatedRoadmapFromExisting(roadmap)}
                        className="bg-purple-600 text-white px-4 py-2 rounded text-sm hover:bg-purple-700"
                      >
                        Add
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 