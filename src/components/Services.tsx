import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Brain, Database, TrendingUp, Zap, Shield } from 'lucide-react';

const Services: React.FC = () => {
  const services = [
    {
      icon: BarChart3,
      title: 'Data Analytics',
      description: 'Comprehensive data analysis and visualization to uncover hidden patterns and insights.',
      features: ['Statistical Analysis', 'Data Visualization', 'Business Intelligence', 'KPI Dashboards']
    },
    {
      icon: Brain,
      title: 'Machine Learning',
      description: 'Custom ML models and AI solutions tailored to your specific business needs.',
      features: ['Predictive Modeling', 'Classification', 'Regression Analysis', 'Deep Learning']
    },
    {
      icon: Database,
      title: 'Data Engineering',
      description: 'Robust data pipelines and infrastructure for scalable data processing.',
      features: ['ETL Pipelines', 'Data Warehousing', 'Cloud Solutions', 'Real-time Processing']
    },
    {
      icon: TrendingUp,
      title: 'Business Intelligence',
      description: 'Transform raw data into actionable business insights and strategic recommendations.',
      features: ['Market Analysis', 'Performance Metrics', 'Trend Forecasting', 'ROI Analysis']
    },
    {
      icon: Zap,
      title: 'Automation',
      description: 'Streamline your data workflows with intelligent automation solutions.',
      features: ['Process Automation', 'Report Generation', 'Alert Systems', 'Workflow Optimization']
    },
    {
      icon: Shield,
      title: 'Data Security',
      description: 'Ensure your data is protected with enterprise-grade security measures.',
      features: ['Data Encryption', 'Access Control', 'Compliance', 'Risk Assessment']
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive data science solutions to accelerate your business growth
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const IconComponent = service.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-gray-600">
                    {service.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {service.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Services;