import React from 'react';
import type { StoredUser } from '../types/auth';

interface AdminDashboardProps {
  users: StoredUser[];
  onLogout: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, onLogout }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🔐 Admin Dashboard
              </h1>
              <p className="text-gray-600">
                Manage registered users and system information
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-sm text-red-600 hover:text-red-500 px-4 py-2 rounded-md hover:bg-red-50 transition-colors border border-red-200"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Registered Users ({users.length})
            </h2>
          </div>
          
          {users.length === 0 ? (
            <div className="px-6 py-8 text-center text-gray-500">
              No users registered yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Password Hash
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                        {user.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.dateCreated)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400">
                        {user.passwordHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">System Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{users.length}</div>
              <div className="text-sm text-blue-800">Total Users</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {users.filter(u => {
                  const created = new Date(u.dateCreated);
                  const today = new Date();
                  const diffTime = Math.abs(today.getTime() - created.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 7;
                }).length}
              </div>
              <div className="text-sm text-green-800">New This Week</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {users.length > 0 ? formatDate(users.sort((a, b) => 
                  new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()
                )[0].dateCreated) : 'N/A'}
              </div>
              <div className="text-sm text-purple-800">Latest Registration</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
