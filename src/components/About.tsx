import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Target, Lightbulb } from 'lucide-react';

const About: React.FC = () => {
  const values = [
    {
      icon: Target,
      title: 'Precision',
      description: 'We deliver accurate, data-driven insights that you can trust for critical business decisions.'
    },
    {
      icon: Lightbulb,
      title: 'Innovation',
      description: 'Leveraging cutting-edge technologies and methodologies to solve complex data challenges.'
    },
    {
      icon: Users,
      title: 'Collaboration',
      description: 'Working closely with clients to understand their unique needs and deliver tailored solutions.'
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'Committed to delivering high-quality results that exceed expectations and drive success.'
    }
  ];

  const stats = [
    { number: '50+', label: 'Projects Completed' },
    { number: '25+', label: 'Happy Clients' },
    { number: '5+', label: 'Years Experience' },
    { number: '95%', label: 'Client Satisfaction' }
  ];

  const expertise = [
    'Python', 'R', 'SQL', 'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 
    'Pandas', 'NumPy', 'Scikit-learn', 'Tableau', 'Power BI', 'AWS', 'Azure', 'Docker'
  ];

  const founders = [
    {
      name: 'Founder, CEO & CTO',
      fulName: 'Senyo Tsedze',
      qualification: 'MS Data Science, Microsoft Power BI Certified',
      image: '/images/senyo.png',
      description: 'Leading the vision and strategy of DataAfrik with extensive experience in Data Analytics and data science and also responsible for Driving technical innovation and overseeing the development of cutting-edge data solutions.'
    },
    {
      name: 'Co-Founder & Chief Statistician & CFO',
      fulName: 'Godwin Ahiase',
      qualification: 'PhD Statistics & Finance',
      image: '/images/ahiase.png',
      description: 'Complementing with deep expertise in financial modeling and statistical analysis, playing a key role in shaping the company’s data strategy and ensuring all insights are grounded in rigorous quantitative methods to support sound financial decision-making.'
    }
  ];

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Who We Are
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            A team of passionate data scientists and analysts dedicated to transforming businesses through data
          </p>
        </div>

        {/* Founders Section */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Meet Our Founders</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            {founders.map((founder, index) => (
              <div key={index} className="text-center">
                <div className="mb-6">
                  <img 
                    src={founder.image} 
                    alt={founder.name}
                    className="w-48 h-48 rounded-full mx-auto object-cover shadow-lg"
                  />
                </div>
                <h4 className="text-xl font-semibold text-gray-900 mb-3">{founder.name}</h4>
                <p className= "text-lg font-medium text-gray-800">{founder.fulName}</p>
                <p className= "text-sm italic text-gray-500 mb-3">{founder.qualification}</p>
                
                <p className="text-gray-600">{founder.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Story</h3>
            <p className="text-gray-600 mb-4">
              Founded with a vision to democratize data science, we believe that every business, 
              regardless of size, should have access to powerful analytics and machine learning capabilities.
            </p>
            <p className="text-gray-600 mb-4">
              Our journey began when we recognized the gap between complex data science theory and 
              practical business applications. We set out to bridge this gap by creating solutions 
              that are both technically sophisticated and business-focused.
            </p>
            <p className="text-gray-600">
              Today, we're proud to work with organizations across various industries, helping them 
              unlock the value hidden in their data and make informed decisions that drive growth.
            </p>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Our Mission</h3>
            <p className="text-gray-700 text-lg italic mb-6">
              "To empower businesses with actionable insights through innovative data science solutions, 
              making complex analytics accessible and impactful."
            </p>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-20">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-12">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const IconComponent = value.icon;
              return (
                <Card key={index} className="text-center border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold mb-2">{value.title}</h4>
                    <p className="text-gray-600 text-sm">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Expertise Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Our Expertise</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {expertise.map((skill, index) => (
              <Badge key={index} variant="secondary" className="text-sm py-1 px-3">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;