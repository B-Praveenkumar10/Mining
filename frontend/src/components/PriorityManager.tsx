import React, { useState } from 'react';
import { Settings, CheckCircle, AlertCircle } from 'lucide-react';
import { PriorityRequest } from '../types';

interface PriorityManagerProps {
  priorities: PriorityRequest[];
  onUpdatePriority: (id: string, updates: Partial<PriorityRequest>) => void;
}

const PriorityManager: React.FC<PriorityManagerProps> = ({ priorities, onUpdatePriority }) => {
  const [editingId, setEditingId] = useState<string | null>(null);

  const priorityOptions = [
    { value: 'grid', label: 'Grid Only', color: 'bg-purple-100 text-purple-800' },
    { value: 'solar', label: 'Solar Priority', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'wind', label: 'Wind Priority', color: 'bg-blue-100 text-blue-800' },
    { value: 'solar+wind', label: 'Solar + Wind', color: 'bg-green-100 text-green-800' },
    { value: 'solar+wind+grid', label: 'All Sources', color: 'bg-gray-100 text-gray-800' }
  ];

  const getTypeLabel = (type: PriorityRequest['type']) => {
    switch (type) {
      case 'exam_center': return '🏫 Exam Center';
      case 'classroom': return '📚 Classroom';
      case 'hostel': return '🏠 Hostel';
      case 'lab': return '🔬 Research Lab';
      case 'office': return '🏢 Administrative Office';
    }
  };

  const getPriorityColor = (priority: PriorityRequest['priority']) => {
    switch (priority) {
      case 'grid': return 'border-purple-300 bg-purple-50';
      case 'solar': return 'border-yellow-300 bg-yellow-50';
      case 'wind': return 'border-blue-300 bg-blue-50';
      case 'solar+wind': return 'border-green-300 bg-green-50';
      case 'solar+wind+grid': return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
        <Settings className="h-5 w-5" />
        <span>Request-Based Priority Management</span>
      </h3>

      <div className="space-y-4">
        {priorities.map((priority) => (
          <div
            key={priority.id}
            className={`p-4 rounded-lg border-2 transition-all ${getPriorityColor(priority.priority)} ${
              priority.active ? 'opacity-100' : 'opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <span className="font-medium text-gray-800">{getTypeLabel(priority.type)}</span>
                {priority.active ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => setEditingId(editingId === priority.id ? null : priority.id)}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {editingId === priority.id ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editingId === priority.id ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    JVVNL Consumer ID
                  </label>
                  <input
                    type="text"
                    value={priority.jvvnlId || ''}
                    onChange={(e) => onUpdatePriority(priority.id, {
                      jvvnlId: e.target.value
                    })}
                    placeholder="Enter JVVNL ID"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Energy Priority
                  </label>
                  <select
                    value={priority.priority}
                    onChange={(e) => onUpdatePriority(priority.id, {
                      priority: e.target.value as PriorityRequest['priority']
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {priority.type === 'hostel' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Occupancy (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={priority.occupancy || 0}
                      onChange={(e) => onUpdatePriority(priority.id, {
                        occupancy: Number(e.target.value)
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`active-${priority.id}`}
                    checked={priority.active}
                    onChange={(e) => onUpdatePriority(priority.id, {
                      active: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor={`active-${priority.id}`} className="text-sm text-gray-700">
                    Active Priority
                  </label>
                </div>
              </div>
            ) : (
              <div className="text-sm text-gray-600">
                {priority.jvvnlId && (
                  <div className="mb-2 text-xs text-gray-500">
                    JVVNL ID: {priority.jvvnlId}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span>Priority: <span className="font-medium">
                    {priorityOptions.find(o => o.value === priority.priority)?.label}
                  </span></span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    priority.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {priority.active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {priority.type === 'hostel' && priority.occupancy !== undefined && (
                  <div className="mt-1">Occupancy: {priority.occupancy}%</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Static Priority Rules */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <h4 className="font-medium text-blue-800 mb-2">Priority Rules</h4>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Exam Centers: Grid priority for reliability</li>
          <li>• Classrooms: Solar priority during day hours</li>
          <li>• Hostels: Occupancy-based priority (grid when 80% occupied)</li>
          <li>• Research Labs: Solar + Wind priority</li>
          <li>• Offices: Grid priority during business hours</li>
        </ul>
      </div>
    </div>
  );
};

export default PriorityManager;
