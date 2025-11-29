import React, { useState } from 'react';
import { ArrowLeft, Trophy, Medal, Award, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserProvider';

const PointsLeaderboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overall' | 'regional'>('overall');
  const navigate = useNavigate();
  const { leaderboard, userData } = useUser();

  const regionalLeaderboards = {
    'Circuit A': [
      { id: '1', name: 'Rajesh Sharma', points: 2450, renewableUsage: 89.2, rank: 1 },
      { id: '6', name: 'Praveen Kumar', points: 1850, renewableUsage: 78.5, rank: 2 },
      { id: '7', name: 'Anita Verma', points: 1720, renewableUsage: 76.8, rank: 3 },
      { id: '8', name: 'Suresh Gupta', points: 1650, renewableUsage: 74.2, rank: 4 }
    ],
    'Circuit B': [
      { id: '2', name: 'Priya Gupta', points: 2380, renewableUsage: 87.5, rank: 1 },
      { id: '9', name: 'Mohan Lal', points: 1980, renewableUsage: 82.1, rank: 2 },
      { id: '10', name: 'Kavita Singh', points: 1850, renewableUsage: 79.3, rank: 3 }
    ],
    'Circuit C': [
      { id: '3', name: 'Amit Singh', points: 2290, renewableUsage: 85.1, rank: 1 },
      { id: '11', name: 'Ravi Kumar', points: 2100, renewableUsage: 83.7, rank: 2 },
      { id: '12', name: 'Deepika Jain', points: 1920, renewableUsage: 80.9, rank: 3 }
    ],
    'Circuit D': [
      { id: '4', name: 'Sunita Devi', points: 2150, renewableUsage: 82.3, rank: 1 },
      { id: '13', name: 'Mahesh Sharma', points: 1890, renewableUsage: 78.6, rank: 2 },
      { id: '14', name: 'Pooja Agarwal', points: 1750, renewableUsage: 75.4, rank: 3 }
    ],
    'Circuit E': [
      { id: '5', name: 'Vikram Rathore', points: 2050, renewableUsage: 80.7, rank: 1 },
      { id: '15', name: 'Sanjay Bishnoi', points: 1820, renewableUsage: 77.2, rank: 2 },
      { id: '16', name: 'Meera Joshi', points: 1690, renewableUsage: 73.8, rank: 3 }
    ]
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Award className="h-6 w-6 text-orange-500" />;
      default:
        return (
          <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {rank}
          </div>
        );
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'from-yellow-400 to-yellow-600';
      case 2:
        return 'from-gray-300 to-gray-500';
      case 3:
        return 'from-orange-400 to-orange-600';
      default:
        return 'from-blue-400 to-blue-600';
    }
  };

  const renderPodium = (users: any[]) => {
    const topThree = users.slice(0, 3);
    
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <h3 className="text-lg font-semibold text-center mb-6">Top Performers</h3>
        <div className="flex items-end justify-center space-x-4">
          {/* Second Place */}
          {topThree[1] && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-xl font-bold text-white">
                  {topThree[1].name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="bg-gray-100 rounded-lg p-3 h-20 flex flex-col justify-center">
                <Medal className="h-6 w-6 text-gray-400 mx-auto mb-1" />
                <p className="font-semibold text-sm">{topThree[1].name}</p>
                <p className="text-xs text-gray-600">{topThree[1].points} pts</p>
              </div>
            </div>
          )}

          {/* First Place */}
          {topThree[0] && (
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-2xl font-bold text-white">
                  {topThree[0].name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 h-24 flex flex-col justify-center border-2 border-yellow-200">
                <Crown className="h-8 w-8 text-yellow-500 mx-auto mb-1" />
                <p className="font-bold text-sm">{topThree[0].name}</p>
                <p className="text-xs text-gray-600">{topThree[0].points} pts</p>
              </div>
            </div>
          )}

          {/* Third Place */}
          {topThree[2] && (
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-2 mx-auto">
                <span className="text-xl font-bold text-white">
                  {topThree[2].name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 h-20 flex flex-col justify-center border border-orange-200">
                <Award className="h-6 w-6 text-orange-500 mx-auto mb-1" />
                <p className="font-semibold text-sm">{topThree[2].name}</p>
                <p className="text-xs text-gray-600">{topThree[2].points} pts</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderUserList = (users: any[]) => (
    <div className="space-y-3">
      {users.map((user, index) => (
        <div
          key={user.id}
          className={`bg-white rounded-xl p-4 shadow-sm border transition-all hover:shadow-md ${
            user.name === userData.name ? 'ring-2 ring-blue-500 bg-blue-50' : ''
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                {getRankIcon(user.rank)}
                <div className={`w-12 h-12 bg-gradient-to-br ${getRankColor(user.rank)} rounded-full flex items-center justify-center`}>
                  <span className="text-lg font-bold text-white">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-800">{user.name}</h4>
                  {user.name === userData.name && (
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      YOU
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  {activeTab === 'overall' ? leaderboard.find(u => u.name === user.name)?.region || 'Mining Operations' : 'Local Circuit'}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-blue-600">{user.points}</p>
              <p className="text-sm text-gray-600">{user.renewableUsage}% efficiency</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h1 className="text-xl font-semibold text-gray-800">Leaderboard</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Switcher */}
        <div className="bg-white rounded-xl shadow-sm border mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('overall')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'overall'
                  ? 'bg-blue-500 text-white rounded-l-xl'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Overall Rankings
            </button>
            <button
              onClick={() => setActiveTab('regional')}
              className={`flex-1 py-4 px-6 text-center font-medium transition-colors ${
                activeTab === 'regional'
                  ? 'bg-blue-500 text-white rounded-r-xl'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Circuit Rankings
            </button>
          </div>
        </div>

        {activeTab === 'overall' ? (
          <div>
            {renderPodium(leaderboard)}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">All Rankings</h3>
              {renderUserList(leaderboard)}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(regionalLeaderboards).map(([region, users]) => (
              <div key={region} className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                  <span>{region}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    {users.length} users
                  </span>
                </h3>
                {renderUserList(users)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PointsLeaderboard;