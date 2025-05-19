// src/components/users/UserActivityModal.js
import React, { useState, useEffect } from 'react';
import { ClockIcon, LogoutIcon, LoginIcon, XIcon } from '@heroicons/react/solid';
import { getUserActivity } from '../../services/userService';

const UserActivityModal = ({ userId, userName, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activityData, setActivityData] = useState(null);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        setLoading(true);
        const data = await getUserActivity(userId);
        setActivityData(data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load user activity data');
        setLoading(false);
      }
    };

    if (userId) {
      fetchActivity();
    }
  }, [userId]);

  // Format date to show date and time nicely
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Get appropriate icon for activity type
  const getActivityIcon = (action) => {
    if (action === 'login') {
      return <LoginIcon className="h-5 w-5 text-green-500" />;
    } else {
      return <LogoutIcon className="h-5 w-5 text-red-500" />;
    }
  };

  return (
    <div className="fixed inset-0 bg-dark-900 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-dark-400 rounded-lg shadow-xl w-full max-w-3xl">
        <div className="p-4 border-b border-dark-300 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">
            {userName}'s Activity
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-dark-300"
          >
            <XIcon className="h-6 w-6 text-white" />
          </button>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 rounded-lg p-4">
              <p className="text-red-500">{error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-dark-300 rounded-lg p-3">
                  <div className="flex items-center">
                    <LoginIcon className="h-5 w-5 text-green-500 mr-2" />
                    <span className="text-gray-300">Last Login:</span>
                  </div>
                  <div className="mt-1 text-white">
                    {formatDateTime(activityData.lastLogin)}
                  </div>
                </div>

                <div className="bg-dark-300 rounded-lg p-3">
                  <div className="flex items-center">
                    <LogoutIcon className="h-5 w-5 text-red-500 mr-2" />
                    <span className="text-gray-300">Last Logout:</span>
                  </div>
                  <div className="mt-1 text-white">
                    {formatDateTime(activityData.lastLogout)}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium text-white mb-2 flex items-center">
                  <ClockIcon className="h-5 w-5 text-primary mr-2" />
                  Activity History
                </h3>
                {activityData.loginHistory && activityData.loginHistory.length > 0 ? (
                  <div className="overflow-y-auto max-h-80 bg-dark-300 rounded-lg">
                    <table className="min-w-full divide-y divide-dark-200">
                      <thead className="bg-dark-300">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">
                            Action
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">
                            Timestamp
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">
                            IP Address
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-primary uppercase tracking-wider">
                            User Agent
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-dark-200">
                        {[...activityData.loginHistory].reverse().map((activity, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-dark-400' : 'bg-dark-500'}>
                            <td className="px-3 py-2 whitespace-nowrap text-sm">
                              <div className="flex items-center">
                                {getActivityIcon(activity.action)}
                                <span className="ml-2 text-white capitalize">
                                  {activity.action}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-white">
                              {formatDateTime(activity.timestamp)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm text-white">
                              {activity.ipAddress || 'N/A'}
                            </td>
                            <td className="px-3 py-2 text-sm text-white truncate max-w-xs">
                              {activity.userAgent || 'N/A'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="bg-dark-300 rounded-lg p-4 text-center text-gray-400">
                    No activity history available
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-dark-300 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-dark-300 text-white rounded-md hover:bg-dark-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityModal;
