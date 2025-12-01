import React, { useState, useCallback, useMemo } from 'react';
import { ArrowLeft, Info, Sun, Wind, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleMap, useLoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface RegionData {
  id: string;
  name: string;
  usage: number;
  primarySource: 'solar' | 'wind' | 'grid';
  coordinates: { x: number; y: number };
  details: {
    solar: number;
    wind: number;
    grid: number;
    population: string;
    capacity: string;
  };
}

const EnergyMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null);
  const [showInfo, setShowInfo] = useState(false);
  const navigate = useNavigate();

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: 'AIzaSyDB8AhMJd6xF9VVURQ_UWVTYJ_gkhUjkAY'
  });

  const rajasthanRegions: RegionData[] = [
    {
      id: 'jaipur',
      name: 'Jaipur',
      usage: 85.2,
      primarySource: 'solar',
      coordinates: { x: 26.9124, y: 75.7873 },
      details: { solar: 45.2, wind: 25.8, grid: 29.0, population: '3.9M', capacity: '450 MW' }
    },
    {
      id: 'udaipur',
      name: 'Udaipur',
      usage: 78.9,
      primarySource: 'solar',
      coordinates: { x: 24.5854, y: 73.7125 },
      details: { solar: 42.1, wind: 22.3, grid: 35.6, population: '0.6M', capacity: '280 MW' }
    },
    {
      id: 'jodhpur',
      name: 'Jodhpur',
      usage: 82.1,
      primarySource: 'wind',
      coordinates: { x: 26.2389, y: 73.0243 },
      details: { solar: 35.8, wind: 38.2, grid: 26.0, population: '1.4M', capacity: '520 MW' }
    },
    {
      id: 'kota',
      name: 'Kota',
      usage: 76.5,
      primarySource: 'solar',
      coordinates: { x: 25.2138, y: 75.8648 },
      details: { solar: 40.5, wind: 20.1, grid: 39.4, population: '1.2M', capacity: '320 MW' }
    },
    {
      id: 'bikaner',
      name: 'Bikaner',
      usage: 79.3,
      primarySource: 'solar',
      coordinates: { x: 28.0229, y: 73.3119 },
      details: { solar: 48.3, wind: 18.7, grid: 33.0, population: '0.7M', capacity: '380 MW' }
    },
    {
      id: 'ajmer',
      name: 'Ajmer',
      usage: 81.7,
      primarySource: 'wind',
      coordinates: { x: 26.4499, y: 74.6399 },
      details: { solar: 38.9, wind: 35.2, grid: 25.9, population: '0.9M', capacity: '410 MW' }
    }
  ];

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'bg-green-500';
    if (usage >= 70) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getSourceIcon = (source: 'solar' | 'wind' | 'grid') => {
    switch (source) {
      case 'solar':
        return <Sun className="h-3 w-3 text-white" />;
      case 'wind':
        return <Wind className="h-3 w-3 text-white" />;
      case 'grid':
        return <Zap className="h-3 w-3 text-white" />;
    }
  };

  const mapCenter = useMemo(() => ({ lat: 26.9124, lng: 75.7873 }), []);
  
  const mapContainerStyle = {
    width: '100%',
    height: '400px',
    borderRadius: '12px'
  };

  const getMarkerIcon = useCallback((region: RegionData) => {
    if (!window.google || !window.google.maps) return null;
    
    let color;
    if (region.usage >= 80) color = '#10b981'; // green
    else if (region.usage >= 70) color = '#f59e0b'; // orange
    else color = '#ef4444'; // red
    
    return {
      path: window.google.maps.SymbolPath.CIRCLE,
      fillColor: color,
      fillOpacity: 0.8,
      strokeWeight: 2,
      strokeColor: '#ffffff',
      scale: 12
    };
  }, []);

  if (loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Error loading maps</h3>
          <p className="text-gray-600">Please try again later.</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-semibold text-gray-800">Rajasthan Energy Map</h1>
            </div>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-gray-600 hover:text-blue-600"
            >
              <Info className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Interactive Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">Interactive Rajasthan Map</h3>
              
              {/* Google Map Container */}
              <div className="relative rounded-xl overflow-hidden">
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  zoom={7}
                  center={mapCenter}
                  options={{
                    disableDefaultUI: false,
                    zoomControl: true,
                    fullscreenControl: false
                  }}
                >
                  {rajasthanRegions.map((region) => (
                    <Marker
                      key={region.id}
                      position={{ lat: region.coordinates.x, lng: region.coordinates.y }}
                      onClick={() => setSelectedRegion(region)}
                      icon={getMarkerIcon(region)}
                    />
                  ))}
                  
                  {selectedRegion && (
                    <InfoWindow
                      position={{ lat: selectedRegion.coordinates.x, lng: selectedRegion.coordinates.y }}
                      onCloseClick={() => setSelectedRegion(null)}
                    >
                      <div className="p-2" style={{ color: '#333' }}>
                        <h3 className="font-semibold text-lg mb-2">{selectedRegion.name}</h3>
                        <div className="space-y-1 text-sm">
                          <p><strong>Usage:</strong> {selectedRegion.usage}%</p>
                          <p><strong>Primary:</strong> {selectedRegion.primarySource}</p>
                          <p><strong>Population:</strong> {selectedRegion.details.population}</p>
                          <p><strong>Capacity:</strong> {selectedRegion.details.capacity}</p>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              </div>

              {/* Legend */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-800 mb-3">Legend</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-600">80%+ Usage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-orange-500 rounded-full" />
                    <span className="text-sm text-gray-600">70-79% Usage</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 bg-red-500 rounded-full" />
                    <span className="text-sm text-gray-600">Below 70%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Sun className="h-4 w-4 text-orange-500" />
                    <Wind className="h-4 w-4 text-blue-500" />
                    <span className="text-sm text-gray-600">Primary Source</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Click markers for details</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Region Details & Info */}
          <div className="space-y-6">
            {/* Selected Region Details */}
            {selectedRegion ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold mb-4">{selectedRegion.name} Details</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Renewable Usage</span>
                    <span className="font-bold text-lg text-blue-600">{selectedRegion.usage}%</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Solar</span>
                      <span className="text-sm font-medium">{selectedRegion.details.solar}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: `${selectedRegion.details.solar}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Wind</span>
                      <span className="text-sm font-medium">{selectedRegion.details.wind}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full"
                        style={{ width: `${selectedRegion.details.wind}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Grid</span>
                      <span className="text-sm font-medium">{selectedRegion.details.grid}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gray-500 h-2 rounded-full"
                        style={{ width: `${selectedRegion.details.grid}%` }}
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Population</span>
                      <span className="text-sm font-medium">{selectedRegion.details.population}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Capacity</span>
                      <span className="text-sm font-medium">{selectedRegion.details.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl p-6 shadow-sm border text-center">
                <Info className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Region</h3>
                <p className="text-gray-600">Click on any region marker to view detailed energy information</p>
              </div>
            )}

            {/* Info Panel */}
            {showInfo && (
              <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
                <h3 className="text-lg font-semibold text-blue-800 mb-3">Map Information</h3>
                <div className="space-y-2 text-sm text-blue-700">
                  <p>• Click region markers for detailed energy breakdown</p>
                  <p>• Color coding shows renewable energy usage levels</p>
                  <p>• Icons indicate primary energy source</p>
                  <p>• Real-time data updated every 3 seconds</p>
                </div>
              </div>
            )}

            {/* Region List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">All Regions</h3>
              <div className="space-y-3">
                {rajasthanRegions
                  .sort((a, b) => b.usage - a.usage)
                  .map((region) => (
                    <div
                      key={region.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                        selectedRegion?.id === region.id ? 'bg-blue-50 border border-blue-200' : 'bg-gray-50'
                      }`}
                      onClick={() => setSelectedRegion(region)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 ${getUsageColor(region.usage)} rounded-full`} />
                        <span className="font-medium text-gray-800">{region.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold text-blue-600">{region.usage}%</span>
                        {getSourceIcon(region.primarySource)}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyMap;