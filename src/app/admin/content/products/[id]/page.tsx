'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FaArrowLeft, FaSave, FaEye, FaBox, FaGlobe, FaRocket, FaBrain, FaChartLine, FaCog, FaLightbulb, FaStar, FaExternalLinkAlt, FaPlus, FaTrash, FaMagic } from 'react-icons/fa';
import TipTapEditor from '@/components/TipTapEditor';

interface ProductFormData {
  id: string;
  name: string;
  slug: string;
  logo_url: string;
  logo_alt: string;
  short_description: string;
  full_description: string;
  pricing_type: 'free' | 'freemium' | 'paid' | 'enterprise';
  pricing_details: string;
  website_url: string;
  demo_url: string;
  documentation_url: string;
  github_url: string;
  integrations: string[];
  pros: string[];
  cons: string[];
  features: string[];
  categories: string[];
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  company_name: string;
  company_size: string;
  founded_year: number;
  headquarters: string;
  social_links: string;
  seo_title: string;
  seo_description: string;
  seo_keywords: string;
  launch_date: string;
  created_at: string;
  updated_at: string;
}

const EditProductPage = ({ params }: { params: { id: string } }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewMode, setPreviewMode] = useState(false);

  const [formData, setFormData] = useState<ProductFormData>({
    id: '',
    name: '',
    slug: '',
    logo_url: '',
    logo_alt: '',
    short_description: '',
    full_description: '',
    pricing_type: 'free',
    pricing_details: '',
    website_url: '',
    demo_url: '',
    documentation_url: '',
    github_url: '',
    integrations: [],
    pros: [],
    cons: [],
    features: [],
    categories: [],
    tags: [],
    status: 'draft',
    featured: false,
    company_name: '',
    company_size: '',
    founded_year: new Date().getFullYear(),
    headquarters: '',
    social_links: '',
    seo_title: '',
    seo_description: '',
    seo_keywords: '',
    launch_date: new Date().toISOString().split('T')[0],
    created_at: '',
    updated_at: ''
  });

  const [newIntegration, setNewIntegration] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');
  const [newFeature, setNewFeature] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newTag, setNewTag] = useState('');
  const [availableCategories, setAvailableCategories] = useState<Array<{ id: string; name: string; icon: any }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Fetch product categories from Taxonomy API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/admin/taxonomy/categories?content_type=products');
        if (response.ok) {
          const data = await response.json();
          // Map categories to the format expected by the form
          const categoryIcons: { [key: string]: any } = {
            'ai models': FaBrain,
            'developer tools': FaCog,
            'productivity': FaChartLine,
            'startups': FaRocket,
            'research': FaLightbulb,
            'global': FaGlobe,
            'ai coding': FaBrain,
            'language processing': FaBrain,
            // Default icon for unknown categories
          };
          
          const mappedCategories = (data.categories || []).map((cat: any) => ({
            id: cat.name, // Use name as id since products store categories as strings
            name: cat.name,
            icon: categoryIcons[cat.name.toLowerCase()] || FaBox
          }));
          
          setAvailableCategories(mappedCategories);
        }
      } catch (error) {
        console.error('Error fetching product categories:', error);
        // Fallback to default categories if API fails
        setAvailableCategories([
          { id: 'AI Models', name: 'AI Models', icon: FaBrain },
          { id: 'Developer Tools', name: 'Developer Tools', icon: FaCog },
          { id: 'Productivity', name: 'Productivity', icon: FaChartLine },
          { id: 'Startups', name: 'Startups', icon: FaRocket },
          { id: 'Research', name: 'Research', icon: FaLightbulb },
          { id: 'Global', name: 'Global', icon: FaGlobe }
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Auto-generate SEO data
  const generateSEOData = () => {
    const productName = formData.name || 'AI Product';
    const shortDesc = formData.short_description || 'Advanced AI solution';
    const categories = formData.categories.join(', ') || 'AI, Technology';
    
    // Generate SEO title (max 60 characters)
    const seoTitle = `${productName} - ${shortDesc.substring(0, 40)}`.substring(0, 60);
    
    // Generate SEO description (max 160 characters)
    const seoDescription = `${shortDesc} ${productName} is a powerful AI solution for ${categories}. Discover features, pricing, and more.`.substring(0, 160);
    
    // Generate SEO keywords
    const keywords = [
      productName.toLowerCase(),
      ...formData.categories.map(cat => cat.toLowerCase()),
      ...formData.tags.map(tag => tag.toLowerCase()),
      'ai', 'artificial intelligence', 'technology', 'software', 'tool'
    ].filter((keyword, index, arr) => arr.indexOf(keyword) === index).join(', ');

    setFormData(prev => ({
      ...prev,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_keywords: keywords
    }));
  };


  const pricingTypes = [
    { value: 'free', label: 'Free', color: 'green' },
    { value: 'freemium', label: 'Freemium', color: 'blue' },
    { value: 'paid', label: 'Paid', color: 'purple' },
    { value: 'enterprise', label: 'Enterprise', color: 'gray' }
  ];

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        
        const data = await response.json();
        setFormData(data.product);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProduct();
    }
  }, [params.id]);

  // Auto-generate slug from name
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleInputChange = (field: keyof ProductFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Auto-generate slug when name changes
    if (field === 'name') {
      setFormData(prev => ({
        ...prev,
        slug: generateSlug(value)
      }));
    }
  };

  const addArrayItem = (field: 'integrations' | 'pros' | 'cons' | 'features' | 'categories' | 'tags', value: string) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const removeArrayItem = (field: 'integrations' | 'pros' | 'cons' | 'features' | 'categories' | 'tags', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product');
      }

      const result = await response.json();
      router.push(`/admin/content/products/${result.product.id}`);
    } catch (err) {
      console.error('Error updating product:', err);
      setError(err instanceof Error ? err.message : 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save draft');
      }

      const result = await response.json();
      router.push(`/admin/content/products/${result.product.id}`);
    } catch (err) {
      console.error('Error saving draft:', err);
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <Link
            href="/admin/content/products"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/content/products"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
            <p className="text-gray-600">Update product information and settings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={() => setPreviewMode(!previewMode)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <FaEye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </button>
          
          <button
            type="button"
            onClick={handleSaveDraft}
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <FaSave className="mr-2 h-4 w-4" />
            Save Draft
          </button>
          
          <button
            type="submit"
            form="product-form"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <FaSave className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter product name"
                  />
                </div>
                
                <div>
                  <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={(e) => handleInputChange('slug', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="product-url-slug"
                  />
                </div>
                
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    id="logo_url"
                    value={formData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com/logo.png"
                  />
                </div>
                
                <div>
                  <label htmlFor="logo_alt" className="block text-sm font-medium text-gray-700 mb-1">
                    Logo Alt Text
                  </label>
                  <input
                    type="text"
                    id="logo_alt"
                    value={formData.logo_alt}
                    onChange={(e) => handleInputChange('logo_alt', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Product logo"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="short_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Short Description *
                  </label>
                  <textarea
                    id="short_description"
                    required
                    rows={3}
                    value={formData.short_description}
                    onChange={(e) => handleInputChange('short_description', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Brief description of the product"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="full_description" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Description
                  </label>
                  <div className="border border-gray-300 rounded-md">
                    <TipTapEditor
                      content={formData.full_description}
                      onChange={(content) => handleInputChange('full_description', content)}
                      placeholder="Detailed description of the product"
                      height="300px"
                      showToolbar={true}
                      showMenuBar={false}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Pricing Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="pricing_type" className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Type *
                  </label>
                  <select
                    id="pricing_type"
                    required
                    value={formData.pricing_type}
                    onChange={(e) => handleInputChange('pricing_type', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {pricingTypes.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="launch_date" className="block text-sm font-medium text-gray-700 mb-1">
                    Launch Date
                  </label>
                  <input
                    type="date"
                    id="launch_date"
                    value={formData.launch_date}
                    onChange={(e) => handleInputChange('launch_date', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="pricing_details" className="block text-sm font-medium text-gray-700 mb-1">
                    Pricing Details
                  </label>
                  <textarea
                    id="pricing_details"
                    rows={3}
                    value={formData.pricing_details}
                    onChange={(e) => handleInputChange('pricing_details', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Detailed pricing information"
                  />
                </div>
              </div>
            </div>

            {/* URLs and Links */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">URLs and Links</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="website_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    id="website_url"
                    value={formData.website_url}
                    onChange={(e) => handleInputChange('website_url', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="demo_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Demo URL
                  </label>
                  <input
                    type="url"
                    id="demo_url"
                    value={formData.demo_url}
                    onChange={(e) => handleInputChange('demo_url', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://demo.example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="documentation_url" className="block text-sm font-medium text-gray-700 mb-1">
                    Documentation URL
                  </label>
                  <input
                    type="url"
                    id="documentation_url"
                    value={formData.documentation_url}
                    onChange={(e) => handleInputChange('documentation_url', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://docs.example.com"
                  />
                </div>
                
                <div>
                  <label htmlFor="github_url" className="block text-sm font-medium text-gray-700 mb-1">
                    GitHub URL
                  </label>
                  <input
                    type="url"
                    id="github_url"
                    value={formData.github_url}
                    onChange={(e) => handleInputChange('github_url', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="https://github.com/example"
                  />
                </div>
              </div>
            </div>

            {/* Features and Lists */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Features and Lists</h2>
              
              {/* Features */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('features', index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('features', newFeature);
                          setNewFeature('');
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add a feature"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('features', newFeature);
                        setNewFeature('');
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Pros */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Pros</label>
                <div className="space-y-2">
                  {formData.pros.map((pro, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-green-50 border border-green-300 rounded-md">{pro}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('pros', index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newPro}
                      onChange={(e) => setNewPro(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('pros', newPro);
                          setNewPro('');
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add a pro"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('pros', newPro);
                        setNewPro('');
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Cons */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Cons</label>
                <div className="space-y-2">
                  {formData.cons.map((con, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-red-50 border border-red-300 rounded-md">{con}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('cons', index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCon}
                      onChange={(e) => setNewCon(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('cons', newCon);
                          setNewCon('');
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add a con"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('cons', newCon);
                        setNewCon('');
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Integrations</label>
                <div className="space-y-2">
                  {formData.integrations.map((integration, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <span className="flex-1 px-3 py-2 bg-blue-50 border border-blue-300 rounded-md">{integration}</span>
                      <button
                        type="button"
                        onClick={() => removeArrayItem('integrations', index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <FaTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={newIntegration}
                      onChange={(e) => setNewIntegration(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addArrayItem('integrations', newIntegration);
                          setNewIntegration('');
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Add an integration"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        addArrayItem('integrations', newIntegration);
                        setNewIntegration('');
                      }}
                      className="p-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <FaPlus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status and Settings */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Status & Settings</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status"
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={formData.featured}
                    onChange={(e) => handleInputChange('featured', e.target.checked)}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
                    Featured Product
                  </label>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Categories</h2>
              {loadingCategories ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500 mx-auto"></div>
                  <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableCategories.length > 0 ? (
                    availableCategories.map(category => (
                      <div key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          id={`category-${category.id}`}
                          checked={formData.categories.includes(category.name)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                categories: [...prev.categories, category.name]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                categories: prev.categories.filter(c => c !== category.name)
                              }));
                            }
                          }}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-900 flex items-center">
                          <category.icon className="mr-2 h-4 w-4" />
                          {category.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No categories available. Create categories in Taxonomy page.</p>
                  )}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Tags</h2>
              <div className="space-y-2">
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('tags', index)}
                      className="p-1 text-red-600 hover:text-red-800"
                    >
                      <FaTrash className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addArrayItem('tags', newTag);
                        setNewTag('');
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Add a tag"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      addArrayItem('tags', newTag);
                      setNewTag('');
                    }}
                    className="p-2 text-indigo-600 hover:text-indigo-800"
                  >
                    <FaPlus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => handleInputChange('company_name', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Company name"
                  />
                </div>
                
                <div>
                  <label htmlFor="company_size" className="block text-sm font-medium text-gray-700 mb-1">
                    Company Size
                  </label>
                  <input
                    type="text"
                    id="company_size"
                    value={formData.company_size}
                    onChange={(e) => handleInputChange('company_size', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="e.g., 1-10, 11-50, 51-200"
                  />
                </div>
                
                <div>
                  <label htmlFor="founded_year" className="block text-sm font-medium text-gray-700 mb-1">
                    Founded Year
                  </label>
                  <input
                    type="number"
                    id="founded_year"
                    value={formData.founded_year}
                    onChange={(e) => handleInputChange('founded_year', parseInt(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="2020"
                  />
                </div>
                
                <div>
                  <label htmlFor="headquarters" className="block text-sm font-medium text-gray-700 mb-1">
                    Headquarters
                  </label>
                  <input
                    type="text"
                    id="headquarters"
                    value={formData.headquarters}
                    onChange={(e) => handleInputChange('headquarters', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="San Francisco, CA"
                  />
                </div>
              </div>
            </div>

            {/* SEO */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium text-gray-900">SEO Settings</h2>
                <button
                  type="button"
                  onClick={generateSEOData}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  title="Auto-generate SEO data based on product information"
                >
                  <FaMagic className="mr-2 h-4 w-4" />
                  Auto Generate
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    id="seo_title"
                    value={formData.seo_title}
                    onChange={(e) => handleInputChange('seo_title', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="SEO optimized title"
                  />
                </div>
                
                <div>
                  <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Description
                  </label>
                  <textarea
                    id="seo_description"
                    rows={3}
                    value={formData.seo_description}
                    onChange={(e) => handleInputChange('seo_description', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="SEO meta description"
                  />
                </div>
                
                <div>
                  <label htmlFor="seo_keywords" className="block text-sm font-medium text-gray-700 mb-1">
                    SEO Keywords
                  </label>
                  <input
                    type="text"
                    id="seo_keywords"
                    value={formData.seo_keywords}
                    onChange={(e) => handleInputChange('seo_keywords', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Metadata</h2>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(formData.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span>{new Date(formData.updated_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Product ID:</span>
                  <span className="font-mono text-xs">{formData.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditProductPage;
