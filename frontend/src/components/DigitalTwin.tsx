import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Play, Pause, RotateCcw, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DigitalTwin: React.FC = () => {
  const [uploadedVideo, setUploadedVideo] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [simulationPlaying, setSimulationPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const videoUrl = URL.createObjectURL(file);
      setUploadedVideo(videoUrl);
      setAnalysisComplete(false);
    }
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 3000);
  };

  const oreAnalysisData = {
    sizeDistribution: { large: 45, medium: 35, fine: 20 },
    hardness: 'Medium-Hard (6.2 Mohs)',
    moisture: '4.2%',
    oreType: 'Iron Ore (Hematite)',
    estimatedThroughput: '850 t/h',
    energyRequired: '22.5 kWh/ton'
  };

  const processingStages = [
    {
      stage: 'Primary Crushing',
      sizeReduction: '80% → 15cm',
      powerDraw: '2.1 MW',
      efficiency: '92%',
      description: 'Jaw crusher reduces large ore chunks'
    },
    {
      stage: 'Secondary Crushing', 
      sizeReduction: '15cm → 3cm',
      powerDraw: '1.8 MW',
      efficiency: '88%',
      description: 'Cone crusher further size reduction'
    },
    {
      stage: 'Screening',
      sizeReduction: 'Size classification',
      powerDraw: '0.3 MW',
      efficiency: '95%',
      description: '75% passes, 25% returns to crusher'
    },
    {
      stage: 'Ball Mill Grinding',
      sizeReduction: '3cm → 150μm',
      powerDraw: '4.2 MW',
      efficiency: '85%',
      description: 'Final grinding to liberation size'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-gray-50 shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <button
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6 text-gray-700" />
              <h1 className="text-xl font-semibold text-gray-800">Digital Twin - Virtual Ore Journey</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Upload & Analysis */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Step 1: Upload Ore Video</h3>
              
              {!uploadedVideo ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-colors"
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Click to upload conveyor belt video</p>
                  <p className="text-sm text-gray-500 mt-2">Supports MP4, AVI, MOV formats</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <video 
                    src={uploadedVideo} 
                    controls 
                    className="w-full rounded-lg"
                    style={{ maxHeight: '300px' }}
                  />
                  <div className="flex space-x-3">
                    <button
                      onClick={startAnalysis}
                      disabled={isAnalyzing || analysisComplete}
                      className="flex-1 bg-gray-700 text-white py-2 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50"
                    >
                      {isAnalyzing ? 'Analyzing...' : analysisComplete ? 'Analysis Complete' : 'Start AI Analysis'}
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
                    >
                      Change Video
                    </button>
                  </div>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
              />
            </div>

            {/* Analysis Results */}
            {analysisComplete && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Step 2: AI Analysis Results</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Ore Type</p>
                    <p className="text-lg font-bold text-blue-700">{oreAnalysisData.oreType}</p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Hardness</p>
                    <p className="text-lg font-bold text-green-700">{oreAnalysisData.hardness}</p>
                  </div>
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Moisture</p>
                    <p className="text-lg font-bold text-orange-700">{oreAnalysisData.moisture}</p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-lg">
                    <p className="text-sm font-medium text-gray-600">Est. Throughput</p>
                    <p className="text-lg font-bold text-purple-700">{oreAnalysisData.estimatedThroughput}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  <h4 className="font-semibold mb-2">Size Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Large ({'>'}5cm)</span>
                      <span className="font-medium">{oreAnalysisData.sizeDistribution.large}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium (1-5cm)</span>
                      <span className="font-medium">{oreAnalysisData.sizeDistribution.medium}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fine ({'<'}1cm)</span>
                      <span className="font-medium">{oreAnalysisData.sizeDistribution.fine}%</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Virtual Processing Journey */}
          <div className="space-y-6">
            {analysisComplete && (
              <div className="bg-gray-50 rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Step 3: Virtual Processing Journey</h3>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSimulationPlaying(!simulationPlaying)}
                      className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      {simulationPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                    <button className="p-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600">
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  {processingStages.map((stage, index) => (
                    <div 
                      key={index}
                      className={`p-4 rounded-lg border-l-4 transition-all duration-500 ${
                        simulationPlaying ? 'border-gray-600 bg-gray-100' : 'border-gray-300 bg-gray-50'
                      }`}
                      style={{ 
                        animationDelay: simulationPlaying ? `${index * 1}s` : '0s',
                        opacity: simulationPlaying ? 1 : 0.7
                      }}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold text-gray-800">{stage.stage}</h4>
                        <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                          {stage.efficiency}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{stage.description}</p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Size Reduction:</span>
                          <span className="font-medium ml-2">{stage.sizeReduction}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Power Draw:</span>
                          <span className="font-medium ml-2">{stage.powerDraw}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg border border-gray-300">
                  <h4 className="font-semibold text-gray-800 mb-2">Predicted Output</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Energy Required:</span>
                      <span className="font-bold text-gray-700 ml-2">{oreAnalysisData.energyRequired}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Final Product Size:</span>
                      <span className="font-bold text-gray-700 ml-2">150μm (P80)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DigitalTwin;