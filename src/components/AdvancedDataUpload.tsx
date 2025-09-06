import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, FileText, BarChart3, TrendingUp, Users, DollarSign, 
  CheckCircle, Plus, Link, Palette, Zap, Database, 
  PieChart, LineChart, Scatter, AreaChart, Table, Gauge
} from 'lucide-react';

interface Dataset {
  id: string;
  name: string;
  file: File;
  description: string;
  columns: ColumnInfo[];
  rowCount: number;
  dataTypes: { [key: string]: string };
}

interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
  nullCount: number;
  uniqueCount: number;
}

interface DAXCalculation {
  id: string;
  name: string;
  formula: string;
  description: string;
  category: 'aggregation' | 'time' | 'statistical' | 'text' | 'logical';
  applicable: boolean;
  confidence: number;
}

interface Visualization {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table' | 'gauge' | 'heatmap';
  data: any;
  colors: string[];
  gradient: string;
  daxCalculations: DAXCalculation[];
  datasetIds: string[];
  isActive: boolean;
}

interface Relationship {
  id: string;
  fromDataset: string;
  toDataset: string;
  fromColumn: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  strength: number;
}

interface ColorScheme {
  name: string;
  colors: string[];
  gradient: string;
}

const AdvancedDataUpload: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const [dataDescription, setDataDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedColorScheme, setSelectedColorScheme] = useState<string>('blue');
  const [daxCalculations, setDaxCalculations] = useState<DAXCalculation[]>([]);

  // Color schemes with gradients
  const colorSchemes: ColorScheme[] = [
    { 
      name: 'blue', 
      colors: ['#3B82F6', '#1D4ED8', '#1E40AF', '#1E3A8A'], 
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #1E3A8A 100%)' 
    },
    { 
      name: 'green', 
      colors: ['#10B981', '#059669', '#047857', '#065F46'], 
      gradient: 'linear-gradient(135deg, #10B981 0%, #065F46 100%)' 
    },
    { 
      name: 'purple', 
      colors: ['#8B5CF6', '#7C3AED', '#6D28D9', '#5B21B6'], 
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #5B21B6 100%)' 
    },
    { 
      name: 'orange', 
      colors: ['#F59E0B', '#D97706', '#B45309', '#92400E'], 
      gradient: 'linear-gradient(135deg, #F59E0B 0%, #92400E 100%)' 
    },
    { 
      name: 'red', 
      colors: ['#EF4444', '#DC2626', '#B91C1C', '#991B1B'], 
      gradient: 'linear-gradient(135deg, #EF4444 0%, #991B1B 100%)' 
    },
    { 
      name: 'teal', 
      colors: ['#14B8A6', '#0D9488', '#0F766E', '#115E59'], 
      gradient: 'linear-gradient(135deg, #14B8A6 0%, #115E59 100%)' 
    }
  ];

  // Common DAX calculations that work with most datasets
  const commonDAXCalculations: DAXCalculation[] = [
    {
      id: 'total-rows',
      name: 'Total Rows',
      formula: 'COUNTROWS(Table)',
      description: 'Counts the total number of rows in the dataset',
      category: 'aggregation',
      applicable: true,
      confidence: 1.0
    },
    {
      id: 'distinct-count',
      name: 'Distinct Count',
      formula: 'DISTINCTCOUNT(Column)',
      description: 'Counts unique values in a column',
      category: 'aggregation',
      applicable: true,
      confidence: 0.9
    },
    {
      id: 'sum-values',
      name: 'Sum of Values',
      formula: 'SUM(Column)',
      description: 'Sums all numeric values in a column',
      category: 'aggregation',
      applicable: true,
      confidence: 0.8
    },
    {
      id: 'average-values',
      name: 'Average',
      formula: 'AVERAGE(Column)',
      description: 'Calculates the average of numeric values',
      category: 'aggregation',
      applicable: true,
      confidence: 0.8
    },
    {
      id: 'max-value',
      name: 'Maximum Value',
      formula: 'MAX(Column)',
      description: 'Finds the maximum value in a column',
      category: 'aggregation',
      applicable: true,
      confidence: 0.8
    },
    {
      id: 'min-value',
      name: 'Minimum Value',
      formula: 'MIN(Column)',
      description: 'Finds the minimum value in a column',
      category: 'aggregation',
      applicable: true,
      confidence: 0.8
    },
    {
      id: 'year-from-date',
      name: 'Year from Date',
      formula: 'YEAR(DateColumn)',
      description: 'Extracts year from date column',
      category: 'time',
      applicable: true,
      confidence: 0.7
    },
    {
      id: 'month-from-date',
      name: 'Month from Date',
      formula: 'MONTH(DateColumn)',
      description: 'Extracts month from date column',
      category: 'time',
      applicable: true,
      confidence: 0.7
    },
    {
      id: 'quarter-from-date',
      name: 'Quarter from Date',
      formula: 'QUARTER(DateColumn)',
      description: 'Extracts quarter from date column',
      category: 'time',
      applicable: true,
      confidence: 0.7
    },
    {
      id: 'standard-deviation',
      name: 'Standard Deviation',
      formula: 'STDEV.P(Column)',
      description: 'Calculates population standard deviation',
      category: 'statistical',
      applicable: true,
      confidence: 0.6
    },
    {
      id: 'variance',
      name: 'Variance',
      formula: 'VAR.P(Column)',
      description: 'Calculates population variance',
      category: 'statistical',
      applicable: true,
      confidence: 0.6
    },
    {
      id: 'percentile-90',
      name: '90th Percentile',
      formula: 'PERCENTILE.INC(Column, 0.9)',
      description: 'Calculates 90th percentile of values',
      category: 'statistical',
      applicable: true,
      confidence: 0.5
    },
    {
      id: 'text-length',
      name: 'Text Length',
      formula: 'LEN(TextColumn)',
      description: 'Calculates length of text strings',
      category: 'text',
      applicable: true,
      confidence: 0.7
    },
    {
      id: 'upper-case',
      name: 'Uppercase Text',
      formula: 'UPPER(TextColumn)',
      description: 'Converts text to uppercase',
      category: 'text',
      applicable: true,
      confidence: 0.7
    },
    {
      id: 'if-statement',
      name: 'Conditional Logic',
      formula: 'IF(Condition, TrueValue, FalseValue)',
      description: 'Applies conditional logic to data',
      category: 'logical',
      applicable: true,
      confidence: 0.6
    }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const newDataset: Dataset = {
        id: `dataset-${Date.now()}`,
        name: file.name,
        file: file,
        description: '',
        columns: [],
        rowCount: 0,
        dataTypes: {}
      };
      
      setDatasets(prev => [...prev, newDataset]);
      setActiveDataset(newDataset.id);
    }
  };

  const analyzeDataset = async (dataset: Dataset) => {
    // Simulate dataset analysis
    const mockColumns: ColumnInfo[] = [
      { name: 'ID', type: 'number', sampleValues: [1, 2, 3], nullCount: 0, uniqueCount: 1000 },
      { name: 'Name', type: 'string', sampleValues: ['John', 'Jane', 'Bob'], nullCount: 5, uniqueCount: 950 },
      { name: 'Amount', type: 'number', sampleValues: [100, 250, 75], nullCount: 0, uniqueCount: 800 },
      { name: 'Date', type: 'date', sampleValues: ['2024-01-01', '2024-01-02'], nullCount: 0, uniqueCount: 365 }
    ];

    const updatedDataset = {
      ...dataset,
      columns: mockColumns,
      rowCount: 1000,
      dataTypes: { 'ID': 'number', 'Name': 'string', 'Amount': 'number', 'Date': 'date' }
    };

    setDatasets(prev => prev.map(d => d.id === dataset.id ? updatedDataset : d));
    return updatedDataset;
  };

  const generateVisualizations = async (datasets: Dataset[]) => {
    const newVisualizations: Visualization[] = [];
    const currentScheme = colorSchemes.find(s => s.name === selectedColorScheme) || colorSchemes[0];

    // Generate multiple visualizations per dataset
    datasets.forEach((dataset, datasetIndex) => {
      const baseVisualizations = [
        {
          id: `viz-${dataset.id}-1`,
          title: `${dataset.name} - Distribution Analysis`,
          type: 'bar' as const,
          data: {},
          colors: currentScheme.colors,
          gradient: currentScheme.gradient,
          daxCalculations: commonDAXCalculations.slice(0, 3),
          datasetIds: [dataset.id],
          isActive: true
        },
        {
          id: `viz-${dataset.id}-2`,
          title: `${dataset.name} - Trend Analysis`,
          type: 'line' as const,
          data: {},
          colors: currentScheme.colors,
          gradient: currentScheme.gradient,
          daxCalculations: commonDAXCalculations.slice(3, 6),
          datasetIds: [dataset.id],
          isActive: true
        },
        {
          id: `viz-${dataset.id}-3`,
          title: `${dataset.name} - Category Breakdown`,
          type: 'pie' as const,
          data: {},
          colors: currentScheme.colors,
          gradient: currentScheme.gradient,
          daxCalculations: commonDAXCalculations.slice(6, 9),
          datasetIds: [dataset.id],
          isActive: true
        }
      ];

      newVisualizations.push(...baseVisualizations);
    });

    // Generate cross-dataset visualizations if multiple datasets exist
    if (datasets.length > 1) {
      newVisualizations.push({
        id: 'cross-dataset-1',
        title: 'Cross-Dataset Correlation',
        type: 'scatter',
        data: {},
        colors: currentScheme.colors,
        gradient: currentScheme.gradient,
        daxCalculations: commonDAXCalculations.slice(9, 12),
        datasetIds: datasets.map(d => d.id),
        isActive: true
      });
    }

    setVisualizations(newVisualizations);
  };

  const processData = async () => {
    if (datasets.length === 0) return;
    
    setIsProcessing(true);
    
    // Analyze all datasets
    const analyzedDatasets = await Promise.all(
      datasets.map(dataset => analyzeDataset(dataset))
    );
    
    // Generate relationships between datasets
    const newRelationships: Relationship[] = [];
    for (let i = 0; i < analyzedDatasets.length; i++) {
      for (let j = i + 1; j < analyzedDatasets.length; j++) {
        const dataset1 = analyzedDatasets[i];
        const dataset2 = analyzedDatasets[j];
        
        // Find potential relationships based on column names
        dataset1.columns.forEach(col1 => {
          dataset2.columns.forEach(col2 => {
            if (col1.name.toLowerCase() === col2.name.toLowerCase() && col1.type === col2.type) {
              newRelationships.push({
                id: `rel-${dataset1.id}-${dataset2.id}-${col1.name}`,
                fromDataset: dataset1.id,
                toDataset: dataset2.id,
                fromColumn: col1.name,
                toColumn: col2.name,
                type: 'many-to-many',
                strength: 0.8
              });
            }
          });
        });
      }
    }
    
    setRelationships(newRelationships);
    
    // Generate visualizations
    await generateVisualizations(analyzedDatasets);
    
    // Set applicable DAX calculations
    setDaxCalculations(commonDAXCalculations);
    
    setIsProcessing(false);
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-6 w-6" />;
      case 'line': return <LineChart className="h-6 w-6" />;
      case 'pie': return <PieChart className="h-6 w-6" />;
      case 'scatter': return <Scatter className="h-6 w-6" />;
      case 'area': return <AreaChart className="h-6 w-6" />;
      case 'table': return <Table className="h-6 w-6" />;
      case 'gauge': return <Gauge className="h-6 w-6" />;
      default: return <BarChart3 className="h-6 w-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'aggregation': return 'bg-blue-100 text-blue-800';
      case 'time': return 'bg-green-100 text-green-800';
      case 'statistical': return 'bg-purple-100 text-purple-800';
      case 'text': return 'bg-orange-100 text-orange-800';
      case 'logical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Advanced Data Analysis Platform</h1>
          <p className="text-gray-600">Upload multiple datasets, discover relationships, and generate dynamic visualizations with AI-powered DAX calculations</p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="dax">DAX Calculations</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Upload & Describe */}
              <div className="space-y-6">
                {/* Upload Dataset */}
                <Card className="h-96">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Upload className="h-5 w-5" />
                      Upload Datasets
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full flex flex-col">
                    <div 
                      className="flex-1 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                      onClick={() => document.getElementById('file-upload')?.click()}
                    >
                      <div className="flex flex-col items-center justify-center h-full">
                        <Plus className="h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-lg font-medium text-gray-900 mb-2">Add Dataset</p>
                        <p className="text-sm text-gray-500 mb-4">Click to upload CSV, Excel, or JSON files</p>
                        <p className="text-xs text-gray-400">Supports multiple datasets for relationship analysis</p>
                      </div>
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

                {/* Dataset List */}
                {datasets.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Uploaded Datasets ({datasets.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {datasets.map((dataset) => (
                          <div 
                            key={dataset.id}
                            className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                              activeDataset === dataset.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setActiveDataset(dataset.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium">{dataset.name}</p>
                                <p className="text-sm text-gray-500">
                                  {dataset.rowCount > 0 ? `${dataset.rowCount} rows` : 'Analyzing...'}
                                </p>
                              </div>
                              <Database className="h-5 w-5 text-gray-400" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Describe Data */}
                <Card className="h-64">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Analysis Description
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      placeholder="Describe your analysis goals... What insights are you looking for? Any specific relationships to explore?"
                      value={dataDescription}
                      onChange={(e) => setDataDescription(e.target.value)}
                      className="h-32 resize-none"
                    />
                    <div className="mt-4 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <Palette className="h-4 w-4" />
                          <span className="text-sm">Color Scheme:</span>
                          <Select value={selectedColorScheme} onValueChange={setSelectedColorScheme}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {colorSchemes.map((scheme) => (
                                <SelectItem key={scheme.name} value={scheme.name}>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-4 h-4 rounded"
                                      style={{ background: scheme.gradient }}
                                    />
                                    {scheme.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button 
                        onClick={processData}
                        disabled={datasets.length === 0 || isProcessing}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isProcessing ? 'Processing...' : 'Analyze Data'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Quick Preview */}
              <div className="space-y-6">
                {/* Dataset Preview */}
                {activeDataset && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Dataset Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {(() => {
                        const dataset = datasets.find(d => d.id === activeDataset);
                        if (!dataset) return null;
                        
                        return (
                          <div className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2">{dataset.name}</h4>
                              <p className="text-sm text-gray-600">{dataset.description || 'No description provided'}</p>
                            </div>
                            
                            {dataset.columns.length > 0 && (
                              <div>
                                <h5 className="font-medium mb-2">Columns ({dataset.columns.length})</h5>
                                <div className="grid grid-cols-2 gap-2">
                                  {dataset.columns.map((col, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded text-sm">
                                      <div className="font-medium">{col.name}</div>
                                      <div className="text-gray-500 capitalize">{col.type}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </CardContent>
                  </Card>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <Card className="p-4">
                    <div className="text-center">
                      <Database className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{datasets.length}</p>
                      <p className="text-sm text-gray-500">Datasets</p>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="text-center">
                      <Link className="h-8 w-8 text-green-500 mx-auto mb-2" />
                      <p className="text-2xl font-bold">{relationships.length}</p>
                      <p className="text-sm text-gray-500">Relationships</p>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {visualizations.map((viz) => (
                <Card key={viz.id} className="h-64">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">{viz.title}</CardTitle>
                      <div className="flex items-center gap-2">
                        {getVisualizationIcon(viz.type)}
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ background: viz.gradient }}
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="h-full flex flex-col">
                    <div className="flex-1 flex items-center justify-center bg-gray-50 rounded">
                      <div className="text-center">
                        {getVisualizationIcon(viz.type)}
                        <p className="text-sm text-gray-500 capitalize mt-2">{viz.type} Chart</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-1">
                        {viz.daxCalculations.slice(0, 2).map((dax) => (
                          <Badge key={dax.id} variant="outline" className="text-xs">
                            {dax.name}
                          </Badge>
                        ))}
                        {viz.daxCalculations.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{viz.daxCalculations.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Link className="h-5 w-5" />
                  Dataset Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relationships.length > 0 ? (
                  <div className="space-y-4">
                    {relationships.map((rel) => {
                      const fromDataset = datasets.find(d => d.id === rel.fromDataset);
                      const toDataset = datasets.find(d => d.id === rel.toDataset);
                      
                      return (
                        <div key={rel.id} className="p-4 border rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <p className="font-medium">{fromDataset?.name}</p>
                                <p className="text-sm text-gray-500">{rel.fromColumn}</p>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                                <Badge variant="outline" className="text-xs">
                                  {rel.type}
                                </Badge>
                                <div className="w-8 h-0.5 bg-gray-300"></div>
                              </div>
                              <div className="text-center">
                                <p className="font-medium">{toDataset?.name}</p>
                                <p className="text-sm text-gray-500">{rel.toColumn}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Strength: {Math.round(rel.strength * 100)}%</p>
                              <div className="w-20 h-2 bg-gray-200 rounded-full mt-1">
                                <div 
                                  className="h-2 bg-blue-500 rounded-full"
                                  style={{ width: `${rel.strength * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Link className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No relationships detected yet</p>
                    <p className="text-sm text-gray-400">Upload multiple datasets to discover relationships</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI-Powered DAX Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {daxCalculations.map((dax) => (
                    <div key={dax.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{dax.name}</h4>
                        <Badge className={`text-xs ${getCategoryColor(dax.category)}`}>
                          {dax.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{dax.description}</p>
                      <div className="bg-gray-100 p-2 rounded text-sm font-mono mb-3">
                        {dax.formula}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full">
                            <div 
                              className="h-2 bg-green-500 rounded-full"
                              style={{ width: `${dax.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500">
                            {Math.round(dax.confidence * 100)}%
                          </span>
                        </div>
                        <Button size="sm" variant="outline">
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Processing Status */}
        {isProcessing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-8 max-w-md mx-4">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-semibold mb-2">Analyzing Your Data</h3>
                <p className="text-gray-600">Discovering relationships and generating dynamic visualizations...</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedDataUpload;
