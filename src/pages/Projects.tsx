import React from 'react';
import AdvancedDataUpload from '@/components/AdvancedDataUpload';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProjectsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        activeSection="projects"
        setActiveSection={() => {}}
        mobileMenuOpen={false}
        setMobileMenuOpen={() => {}}
      />
      <main className="pt-16">
        <AdvancedDataUpload />
      </main>
      <Footer />
    </div>
  );
};

export default ProjectsPage;
