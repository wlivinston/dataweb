import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface NavbarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  activeSection, 
  setActiveSection, 
  mobileMenuOpen, 
  setMobileMenuOpen 
}) => {
  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'services', label: 'Services' },
    { id: 'projects', label: 'Data Analysis' },
    { id: 'blog', label: 'Blog', href: '/blog' },
    { id: 'about', label: 'Who We Are' }
  ];

  return (
    <nav className="fixed top-0 w-full bg-amber-50/90 backdrop-blur-md z-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <img 
              src="https://d64gsuwffb70l.cloudfront.net/685bf1cbc177f8a9ceb476a7_1751773536445_02dde769.png" 
              alt="DataAfrik Logo" 
              className="h-10 w-auto"
            />
            <span className="text-2xl font-bold text-green-600">DataAfrik</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navItems.map((item) => (
                item.href ? (
                  <a
                    key={item.id}
                    href={item.href}
                    className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-amber-100 transition-colors"
                  >
                    {item.label}
                  </a>
                ) : (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-700 hover:bg-amber-100'
                    }`}
                  >
                    {item.label}
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-amber-50 border-t border-amber-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              item.href ? (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-amber-100 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    activeSection === item.id
                      ? 'bg-green-100 text-green-700'
                      : 'text-gray-700 hover:bg-amber-100'
                  }`}
                >
                  {item.label}
                </button>
              )
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;