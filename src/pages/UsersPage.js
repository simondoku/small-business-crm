// src/pages/UsersPage.js
import React, { useState, useEffect } from 'react';
import { TrashIcon, PencilIcon, ClockIcon, UserAddIcon, XIcon, ExclamationIcon } from '@heroicons/react/solid';
import MainLayout from '../components/layout/MainLayout';
import LoadingScreen from '../components/common/LoadingScreen';
import RoleBadge from '../components/common/RoleBadge';
import AccessRestricted from '../components/common/AccessRestricted';
import UserActivityModal from '../components/users/UserActivityModal';
import { getUsers, createUser, updateUser, deleteUser } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const UsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Form state for adding/editing user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'staff'
  });
  const [formError, setFormError] = useState(null);
  const [formSuccess, setFormSuccess] = useState(null);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setActionLoading(true);
    
    try {
      // Basic validation
      if (!formData.name || !formData.email || !formData.password) {
        setFormError('All fields are required');
        setActionLoading(false);
        return;
      }
      
      const result = await createUser(formData);
      
      // Add new user to the list
      setUsers([...users, result]);
      setFormSuccess('User created successfully');
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'staff'
      });
      
      // Close modal after a delay
      setTimeout(() => {
        setShowAddModal(false);
        setFormSuccess(null);
      }, 2000);
      
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditClick = (user) => {
    // Don't include password in form data for edit
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '' // Empty password field, will only update if filled
    });
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);
    setActionLoading(true);
    
    try {
      if (!formData.name || !formData.email) {
        setFormError('Name and email are required');
        setActionLoading(false);
        return;
      }
      
      // Create update data object - only include password if provided
      const updateData = {
        name: formData.name,
        email: formData.email,
        role: formData.role
      };
      
      if (formData.password) {
        updateData.password = formData.password;
      }
      
      const result = await updateUser(selectedUser._id, updateData);
      
      // Update the user in the list - ensure we're using the returned data
      setUsers(users.map(user => 
        user._id === selectedUser._id ? { ...user, ...result } : user
      ));
      
      setFormSuccess('User updated successfully');
      
      // Close modal after a delay
      setTimeout(() => {
        setShowEditModal(false);
        setSelectedUser(null);
        setFormSuccess(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error updating user:', err);
      setFormError(err.response?.data?.message || 'Failed to update user');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDeleteUser = async () => {
    setActionLoading(true);
    
    try {
      await deleteUser(selectedUser._id);
      
      // Remove the user from the list
      setUsers(users.filter(user => user._id !== selectedUser._id));
      
      // Close modal
      setShowDeleteModal(false);
      setSelectedUser(null);
      
    } catch (err) {
      // Show error in delete modal
      setError('Failed to delete user. ' + (err.response?.data?.message || ''));
      setActionLoading(false);
    }
  };

  const handleViewActivity = (user) => {
    setSelectedUser(user);
    setShowActivityModal(true);
  };

  const handleCloseActivityModal = () => {
    setShowActivityModal(false);
    setSelectedUser(null);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'staff'
    });
    setFormError(null);
    setFormSuccess(null);
  };

  if (loading) {
    return <LoadingScreen message="Loading users..." />;
  }

  return (
    <AccessRestricted requiredRole="admin">
      <MainLayout title="User Management">
        {error && !showDeleteModal ? (
          <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4 mb-4">
            <p className="text-red-500">{error}</p>
          </div>
        ) : (
          <div className="bg-dark-400 rounded-lg overflow-hidden">
            <div className="p-4 flex justify-between items-center">
              <h2 className="text-lg font-medium">System Users</h2>
              <button 
                className="px-4 py-2 bg-primary text-white rounded-md flex items-center"
                onClick={() => {
                  resetForm();
                  setShowAddModal(true);
                }}
              >
                <UserAddIcon className="h-5 w-5 mr-2" />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-primary uppercase tracking-wider">Last Login</th>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button 
                            className="bg-dark-200 p-2 rounded-md hover:bg-primary"
                            onClick={() => handleViewActivity(user)}
                            title="View activity history"
                          >
                            <ClockIcon className="h-4 w-4 text-white" />
                          </button>
                          <button 
                            className="bg-dark-200 p-2 rounded-md hover:bg-dark-100"
                            onClick={() => handleEditClick(user)}
                            title="Edit user"
                            disabled={user._id === currentUser?._id}
                          >
                            <PencilIcon className="h-4 w-4 text-white" />
                          </button>
                          <button 
                            className="bg-dark-200 p-2 rounded-md hover:bg-red-700"
                            onClick={() => handleDeleteClick(user)}
                            title="Delete user"
                            disabled={user._id === currentUser?._id}
                          >
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

        {/* Add User Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-dark-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-dark-400 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b border-dark-300 flex justify-between">
                <h2 className="text-xl font-semibold text-white">Add New User</h2>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleAddUser} className="p-4">
                {formError && (
                  <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 mb-4">
                    <p className="text-red-500 text-sm">{formError}</p>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3 mb-4">
                    <p className="text-green-500 text-sm">{formSuccess}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-200"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-dark-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-dark-400 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b border-dark-300 flex justify-between">
                <h2 className="text-xl font-semibold text-white">Edit User: {selectedUser.name}</h2>
                <button 
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>
              
              <form onSubmit={handleEditUser} className="p-4">
                {formError && (
                  <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 mb-4">
                    <p className="text-red-500 text-sm">{formError}</p>
                  </div>
                )}
                
                {formSuccess && (
                  <div className="bg-green-500 bg-opacity-10 border border-green-500 rounded-lg p-3 mb-4">
                    <p className="text-green-500 text-sm">{formSuccess}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                    required
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                    placeholder="Leave blank to keep current password"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    Leave blank to keep the current password
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-300 text-sm font-medium mb-2">
                    Role
                  </label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    className="w-full bg-dark-300 border border-dark-200 rounded-md py-2 px-3 text-white"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-200"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700 flex items-center"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : 'Update User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Delete User Confirmation Modal */}
        {showDeleteModal && selectedUser && (
          <div className="fixed inset-0 bg-dark-900 bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-dark-400 rounded-lg shadow-xl w-full max-w-md">
              <div className="p-4 border-b border-dark-300">
                <h2 className="text-xl font-semibold text-white flex items-center">
                  <ExclamationIcon className="h-6 w-6 text-red-500 mr-2" />
                  Delete User
                </h2>
              </div>
              
              <div className="p-4">
                {error && (
                  <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-3 mb-4">
                    <p className="text-red-500 text-sm">{error}</p>
                  </div>
                )}
                
                <p className="text-white mb-4">
                  Are you sure you want to delete <span className="font-semibold">{selectedUser.name}</span>?
                </p>
                <p className="text-gray-400 text-sm mb-6">
                  This action cannot be undone, and all user data will be permanently removed.
                </p>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedUser(null);
                      setError(null);
                    }}
                    className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-200"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteUser}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Deleting...
                      </>
                    ) : 'Delete User'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* User Activity Modal */}
        {showActivityModal && selectedUser && (
          <UserActivityModal
            userId={selectedUser._id}
            userName={selectedUser.name}
            onClose={handleCloseActivityModal}
          />
        )}
      </MainLayout>
    </AccessRestricted>
  );
};

export default UsersPage;