import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Search, Filter, Eye, Phone, CreditCard, MapPin, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface UserLog {
  id: string;
  timestamp: Date;
  phoneNumber: string;
  aadharNumber: string;
  photoPath: string;
  status: 'Online' | 'Offline';
  name: string;
  location: string;
}

const AdminUserLogs: React.FC = () => {
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'online' | 'offline'>('all');
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate loading user logs (replace with actual AdminProvider data)
    const logs: UserLog[] = [
      {
        id: '1',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        phoneNumber: '+91 98765 43210',
        aadharNumber: 'XXXX XXXX 9012',
        photoPath: 'assets/images/Praveen.png',
        status: 'Online',
        name: 'Praveen',
        location: 'Jaipur',
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 12 * 60 * 1000),
        phoneNumber: '+91 87654 32109',
        aadharNumber: 'XXXX XXXX 0123',
        photoPath: 'assets/images/Kiran.jpg',
        status: 'Offline',
        name: 'Kiran',
        location: 'Udaipur',
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 25 * 60 * 1000),
        phoneNumber: '+91 76543 21098',
        aadharNumber: 'XXXX XXXX 1234',
        photoPath: 'assets/images/BhalaHarini.jpeg',
        status: 'Offline',
        name: 'Bhala Harini',
        location: 'Jodhpur',
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 75 * 60 * 1000),
        phoneNumber: '+91 65432 10987',
        aadharNumber: 'XXXX XXXX 2345',
        photoPath: 'assets/images/Mithun.jpeg',
        status: 'Offline',
        name: 'Mithun',
        location: 'Kota',
      },
    ];
    setUserLogs(logs);
  }, []);

  const filteredLogs = userLogs.filter(log => {
    const matchesSearch = log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.phoneNumber.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || log.status.toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    
    if (minutes < 60) {
      return `${minutes}m ago`;
    } else if (hours < 24) {
      return `${hours}h ago`;
    } else {
      return timestamp.toLocaleDateString();
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
                placeholder="Search by name, location, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'online' | 'offline')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>

        {/* User Logs Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredLogs.map((log) => (
            <div key={log.id} className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header with status */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <img
                      src={`/src/images/${log.photoPath.split('/').pop()}`}
                      alt={log.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center hidden">
                      <span className="text-lg font-bold text-white">
                        {log.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{log.name}</h3>
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${log.status === 'Online' ? 'bg-green-500' : 'bg-gray-400'}`} />
                        <span className={`text-sm ${log.status === 'Online' ? 'text-green-600' : 'text-gray-500'}`}>
                          {log.status}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatTimestamp(log.timestamp)}
                  </div>
                </div>

                {/* User Details */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{log.phoneNumber}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <CreditCard className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{log.aadharNumber}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-600">{log.location}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
                    <Eye className="h-4 w-4" />
                    <span>View Details</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

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