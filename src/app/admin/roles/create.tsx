"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Permission {
  id: string;
  name: string;
  key: string;
  module: string;
}

type RoleData = {
  name: string;
  description: string;
  permissions: string[];
};

export default function CreateRolePage() {
  const router = useRouter();
  const [roleData, setRoleData] = useState<RoleData>({
    name: "",
    description: "",
    permissions: [],
  });
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Simulate fetching permissions
    setTimeout(() => {
      setPermissions([
        { id: '1', name: 'View Dashboard', key: 'dashboard.view', module: 'Dashboard' },
        { id: '2', name: 'Manage Users', key: 'users.manage', module: 'Users' },
        { id: '3', name: 'Manage Roles', key: 'roles.manage', module: 'Roles' },
        { id: '4', name: 'Edit Content', key: 'content.edit', module: 'Content' },
        { id: '5', name: 'Create Content', key: 'content.create', module: 'Content' },
        { id: '6', name: 'Delete Content', key: 'content.delete', module: 'Content' },
        { id: '7', name: 'Manage Settings', key: 'settings.manage', module: 'Settings' },
        { id: '8', name: 'Manage Comments', key: 'comments.manage', module: 'Comments' },
      ]);
      setLoading(false);
    }, 300);
  }, []);

  // Group permissions by module
  const permissionsByModule = permissions.reduce((acc, perm) => {
    acc[perm.module] = acc[perm.module] || [];
    acc[perm.module].push(perm);
    return acc;
  }, {} as Record<string, Permission[]>);

  const handlePermissionChange = (permissionId: string) => {
    setRoleData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }));
  };

  const handleModulePermissionsChange = (module: string, checked: boolean) => {
    const modulePerms = permissionsByModule[module]?.map((p) => p.id) || [];
    setRoleData((prev) => ({
      ...prev,
      permissions: checked
        ? Array.from(new Set([...prev.permissions, ...modulePerms]))
        : prev.permissions.filter((id) => !modulePerms.includes(id)),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      router.push("/admin/roles");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-8 px-4">
      <div className="w-full max-w-xl bg-white rounded-xl shadow-lg p-8">
        <h1 className="text-2xl font-bold mb-6 text-red-700">Create New Role</h1>
        {success ? (
          <div className="text-green-600 text-center font-semibold py-8">
            Role created successfully! Redirecting...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
              <input
                type="text"
                value={roleData.name}
                onChange={(e) => setRoleData({ ...roleData, name: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={roleData.description}
                onChange={(e) => setRoleData({ ...roleData, description: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Permissions</label>
              {loading ? (
                <div className="text-gray-400">Loading permissions...</div>
              ) : (
                <div className="max-h-56 overflow-y-auto border rounded-md p-2 bg-gray-50">
                  {Object.entries(permissionsByModule).map(([module, perms]) => (
                    <div key={module} className="mb-3">
                      <div className="flex items-center mb-1">
                        <input
                          type="checkbox"
                          id={`module-${module}`}
                          checked={perms.every((p) => roleData.permissions.includes(p.id))}
                          onChange={(e) => handleModulePermissionsChange(module, e.target.checked)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                        />
                        <label htmlFor={`module-${module}`} className="ml-2 text-sm font-semibold text-gray-700 cursor-pointer">
                          {module}
                        </label>
                      </div>
                      <div className="ml-6 space-y-1">
                        {perms.map((permission) => (
                          <div key={permission.id} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`perm-${permission.id}`}
                              checked={roleData.permissions.includes(permission.id)}
                              onChange={() => handlePermissionChange(permission.id)}
                              className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded cursor-pointer"
                            />
                            <label htmlFor={`perm-${permission.id}`} className="ml-2 text-sm text-gray-700 cursor-pointer">
                              {permission.name} <span className="text-gray-400 text-xs">({permission.key})</span>
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Link href="/admin/roles" className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">Cancel</Link>
              <button
                type="submit"
                className="px-4 py-2 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                disabled={loading}
              >
                Create Role
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
} 
