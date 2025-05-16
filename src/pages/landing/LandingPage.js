// src/pages/landing/LandingPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, LightningBoltIcon, UserGroupIcon, ChartBarIcon, ShoppingCartIcon } from '@heroicons/react/outline';

const LandingPage = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    document.addEventListener('scroll', handleScroll);
    return () => {
      document.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

  // Feature showcase items
  const features = [
    {
      icon: <ShoppingCartIcon className="h-8 w-8" />,
      title: "Streamlined Sales Process",
      description: "Create and track sales with a beautifully intuitive interface designed for speed and clarity."
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: "Customer Management",
      description: "Build better relationships with your customers by tracking preferences, history, and interactions."
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: "Insightful Analytics",
      description: "Make data-driven decisions with visual reports and actionable insights about your business."
    },
    {
      icon: <LightningBoltIcon className="h-8 w-8" />,
      title: "Fast & Responsive",
      description: "Works seamlessly across all your devices, keeping your business moving wherever you are."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-dark-600 to-dark-500 text-white">
      {/* Navigation */}
      <header className={`fixed top-0 left-0 right-0 z-30 transition-all duration-300 ${scrolled ? 'bg-dark-400/90 backdrop-blur-md shadow-apple' : ''}`}>
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg shadow-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">B</span>
            </div>
            <span className="ml-2 text-xl font-medium">BusinessCRM</span>
          </div>
          <div className="flex space-x-2 md:space-x-6">
            <Link to="/login" className="btn btn-secondary text-sm">
              Sign In
            </Link>
            <Link to="/setup" className="btn btn-primary text-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 md:pt-40 md:pb-28">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Run Your Business Better
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
              A beautiful, intuitive CRM designed to help small businesses grow, manage customers, and increase sales.
            </p>
            <div className="flex justify-center space-x-4">
              <Link 
                to="/setup" 
                className="btn btn-primary px-8 py-3 text-lg shadow-apple-lg"
              >
                Get Started Free
              </Link>
              <Link 
                to="/login" 
                className="btn btn-secondary px-8 py-3 text-lg"
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Floating dashboard preview */}
          <div className="mt-20 max-w-4xl mx-auto relative slide-up">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-transparent rounded-xl blur-2xl"></div>
            <div className="relative bg-dark-400 rounded-xl shadow-apple-lg overflow-hidden border border-dark-300">
              <img 
                src="/dashboard-preview.png"
                alt="Dashboard Preview" 
                className="w-full h-auto"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/1200x675/252525/FFFFFF?text=Business+CRM+Dashboard";
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-dark-500">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold mb-12 text-center">Everything You Need to Succeed</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="card p-6 hover:shadow-apple-md hover:translate-y-[-5px] transition-all duration-300"
              >
                <div className="w-14 h-14 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center mb-5">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
          <div className="card p-10 md:p-16 bg-gradient-to-br from-dark-400 to-dark-500 border border-dark-300">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Business?</h2>
              <p className="text-gray-400 mb-8 max-w-lg mx-auto">
                Join thousands of businesses that use BusinessCRM to manage customers, track sales, and grow their revenue.
              </p>
              <Link 
                to="/setup" 
                className="btn btn-primary inline-flex items-center px-6 py-3 text-lg"
              >
                Get Started Now
                <ChevronRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-dark-300">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-gradient-to-r from-primary-400 to-primary-600 rounded-lg shadow-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="ml-2 text-lg font-medium">BusinessCRM</span>
              </div>
            </div>
            <div className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} BusinessCRM. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;