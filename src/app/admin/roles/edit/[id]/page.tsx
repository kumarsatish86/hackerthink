'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// Define the Role interface
interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Permission[];
  created_at: string;
  updated_at: string;
}

// Define Permission interface
interface Permission {
  id: string;
  name: string;
  key: string;
  module: string;
}

// Define the RoleData type for input forms
type RoleData = {
  name: string;
  description: string;
  permissions: string[]; // IDs of permissions
};

export default function EditRole({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleId = params.id;
  
  // State for role data
  const [role, setRole] = useState<Role | null>(null);
  const [roleData, setRoleData] = useState<RoleData>({
    name: '',
    description: '',
    permissions: [],
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Check user session and fetch data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchPermissions();
        loadRoleData();
      }
    }
  }, [status, session, router, roleId, searchParams]);

  // Load role data from URL parameters or fetch from API
  const loadRoleData = () => {
    try {
      setLoading(true);
      const roleData = searchParams.get('data');
      
      if (roleData) {
        const parsedRole: Role = JSON.parse(decodeURIComponent(roleData));
        setRole(parsedRole);
        setRoleData({
          name: parsedRole.name,
          description: parsedRole.description,
          permissions: parsedRole.permissions.map(p => p.id),
        });
      } else {
        // In a real application, you would fetch role data from the API
        setError('Role data not provided. Redirecting to roles page...');
        setTimeout(() => {
          router.push('/admin/roles');
        }, 2000);
      }
    } catch (err) {
      console.error('Error loading role data:', err);
      setError('Failed to load role data. Redirecting to roles page...');
      setTimeout(() => {
        router.push('/admin/roles');
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch available permissions
  const fetchPermissions = async () => {
    try {
      // Example permissions - in a real app, this would be an API call
      const examplePermissions: Permission[] = [
        { id: '1', name: 'View Dashboard', key: 'dashboard.view', module: 'Dashboard' },
        { id: '2', name: 'Manage Users', key: 'users.manage', module: 'Users' },
        { id: '3', name: 'Manage Roles', key: 'roles.manage', module: 'Roles' },
        { id: '4', name: 'Edit Content', key: 'content.edit', module: 'Content' },
        { id: '5', name: 'Create Content', key: 'content.create', module: 'Content' },
        { id: '6', name: 'Delete Content', key: 'content.delete', module: 'Content' },
        { id: '7', name: 'Manage Settings', key: 'settings.manage', module: 'Settings' },
        { id: '8', name: 'Manage Comments', key: 'comments.manage', module: 'Comments' },
      ];
      
      setPermissions(examplePermissions);
    } catch (err) {
      console.error('Error fetching permissions:', err);
      setError('Failed to load permissions.');
    }
  };

  // Handle role form submission
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      if (role) {
        console.log('Updating role with data:', roleData);
        
        // In a real app, you would make an API call to update the role
        // For example: await fetch(`/api/roles/${roleId}`, { method: 'PUT', body: JSON.stringify(roleData) });
        
        // For now, just show a success message and redirect
        alert('Role updated successfully!');
        router.push('/admin/roles');
      }
    } catch (error) {
      console.error('Error saving role:', error);
      setError('Failed to save role. Please try again.');
      setSubmitLoading(false);
    }
  };

  // Handle permission selection
  const handlePermissionChange = (permissionId: string) => {
    setRoleData(prev => {
      const isSelected = prev.permissions.includes(permissionId);
      if (isSelected) {
        return {
          ...prev,
          permissions: prev.permissions.filter(id => id !== permissionId)
        };
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, permissionId]
        };
      }
    });
  };

  // Handle module-based permission selection
  const handleModulePermissionsChange = (module: string, checked: boolean) => {
    const modulePermissions = permissions.filter(p => p.module === module).map(p => p.id);
    
    setRoleData(prev => {
      if (checked) {
        // Add all module permissions that aren't already selected
        const newPermissions = [...prev.permissions];
        modulePermissions.forEach(id => {
          if (!newPermissions.includes(id)) {
            newPermissions.push(id);
          }
        });
        return { ...prev, permissions: newPermissions };
      } else {
        // Remove all module permissions
        return {
          ...prev,
          permissions: prev.permissions.filter(id => !modulePermissions.includes(id))
        };
      }
    });
  };

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  if (loading && status !== 'loading') {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Role</h1>
          <p className="text-gray-600">Modify role details and permissions</p>
        </div>
        <Link
          href="/admin/roles"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Back to Roles
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-6">
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

      <div className="bg-white shadow rounded-lg">
        <form onSubmit={handleRoleSubmit}>
          <div className="p-6 space-y-6">
            <div>
              <label htmlFor="role-name" className="block text-sm font-medium text-gray-700">
                Role Name
              </label>
              <input
                type="text"
                id="role-name"
                value={roleData.name}
                onChange={(e) => setRoleData({...roleData, name: e.target.value})}
                required
                className="mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label htmlFor="role-description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="role-description"
                value={roleData.description}
                onChange={(e) => setRoleData({...roleData, description: e.target.value})}
                rows={3}
                className="mt-1 block w-full py-2 px-3 rounded-md border border-gray-300 shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Permissions
              </label>
              <div className="border rounded-md p-4 max-h-96 overflow-y-auto">
                {Object.entries(permissionsByModule).map(([module, modulePermissions]) => (
                  <div key={module} className="mb-6 last:mb-0">
                    <div className="flex items-center mb-2">
                      <input
                        type="checkbox"
                        id={`module-${module}`}
                        checked={modulePermissions.every(p => roleData.permissions.includes(p.id))}
                        onChange={(e) => handleModulePermissionsChange(module, e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor={`module-${module}`} className="ml-2 block text-sm font-medium text-gray-700 cursor-pointer">
                        {module}
                      </label>
                    </div>
                    <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-2">
                      {modulePermissions.map((permission) => (
                        <div key={permission.id} className="flex items-center">
                          <input
                            type="checkbox"
                            id={`permission-${permission.id}`}
                            checked={roleData.permissions.includes(permission.id)}
                            onChange={() => handlePermissionChange(permission.id)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                          />
                          <label htmlFor={`permission-${permission.id}`} className="ml-2 block text-sm text-gray-700 cursor-pointer">
                            {permission.name} <span className="text-gray-400 text-xs">({permission.key})</span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="px-6 py-4 bg-gray-50 flex justify-end space-x-3 rounded-b-lg">
            <Link
              href="/admin/roles"
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitLoading}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${submitLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
            >
              {submitLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 