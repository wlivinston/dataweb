import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, BarChart3 } from 'lucide-react';
import { loadProjects, ProjectData } from '@/lib/loadProjects';

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const projectData = await loadProjects();
        setProjects(projectData);
      } catch (err) {
        console.error('Error loading projects:', err);
        setError('Failed to load projects');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    );
  }
    {
      title: 'Sales Forecasting Model',
      description: 'Advanced time series analysis and machine learning model to predict sales trends with 95% accuracy.',
      image: '/placeholder.svg',
      tags: ['Python', 'LSTM', 'Time Series', 'TensorFlow'],
      category: 'Machine Learning',
      results: '35% improvement in inventory planning'
    },
    {
      title: 'Customer Segmentation Analysis',
      description: 'Comprehensive customer behavior analysis using clustering algorithms to identify key market segments.',
      image: '/placeholder.svg',
      tags: ['R', 'K-Means', 'PCA', 'Visualization'],
      category: 'Data Analytics',
      results: '25% increase in marketing ROI'
    },
    {
      title: 'Real-time Fraud Detection',
      description: 'ML-powered fraud detection system processing millions of transactions with real-time alerts.',
      image: '/placeholder.svg',
      tags: ['Python', 'Anomaly Detection', 'Kafka', 'AWS'],
      category: 'Machine Learning',
      results: '99.7% fraud detection accuracy'
    },
    {
      title: 'Supply Chain Optimization',
      description: 'Data-driven optimization of supply chain operations reducing costs and improving efficiency.',
      image: '/placeholder.svg',
      tags: ['Operations Research', 'Optimization', 'Python', 'Tableau'],
      category: 'Analytics',
      results: '20% cost reduction achieved'
    },
    {
      title: 'Sentiment Analysis Dashboard',
      description: 'NLP-powered social media sentiment analysis with interactive dashboards for brand monitoring.',
      image: '/placeholder.svg',
      tags: ['NLP', 'BERT', 'React', 'D3.js'],
      category: 'NLP',
      results: 'Real-time brand monitoring'
    },
    {
      title: 'Predictive Maintenance System',
      description: 'IoT sensor data analysis to predict equipment failures and optimize maintenance schedules.',
      image: '/placeholder.svg',
      tags: ['IoT', 'Time Series', 'Random Forest', 'Azure'],
      category: 'Predictive Analytics',
      results: '40% reduction in downtime'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Projects
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Showcasing real-world data science solutions that drive measurable business impact
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project) => (
            <Card key={project.id} className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <div className="text-6xl opacity-20">
                  {project.type === 'powerbi' ? '📊' : '🤖'}
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {project.category}
                  </Badge>
                  {project.featured && (
                    <Badge variant="default" className="text-xs bg-yellow-500">
                      Featured
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-lg">{project.title}</CardTitle>
                <CardDescription className="text-gray-600">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {project.tags.map((tag, tagIndex) => (
                      <Badge key={tagIndex} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    📈 {project.results}
                  </div>
                </div>
                <div className="flex gap-2">
                  {project.codeUrl && (
                    <Button size="sm" variant="outline" className="flex-1" asChild>
                      <a href={project.codeUrl} target="_blank" rel="noopener noreferrer">
                        <Github className="h-4 w-4 mr-2" />
                        Code
                      </a>
                    </Button>
                  )}
                  {project.type === 'powerbi' && project.powerBiUrl ? (
                    <Button size="sm" className="flex-1" asChild>
                      <a href={project.powerBiUrl} target="_blank" rel="noopener noreferrer">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Power BI
                      </a>
                    </Button>
                  ) : project.demoUrl ? (
                    <Button size="sm" className="flex-1" asChild>
                      <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Demo
                      </a>
                    </Button>
                  ) : (
                    <Button size="sm" className="flex-1" disabled>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Demo
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;