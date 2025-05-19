// src/pages/landing/TrialOfferSection.js
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LightningBoltIcon, CreditCardIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/outline';
import { useAuth } from '../../context/AuthContext';

const TrialOfferSection = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const handlePremiumClick = (e) => {
    e.preventDefault();
    
    // If user is already logged in, go directly to subscription page
    if (user) {
      navigate('/payments/subscription');
    } else {
      // Otherwise go to setup with premium plan selected
      navigate('/setup?plan=premium');
    }
  };

  return (
    <section className="py-16 bg-gradient-to-b from-dark-500 to-dark-600">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started Today</h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Choose the option that works best for your business
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Trial Option */}
          <div className="bg-dark-400 rounded-2xl overflow-hidden shadow-xl border border-dark-300/50 transform transition-transform hover:scale-[1.02] hover:shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Free Trial</h3>
                <LightningBoltIcon className="h-10 w-10 text-white" />
              </div>
              <p className="mt-2 text-blue-100">Perfect for trying out our platform</p>
            </div>
            
            <div className="px-6 py-8">
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-gray-400 ml-2">/ Free</span>
                </div>
                <p className="text-gray-400 mt-1">Up to 20 transactions</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>All core CRM features</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Customer management</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Product inventory</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Basic analytics</span>
                </li>
                <li className="flex items-start text-gray-500">
                  <CheckIcon className="h-5 w-5 text-gray-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span>Limited to 20 transactions</span>
                </li>
              </ul>
              
              <Link 
                to="/setup?plan=free" 
                className="flex items-center justify-center w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                Try for Free
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
          
          {/* Premium Option */}
          <div className="bg-dark-400 rounded-2xl overflow-hidden shadow-xl border border-primary/30 transform transition-transform hover:scale-[1.02] hover:shadow-2xl relative">
            <div className="absolute top-0 right-0 bg-primary text-xs font-bold px-3 py-1 rounded-bl-lg text-white">
              RECOMMENDED
            </div>
            <div className="bg-gradient-to-r from-primary-700 to-primary p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">Premium</h3>
                <CreditCardIcon className="h-10 w-10 text-white" />
              </div>
              <p className="mt-2 text-primary-100">Complete access to all features</p>
            </div>
            
            <div className="px-6 py-8">
              <div className="mb-6">
                <div className="flex items-end">
                  <span className="text-4xl font-bold">$20</span>
                  <span className="text-gray-400 ml-2">/ month</span>
                </div>
                <p className="text-primary-400 mt-1">Unlimited transactions</p>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>All core CRM features</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Customer management</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Product inventory</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span><strong>Unlimited</strong> transactions</span>
                </li>
                <li className="flex items-start">
                  <CheckIcon className="h-5 w-5 text-primary mt-0.5 mr-2 flex-shrink-0" />
                  <span>Priority support</span>
                </li>
              </ul>
              
              <button 
                onClick={handlePremiumClick}
                className="flex items-center justify-center w-full py-3 px-4 bg-primary hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
              >
                Get Premium
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrialOfferSection;