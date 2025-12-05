import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, Filter, Eye, Phone, CreditCard, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface UserLog {
  _id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  last_login?: Date;
  created_at: Date;
  is_active: boolean;
}

const AdminUserLogs: React.FC = () => {
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserLogs = async () => {
      try {
        const response = await api.get('/users/logs');
        setUserLogs(response.data.users);
      } catch (error) {
        console.error('Failed to fetch user logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserLogs();
  }, []);

  const filteredLogs = userLogs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && log.is_active) ||
                         (statusFilter === 'inactive' && !log.is_active);
    return matchesSearch && matchesStatus;
  });

  const formatTimestamp = (timestamp?: Date) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate(-1)}
                className="mr-4 p-2 text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-blue-500" />
                <h1 className="text-xl font-semibold text-gray-800">User Activity Logs</h1>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {filteredLogs.length} users
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, username, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading user logs...</p>
          </div>
        ) : (
          /* User Logs Grid */
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredLogs.map((log) => (
              <div key={log._id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header with status */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-white">
                          {log.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{log.name}</h3>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${log.is_active ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className={`text-sm ${log.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                            {log.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center text-gray-400 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      {formatTimestamp(log.last_login)}
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 text-sm">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{log.username}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <CreditCard className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600 capitalize">{log.role}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{log.email}</span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-500">
                      Joined: {new Date(log.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserLogs;