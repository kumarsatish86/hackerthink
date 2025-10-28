'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
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

export default function RoleManagement() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State for role data
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for search
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for role modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [roleData, setRoleData] = useState<RoleData>({
    name: '',
    description: '',
    permissions: [],
  });

  // Check user session and fetch data
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      if (session?.user?.role !== 'admin') {
        router.push('/dashboard');
      } else {
        fetchRoles();
        fetchPermissions();
      }
    }
  }, [status, session, router]);

  // Fetch roles from the API
  const fetchRoles = async () => {
    try {
      setLoading(true);
      
      // Example roles - in a real app, this would be an API call
      const exampleRoles: Role[] = [
        {
          id: '1',
          name: 'Admin',
          description: 'Full access to all features',
          permissions: [
            { id: '1', name: 'View Dashboard', key: 'dashboard.view', module: 'Dashboard' },
            { id: '2', name: 'Manage Users', key: 'users.manage', module: 'Users' },
            { id: '3', name: 'Manage Roles', key: 'roles.manage', module: 'Roles' },
            { id: '4', name: 'Edit Content', key: 'content.edit', module: 'Content' },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Editor',
          description: 'Can edit and publish content',
          permissions: [
            { id: '1', name: 'View Dashboard', key: 'dashboard.view', module: 'Dashboard' },
            { id: '4', name: 'Edit Content', key: 'content.edit', module: 'Content' },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Author',
          description: 'Can create content but not publish it',
          permissions: [
            { id: '1', name: 'View Dashboard', key: 'dashboard.view', module: 'Dashboard' },
            { id: '5', name: 'Create Content', key: 'content.create', module: 'Content' },
          ],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ];
      
      setRoles(exampleRoles);
    } catch (err) {
      console.error('Error fetching roles:', err);
      setError('Failed to load roles. Please try again later.');
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
    }
  };

  // Filter roles based on search term
  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Open modal for creating a new role
  const openCreateModal = () => {
    router.push('/admin/roles/create');
  };

  // Open edit page for editing an existing role
  const navigateToEditRole = (role: Role) => {
    router.push(`/admin/roles/edit/${role.id}?data=${encodeURIComponent(JSON.stringify(role))}`);
  };

  // Handle role form submission
  const handleRoleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted. Role data:', roleData);
    try {
      if (editingRole) {
        console.log('Updating existing role:', editingRole.id);
        // Update existing role
        const updatedRole: Role = {
          ...editingRole,
          name: roleData.name,
          description: roleData.description,
          permissions: permissions.filter(p => roleData.permissions.includes(p.id)),
          updated_at: new Date().toISOString(),
        };
        
        console.log('Updated role:', updatedRole);
        
        // Update role in the list
        setRoles(roles.map(r => r.id === updatedRole.id ? updatedRole : r));
        
        // Show success message
        setError(null);
        alert('Role updated successfully!');
      } else {
        // Create new role
        const newRole: Role = {
          id: `role-${Date.now()}`,
          name: roleData.name,
          description: roleData.description,
          permissions: permissions.filter(p => roleData.permissions.includes(p.id)),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        // Add new role to the list
        setRoles([...roles, newRole]);
        
        // Show success message
        setError(null);
        alert('Role created successfully!');
      }
      
      // Close the modal
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving role:', error);
      setError('Failed to save role. Please try again.');
    }
  };

  // Handle role deletion
  const handleDeleteRole = async (roleId: string) => {
    if (window.confirm('Are you sure you want to delete this role?')) {
      try {
        // Remove role from the list
        setRoles(roles.filter(r => r.id !== roleId));
      } catch (error) {
        console.error('Error deleting role:', error);
        setError('Failed to delete role. Please try again.');
      }
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
          <h1 className="text-2xl font-bold text-gray-900">Role Management</h1>
          <p className="text-gray-600">Manage user roles and permissions</p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add New Role
        </button>
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

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex items-center">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredRoles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    No roles found. {searchTerm && 'Try a different search query.'}
                  </td>
                </tr>
              ) : (
                filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{role.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-500">{role.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission) => (
                          <span key={permission.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {permission.name}
                          </span>
                        ))}
                        {role.permissions.length > 3 && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            +{role.permissions.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(role.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => navigateToEditRole(role)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 