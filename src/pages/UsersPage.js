// src/pages/UsersPage.js
import React, { useState, useEffect } from 'react';
import { TrashIcon, PencilIcon } from '@heroicons/react/solid';
import MainLayout from '../components/layout/MainLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import RoleBadge from '../components/common/RoleBadge';
import AccessRestricted from '../components/common/AccessRestricted';
import { getUsers } from '../services/userService';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await getUsers();
        setUsers(data);
      } catch (err) {
        setError('Failed to load users. You may not have permission to view this page.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) {
    return <LoadingScreen message="Loading users..." />;
  }

  return (
    <AccessRestricted requiredRole="admin">
      <MainLayout title="User Management">
        {error ? (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="bg-dark-400 rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">System Users</h2>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md"
                onClick={() => {/* Add user functionality */}}
              >
                Add New User
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-dark-200">
                <thead className="bg-dark-300">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-200">
                  {users.map((user, index) => (
                    <tr key={user._id} className={index % 2 === 0 ? 'bg-dark-400' : 'bg-dark-500'}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium">{user.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button className="bg-dark-200 p-2 rounded-md hover:bg-dark-100">
                            <PencilIcon className="h-4 w-4 text-white" />
                          </button>
                          <button className="bg-dark-200 p-2 rounded-md hover:bg-red-700">
                            <TrashIcon className="h-4 w-4 text-white" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </MainLayout>
    </AccessRestricted>
  );
};

export default UsersPage;