import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, BarChart3, TrendingUp, Users, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';

interface KPIData {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  icon: React.ReactNode;
}

interface VisualizationData {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table';
  data: any;
}

const DataUpload: React.FC = () => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [dataDescription, setDataDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [visualizations, setVisualizations] = useState<VisualizationData[]>([]);

  // Sample KPI data - in real implementation, this would come from data analysis
  const sampleKPIs: KPIData[] = [
    { title: 'Total Records', value: '1,247', change: '+12%', trend: 'up', icon: <FileText className="h-5 w-5" /> },
    { title: 'Revenue', value: '$45.2K', change: '+8.5%', trend: 'up', icon: <DollarSign className="h-5 w-5" /> },
    { title: 'Growth Rate', value: '23.4%', change: '+2.1%', trend: 'up', icon: <TrendingUp className="h-5 w-5" /> },
    { title: 'Active Users', value: '892', change: '-1.2%', trend: 'down', icon: <Users className="h-5 w-5" /> }
  ];

  // Sample visualization data
  const sampleVisualizations: VisualizationData[] = [
    { id: '1', title: 'Sales Trend', type: 'line', data: {} },
    { id: '2', title: 'Category Distribution', type: 'pie', data: {} },
    { id: '3', title: 'Monthly Performance', type: 'bar', data: {} },
    { id: '4', title: 'Customer Segments', type: 'scatter', data: {} },
    { id: '5', title: 'Revenue Analysis', type: 'area', data: {} },
    { id: '6', title: 'Data Summary', type: 'table', data: {} }
  ];

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
    }
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const processData = async () => {
    if (!uploadedFile) return;
    
    setIsProcessing(true);
    
    // Simulate data processing
    setTimeout(() => {
      setKpis(sampleKPIs);
      setVisualizations(sampleVisualizations);
      setIsProcessing(false);
    }, 2000);
  };

  const getTrendColor = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Analysis Platform</h1>
          <p className="text-gray-600">Upload your dataset and get instant insights with AI-powered analytics</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Upload & Describe */}
          <div className="space-y-6">
            {/* Upload Dataset */}
            <Card className="h-96">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Dataset
                </CardTitle>
              </CardHeader>
              <CardContent className="h-full flex flex-col">
                <div 
                  className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  {uploadedFile ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">{uploadedFile.name}</p>
                      <p className="text-sm text-gray-500 mb-4">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Badge variant="secondary" className="mb-4">
                        {uploadedFile.type || 'Unknown type'}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setUploadedFile(null);
                        }}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full">
                      <Upload className="h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-lg font-medium text-gray-900 mb-2">Drop your file here</p>
                      <p className="text-sm text-gray-500 mb-4">or click to browse</p>
                      <p className="text-xs text-gray-400">Supports CSV, Excel, JSON files</p>
                    </div>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls,.json"
                  onChange={handleFileUpload}
                />
              </CardContent>
            </Card>

            {/* Describe Data */}
            <Card className="h-64">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Describe Data
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Describe your dataset... What does it contain? What insights are you looking for?"
                  value={dataDescription}
                  onChange={(e) => setDataDescription(e.target.value)}
                  className="h-32 resize-none"
                />
                <div className="mt-4 flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {dataDescription.length}/500 characters
                  </p>
                  <Button 
                    onClick={processData}
                    disabled={!uploadedFile || isProcessing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isProcessing ? 'Processing...' : 'Analyze Data'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Results */}
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-4">
              {kpis.length > 0 ? kpis.map((kpi, index) => (
                <Card key={index} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
                      <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getTrendColor(kpi.trend)}`}>
                        {getTrendIcon(kpi.trend)} {kpi.change}
                      </div>
                      <div className="text-gray-400">
                        {kpi.icon}
                      </div>
                    </div>
                  </div>
                </Card>
              )) : (
                // Placeholder KPI cards
                Array.from({ length: 4 }).map((_, index) => (
                  <Card key={index} className="p-4 border-dashed border-gray-300">
                    <div className="flex items-center justify-center h-20">
                      <div className="text-center">
                        <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">KPI {index + 1}</p>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {/* Data Visualizations */}
            <div className="grid grid-cols-2 gap-4">
              {visualizations.length > 0 ? visualizations.map((viz) => (
                <Card key={viz.id} className="h-48">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">{viz.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <BarChart3 className="h-12 w-12 text-blue-500 mx-auto mb-2" />
                      <p className="text-sm text-gray-500 capitalize">{viz.type} Chart</p>
                    </div>
                  </CardContent>
                </Card>
              )) : (
                // Placeholder visualization cards
                Array.from({ length: 6 }).map((_, index) => (
                  <Card key={index} className="h-48 border-dashed border-gray-300">
                    <CardContent className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-400">Data Visualization</p>
                        <p className="text-xs text-gray-400">Rendition</p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Processing Status */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Processing Your Data</h3>
                <p className="text-gray-600">Analyzing dataset and generating insights...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataUpload;
