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
  PieChart as PieChartIcon, LineChart as LineChartIcon, ChartScatter, AreaChart as AreaChartIcon, Table, Gauge,
  AlertCircle, Loader2, FileSpreadsheet, FileCode
} from 'lucide-react';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

interface Dataset {
  id: string;
  name: string;
  file: File;
  description: string;
  columns: ColumnInfo[];
  rowCount: number;
  dataTypes: { [key: string]: string };
  data: any[];
}

interface ColumnInfo {
  name: string;
  type: 'string' | 'number' | 'date' | 'boolean';
  sampleValues: any[];
  nullCount: number;
  uniqueCount: number;
  min?: number;
  max?: number;
  mean?: number;
}

interface DAXCalculation {
  id: string;
  name: string;
  formula: string;
  description: string;
  category: 'aggregation' | 'time' | 'statistical' | 'text' | 'logical';
  applicable: boolean;
  confidence: number;
  result?: any;
}

interface Visualization {
  id: string;
  title: string;
  type: 'bar' | 'line' | 'pie' | 'scatter' | 'area' | 'table' | 'gauge';
  data: any;
  colors: string[];
  gradient: string;
  daxCalculations: DAXCalculation[];
  datasetId: string;
}

interface Relationship {
  id: string;
  fromDataset: string;
  toDataset: string;
  fromColumn: string;
  toColumn: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  confidence: number;
}

const FunctionalDataUpload: React.FC = () => {
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<string | null>(null);
  const [visualizations, setVisualizations] = useState<Visualization[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [selectedColorScheme, setSelectedColorScheme] = useState('professional');
  const [isProcessing, setIsProcessing] = useState(false);
  const [daxCalculations, setDaxCalculations] = useState<DAXCalculation[]>([]);

  const colorSchemes = [
    { name: 'professional', colors: ['#3B82F6', '#1E40AF', '#1E3A8A', '#1D4ED8'] },
    { name: 'vibrant', colors: ['#EF4444', '#F59E0B', '#10B981', '#8B5CF6'] },
    { name: 'pastel', colors: ['#FBBF24', '#F472B6', '#34D399', '#60A5FA'] },
    { name: 'monochrome', colors: ['#374151', '#6B7280', '#9CA3AF', '#D1D5DB'] }
  ];

  // File Format Detection
  const getFileFormat = (fileName: string): 'csv' | 'excel' | 'json' => {
    const extension = fileName.toLowerCase().split('.').pop();
    if (['xlsx', 'xls'].includes(extension || '')) return 'excel';
    if (extension === 'json') return 'json';
    return 'csv';
  };

  // CSV Parser Function
  const parseCSV = (csvText: string): any[] => {
    const lines = csvText.split('\n').filter(line => line.trim());
    if (lines.length === 0) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
      if (values.length === headers.length) {
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        data.push(row);
      }
    }
    
    return data;
  };

  // Excel Parser Function
  const parseExcel = (file: File): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Get the first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          if (jsonData.length === 0) {
            resolve([]);
            return;
          }
          
          // Convert to object format
          const headers = jsonData[0] as string[];
          const rows = jsonData.slice(1) as any[][];
          
          const result = rows.map(row => {
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header] = row[index] || '';
            });
            return obj;
          });
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  // JSON Parser Function
  const parseJSON = (jsonText: string): any[] => {
    try {
      const parsed = JSON.parse(jsonText);
      
      // Handle different JSON structures
      if (Array.isArray(parsed)) {
        return parsed;
      } else if (typeof parsed === 'object' && parsed !== null) {
        // If it's an object, try to find an array property
        const arrayKeys = Object.keys(parsed).filter(key => Array.isArray(parsed[key]));
        if (arrayKeys.length > 0) {
          return parsed[arrayKeys[0]];
        }
        // If no array found, wrap the object in an array
        return [parsed];
      }
      
      return [];
    } catch (error) {
      throw new Error('Invalid JSON format');
    }
  };

  // Detect Data Type
  const detectDataType = (values: any[]): 'string' | 'number' | 'date' | 'boolean' => {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    if (nonNullValues.length === 0) return 'string';
    
    // Check for numbers
    const numericValues = nonNullValues.filter(v => !isNaN(Number(v)) && v !== '');
    if (numericValues.length / nonNullValues.length > 0.8) return 'number';
    
    // Check for dates
    const dateValues = nonNullValues.filter(v => !isNaN(Date.parse(v)));
    if (dateValues.length / nonNullValues.length > 0.8) return 'date';
    
    // Check for booleans
    const booleanValues = nonNullValues.filter(v => 
      ['true', 'false', 'yes', 'no', '1', '0'].includes(String(v).toLowerCase())
    );
    if (booleanValues.length / nonNullValues.length > 0.8) return 'boolean';
    
    return 'string';
  };

  // Analyze Column
  const analyzeColumn = (columnName: string, values: any[]): ColumnInfo => {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const dataType = detectDataType(values);
    
    const columnInfo: ColumnInfo = {
      name: columnName,
      type: dataType,
      sampleValues: nonNullValues.slice(0, 5),
      nullCount: values.length - nonNullValues.length,
      uniqueCount: new Set(nonNullValues).size
    };

    // Add statistical info for numeric columns
    if (dataType === 'number') {
      const numericValues = nonNullValues.map(v => Number(v)).filter(v => !isNaN(v));
      if (numericValues.length > 0) {
        columnInfo.min = Math.min(...numericValues);
        columnInfo.max = Math.max(...numericValues);
        columnInfo.mean = numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
      }
    }

    return columnInfo;
  };

  // File Upload Handler
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileFormat = getFileFormat(file.name);
    const supportedFormats = ['csv', 'xlsx', 'xls', 'json'];
    
    if (!supportedFormats.includes(file.name.toLowerCase().split('.').pop() || '')) {
      toast.error('Please upload a CSV, Excel (.xlsx, .xls), or JSON file');
      return;
    }

    try {
      let data: any[] = [];

      if (fileFormat === 'csv') {
        const text = await file.text();
        data = parseCSV(text);
      } else if (fileFormat === 'excel') {
        data = await parseExcel(file);
      } else if (fileFormat === 'json') {
        const text = await file.text();
        data = parseJSON(text);
      }
      
      if (data.length === 0) {
        toast.error(`${fileFormat.toUpperCase()} file is empty or invalid`);
        return;
      }

      const headers = Object.keys(data[0]);
      const columns: ColumnInfo[] = headers.map(header => {
        const values = data.map(row => row[header]);
        return analyzeColumn(header, values);
      });

      const newDataset: Dataset = {
        id: `dataset-${Date.now()}`,
        name: file.name,
        file: file,
        description: '',
        columns: columns,
        rowCount: data.length,
        dataTypes: Object.fromEntries(columns.map(col => [col.name, col.type])),
        data: data
      };
      
      setDatasets(prev => [...prev, newDataset]);
      setActiveDataset(newDataset.id);
      toast.success(`Successfully uploaded ${file.name} (${fileFormat.toUpperCase()}) with ${data.length} rows`);
    } catch (error) {
      console.error(`Error parsing ${fileFormat}:`, error);
      toast.error(`Error parsing ${fileFormat.toUpperCase()} file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Generate DAX Calculations
  const generateDAXCalculations = (dataset: Dataset): DAXCalculation[] => {
    const calculations: DAXCalculation[] = [];
    const numericColumns = dataset.columns.filter(col => col.type === 'number');
    const dateColumns = dataset.columns.filter(col => col.type === 'date');
    const textColumns = dataset.columns.filter(col => col.type === 'string');

    // Aggregation calculations
    if (numericColumns.length > 0) {
      numericColumns.forEach(col => {
        calculations.push({
          id: `sum-${col.name}`,
          name: `Sum of ${col.name}`,
          formula: `SUM(${col.name})`,
          description: `Total sum of ${col.name}`,
          category: 'aggregation',
          applicable: true,
          confidence: 0.9
        });

        calculations.push({
          id: `avg-${col.name}`,
          name: `Average of ${col.name}`,
          formula: `AVERAGE(${col.name})`,
          description: `Average value of ${col.name}`,
          category: 'aggregation',
          applicable: true,
          confidence: 0.9
        });

        calculations.push({
          id: `max-${col.name}`,
          name: `Maximum ${col.name}`,
          formula: `MAX(${col.name})`,
          description: `Maximum value of ${col.name}`,
          category: 'aggregation',
          applicable: true,
          confidence: 0.9
        });
      });
    }

    // Count calculations
    calculations.push({
      id: 'total-rows',
      name: 'Total Rows',
      formula: 'COUNTROWS(Table)',
      description: 'Total number of rows in the dataset',
      category: 'aggregation',
      applicable: true,
      confidence: 1.0
    });

    // Time-based calculations
    if (dateColumns.length > 0) {
      dateColumns.forEach(col => {
        calculations.push({
          id: `year-${col.name}`,
          name: `Year from ${col.name}`,
          formula: `YEAR(${col.name})`,
          description: `Extract year from ${col.name}`,
          category: 'time',
          applicable: true,
          confidence: 0.8
        });
      });
    }

    return calculations;
  };

  // Execute DAX Calculation
  const executeDAXCalculation = (calculation: DAXCalculation, dataset: Dataset): any => {
    const { formula, name } = calculation;
    
    try {
      if (formula.includes('SUM(')) {
        const columnName = formula.match(/SUM\(([^)]+)\)/)?.[1];
        if (columnName && dataset.dataTypes[columnName] === 'number') {
          const values = dataset.data.map(row => Number(row[columnName])).filter(v => !isNaN(v));
          return values.reduce((a, b) => a + b, 0);
        }
      }
      
      if (formula.includes('AVERAGE(')) {
        const columnName = formula.match(/AVERAGE\(([^)]+)\)/)?.[1];
        if (columnName && dataset.dataTypes[columnName] === 'number') {
          const values = dataset.data.map(row => Number(row[columnName])).filter(v => !isNaN(v));
          return values.reduce((a, b) => a + b, 0) / values.length;
        }
      }
      
      if (formula.includes('MAX(')) {
        const columnName = formula.match(/MAX\(([^)]+)\)/)?.[1];
        if (columnName && dataset.dataTypes[columnName] === 'number') {
          const values = dataset.data.map(row => Number(row[columnName])).filter(v => !isNaN(v));
          return Math.max(...values);
        }
      }
      
      if (formula.includes('COUNTROWS')) {
        return dataset.rowCount;
      }
      
      if (formula.includes('YEAR(')) {
        const columnName = formula.match(/YEAR\(([^)]+)\)/)?.[1];
        if (columnName && dataset.dataTypes[columnName] === 'date') {
          const years = dataset.data.map(row => new Date(row[columnName]).getFullYear()).filter(y => !isNaN(y));
          return [...new Set(years)].sort();
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error executing DAX calculation:', error);
      return null;
    }
  };

  // Generate Visualizations
  const generateVisualizations = (dataset: Dataset): Visualization[] => {
    const visualizations: Visualization[] = [];
    const currentScheme = colorSchemes.find(s => s.name === selectedColorScheme) || colorSchemes[0];
    const numericColumns = dataset.columns.filter(col => col.type === 'number');
    const categoricalColumns = dataset.columns.filter(col => col.type === 'string');

    // Bar Chart
    if (numericColumns.length > 0 && categoricalColumns.length > 0) {
      const categoryCol = categoricalColumns[0];
      const valueCol = numericColumns[0];
      
      const groupedData = dataset.data.reduce((acc, row) => {
        const category = row[categoryCol.name];
        acc[category] = (acc[category] || 0) + Number(row[valueCol.name]);
        return acc;
      }, {} as Record<string, number>);

      visualizations.push({
        id: `bar-${dataset.id}`,
        title: `${valueCol.name} by ${categoryCol.name}`,
        type: 'bar',
        data: Object.entries(groupedData).map(([category, value]) => ({ category, value })),
        colors: currentScheme.colors,
        gradient: `linear-gradient(135deg, ${currentScheme.colors[0]}, ${currentScheme.colors[1]})`,
        daxCalculations: [],
        datasetId: dataset.id
      });
    }

    // Pie Chart
    if (categoricalColumns.length > 0) {
      const categoryCol = categoricalColumns[0];
      const groupedData = dataset.data.reduce((acc, row) => {
        const category = row[categoryCol.name];
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      visualizations.push({
        id: `pie-${dataset.id}`,
        title: `Distribution of ${categoryCol.name}`,
        type: 'pie',
        data: Object.entries(groupedData).map(([category, value]) => ({ category, value })),
        colors: currentScheme.colors,
        gradient: `linear-gradient(135deg, ${currentScheme.colors[0]}, ${currentScheme.colors[1]})`,
        daxCalculations: [],
        datasetId: dataset.id
      });
    }

    // Table View
    visualizations.push({
      id: `table-${dataset.id}`,
      title: `Data Table - ${dataset.name}`,
      type: 'table',
      data: dataset.data.slice(0, 100), // Show first 100 rows
      colors: currentScheme.colors,
      gradient: `linear-gradient(135deg, ${currentScheme.colors[0]}, ${currentScheme.colors[1]})`,
      daxCalculations: [],
      datasetId: dataset.id
    });

    return visualizations;
  };

  // Process Data
  const processData = async () => {
    if (datasets.length === 0) {
      toast.error('Please upload at least one dataset');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Generate DAX calculations for each dataset
      const allCalculations: DAXCalculation[] = [];
      datasets.forEach(dataset => {
        const calculations = generateDAXCalculations(dataset);
        const executedCalculations = calculations.map(calc => ({
          ...calc,
          result: executeDAXCalculation(calc, dataset)
        }));
        allCalculations.push(...executedCalculations);
      });
      
      setDaxCalculations(allCalculations);
      
      // Generate visualizations for each dataset
      const allVisualizations: Visualization[] = [];
      datasets.forEach(dataset => {
        const datasetVisualizations = generateVisualizations(dataset);
        allVisualizations.push(...datasetVisualizations);
      });
      
      setVisualizations(allVisualizations);
      
      toast.success('Data analysis completed successfully!');
    } catch (error) {
      console.error('Error processing data:', error);
      toast.error('Error processing data');
    } finally {
      setIsProcessing(false);
    }
  };

  const getVisualizationIcon = (type: string) => {
    switch (type) {
      case 'bar': return <BarChart3 className="h-6 w-6" />;
      case 'line': return <LineChartIcon className="h-6 w-6" />;
      case 'pie': return <PieChartIcon className="h-6 w-6" />;
      case 'scatter': return <ChartScatter className="h-6 w-6" />;
      case 'area': return <AreaChartIcon className="h-6 w-6" />;
      case 'table': return <Table className="h-6 w-6" />;
      case 'gauge': return <Gauge className="h-6 w-6" />;
      default: return <BarChart3 className="h-6 w-6" />;
    }
  };

  const renderVisualization = (viz: Visualization) => {
    if (viz.type === 'table') {
      const data = viz.data as any[];
      const columns = data.length > 0 ? Object.keys(data[0]) : [];
      
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-50">
                {columns.map(col => (
                  <th key={col} className="border border-gray-300 px-4 py-2 text-left font-medium">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 10).map((row, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  {columns.map(col => (
                    <td key={col} className="border border-gray-300 px-4 py-2">
                      {row[col]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          {data.length > 10 && (
            <p className="text-sm text-gray-500 mt-2">Showing first 10 rows of {data.length} total rows</p>
          )}
        </div>
      );
    }
    
    const chartData = Array.isArray(viz.data) ? viz.data : [];
    
    if (viz.type === 'bar') {
      return (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={viz.colors[0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (viz.type === 'pie') {
      return (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={viz.colors[index % viz.colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (viz.type === 'line') {
      return (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="value" stroke={viz.colors[0]} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    if (viz.type === 'area') {
      return (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="value" stroke={viz.colors[0]} fill={viz.colors[0]} fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      );
    }
    
    // For scatter and gauge charts, show a placeholder for now
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium mb-2">{viz.title}</h4>
        <p className="text-sm text-gray-600">
          {viz.type.toUpperCase()} Chart - {chartData.length} data points
        </p>
        <div className="mt-2 text-xs text-gray-500">
          Colors: {viz.colors.join(', ')}
        </div>
        <div className="mt-4 p-3 bg-white rounded border">
          <p className="text-sm text-gray-700">
            Chart preview: {JSON.stringify(chartData.slice(0, 3), null, 2)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Advanced Data Analysis Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload your CSV, Excel, or JSON datasets and get instant AI-powered insights with dynamic visualizations and DAX calculations
          </p>
        </div>

        <Tabs defaultValue="upload" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="analysis">DAX Analysis</TabsTrigger>
            <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Datasets
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls,.json"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-4"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="h-12 w-12 text-gray-400" />
                      <div className="flex gap-1">
                        <FileText className="h-6 w-6 text-blue-500" />
                        <FileSpreadsheet className="h-6 w-6 text-green-500" />
                        <FileCode className="h-6 w-6 text-purple-500" />
                      </div>
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-900">Upload Data Files</p>
                      <p className="text-sm text-gray-500">CSV, Excel (.xlsx, .xls), or JSON files</p>
                      <p className="text-xs text-gray-400 mt-1">Click to browse or drag and drop</p>
                    </div>
                  </label>
                </div>

                {datasets.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Uploaded Datasets</h3>
                    {datasets.map(dataset => {
                      const fileFormat = getFileFormat(dataset.name);
                      const getFileIcon = () => {
                        switch (fileFormat) {
                          case 'excel': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
                          case 'json': return <FileCode className="h-4 w-4 text-purple-500" />;
                          default: return <FileText className="h-4 w-4 text-blue-500" />;
                        }
                      };
                      
                      return (
                        <Card key={dataset.id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {getFileIcon()}
                              <div>
                                <h4 className="font-medium">{dataset.name}</h4>
                                <p className="text-sm text-gray-500">
                                  {dataset.rowCount} rows • {dataset.columns.length} columns • {fileFormat.toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <Badge variant="outline">
                              {dataset.columns.filter(col => col.type === 'number').length} numeric
                            </Badge>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}

                {datasets.length > 0 && (
                  <Button 
                    onClick={processData} 
                    disabled={isProcessing}
                    className="w-full"
                    size="lg"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Data...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Apply & Analyze Data
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  DAX Calculations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {daxCalculations.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No calculations available. Please upload data and click "Apply & Analyze Data"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daxCalculations.map(calc => (
                      <Card key={calc.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{calc.name}</h4>
                            <Badge variant="secondary">{calc.category}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{calc.description}</p>
                          <code className="text-xs bg-gray-100 p-2 rounded block">{calc.formula}</code>
                          {calc.result !== null && calc.result !== undefined && (
                            <div className="text-lg font-bold text-blue-600">
                              Result: {typeof calc.result === 'object' ? JSON.stringify(calc.result) : calc.result}
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-500 h-2 rounded-full" 
                                style={{ width: `${calc.confidence * 100}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{Math.round(calc.confidence * 100)}%</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="visualizations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Data Visualizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {visualizations.length === 0 ? (
                  <div className="text-center py-8">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No visualizations available. Please upload data and click "Apply & Analyze Data"</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {visualizations.map(viz => (
                      <Card key={viz.id} className="p-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            {getVisualizationIcon(viz.type)}
                            <div>
                              <h4 className="font-medium">{viz.title}</h4>
                              <p className="text-sm text-gray-500 capitalize">{viz.type} Chart</p>
                            </div>
                          </div>
                          {renderVisualization(viz)}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
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
                {relationships.length === 0 ? (
                  <div className="text-center py-8">
                    <Link className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No relationships found. Upload multiple datasets to discover connections.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {relationships.map(rel => (
                      <Card key={rel.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {rel.fromColumn} → {rel.toColumn}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {rel.fromDataset} to {rel.toDataset}
                            </p>
                          </div>
                          <Badge variant="outline">{rel.type}</Badge>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FunctionalDataUpload;
