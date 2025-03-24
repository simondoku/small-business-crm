// src/pages/ProfilePage.js
import React, { useState } from 'react';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import { updatePassword } from '../services/userService';
import RoleBadge from '../components/common/RoleBadge';

const ProfilePage = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Validation
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    try {
      setLoading(true);
      await updatePassword(formData.currentPassword, formData.newPassword);
      setSuccess('Password updated successfully');
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout title="My Profile">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-dark-400 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Account Information</h2>
          
          <div className="flex items-center mb-6">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-medium mr-4">
              {user?.name?.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-xl font-medium">{user?.name}</h3>
              <p className="text-gray-400">{user?.email}</p>
              <div className="mt-2">
                <RoleBadge role={user?.role} />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-3 py-2 border-b border-dark-300">
              <div className="text-gray-400">User ID</div>
              <div className="col-span-2 truncate">{user?._id}</div>
            </div>
            <div className="grid grid-cols-3 py-2 border-b border-dark-300">
              <div className="text-gray-400">Full Name</div>
              <div className="col-span-2">{user?.name}</div>
            </div>
            <div className="grid grid-cols-3 py-2 border-b border-dark-300">
              <div className="text-gray-400">Email</div>
              <div className="col-span-2">{user?.email}</div>
            </div>
            <div className="grid grid-cols-3 py-2 border-b border-dark-300">
              <div className="text-gray-400">Role</div>
              <div className="col-span-2">{user?.role}</div>
            </div>
          </div>
        </div>
        
        {/* Change Password */}
        <div className="bg-dark-400 rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">Change Password</h2>
          
          {error && (
            <div className="mb-4 bg-red-500 bg-opacity-10 border border-red-500 text-red-500 px-4 py-3 rounded">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-500 bg-opacity-10 border border-green-500 text-green-500 px-4 py-3 rounded">
              <span className="block sm:inline">{success}</span>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300 mb-1">
                New Password
              </label>
              <input
                id="newPassword"
                name="newPassword"
                type="password"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
                Confirm New Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 rounded-md bg-dark-200 text-white focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-md text-white font-medium ${
                  loading ? 'bg-purple-700' : 'bg-primary hover:bg-purple-700'
                }`}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;