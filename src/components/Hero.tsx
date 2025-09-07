import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, BarChart3, Upload, Zap } from 'lucide-react';

interface HeroProps {
  setActiveSection: (section: string) => void;
}

const Hero: React.FC<HeroProps> = ({ setActiveSection }) => {
  return (
    <section 
      className="min-h-screen pt-16 relative overflow-hidden"
      style={{
              backgroundImage: `url('/images/hero-banner.png')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat'
      }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Transform Your Data Into
            <span className="block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Actionable Insights
            </span>
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">
            Upload your datasets and get instant AI-powered insights with our advanced analytics platform. 
            From multi-dataset relationships to dynamic visualizations, transform your data into actionable strategies.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button 
              size="lg" 
              onClick={() => setActiveSection('services')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              Explore Services <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => setActiveSection('projects')}
              className="border-white/30 text-white hover:bg-white/10"
            >
              Analyze Your Data
            </Button>
          </div>
        </div>

        {/* Feature Icons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="h-8 w-8 text-blue-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Multi-Dataset Upload</h3>
            <p className="text-gray-300">Upload multiple datasets and discover relationships</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">AI-Powered DAX</h3>
            <p className="text-gray-300">15+ pre-built formulas with confidence scoring</p>
          </div>
          <div className="text-center p-6 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-green-300" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-white">Dynamic Visualizations</h3>
            <p className="text-gray-300">Multiple chart types with professional color schemes</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;