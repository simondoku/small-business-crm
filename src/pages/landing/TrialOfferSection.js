// src/pages/landing/TrialOfferSection.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LightningBoltIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/outline';

const TrialOfferSection = () => {
  const navigate = useNavigate();
  
  const handleGetStarted = () => {
    navigate('/setup');
  };

  return (
    <section className="py-16 bg-gradient-to-b from-dark-500 to-dark-600">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started Today</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Everything you need to manage your business customers and sales
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Single CRM Option */}
          <div className="bg-dark-400 rounded-2xl overflow-hidden shadow-xl border border-primary/30 transform transition-transform hover:scale-[1.02] hover:shadow-2xl">
            <div className="bg-gradient-to-r from-primary-700 to-primary p-6">
              <div className="flex items-center justify-center">
                <LightningBoltIcon className="h-12 w-12 text-white mr-4" />
                <div className="text-center">
                  <h3 className="text-3xl font-bold text-white">Small Business CRM</h3>
                  <p className="mt-2 text-primary-100">Complete customer relationship management</p>
                </div>
              </div>
            </div>
            
            <div className="px-8 py-10">
              <div className="text-center mb-8">
                <div className="text-5xl font-bold text-primary mb-2">Free</div>
                <p className="text-gray-400 text-lg">Complete access to all features</p>
              </div>
              
              <ul className="space-y-4 mb-10">
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-lg">Complete customer management</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-lg">Product inventory tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-lg">Sales management & tracking</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-lg">Analytics & reporting</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-lg">Multi-user support</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-6 w-6 text-primary mt-0.5 mr-3 flex-shrink-0" />
                  <span className="text-lg">Secure data management</span>
                </li>
              </ul>
              
              <button 
                onClick={handleGetStarted}
                className="flex items-center justify-center w-full py-4 px-6 bg-primary hover:bg-primary-600 text-white font-semibold text-lg rounded-xl transition-colors"
              >
                Get Started Now
                <ArrowRightIcon className="ml-3 h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrialOfferSection;