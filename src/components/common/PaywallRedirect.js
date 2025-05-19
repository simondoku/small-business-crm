// src/components/common/PaywallRedirect.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CreditCardIcon, ArrowRightIcon } from '@heroicons/react/outline';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../services/api';

// Load Stripe outside of component to avoid recreating it on renders
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

// Checkout form with Stripe integration
const CheckoutForm = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not loaded yet
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Create payment intent on the server
      const { data } = await api.post('/api/payments/create-payment-intent', {
        plan: 'monthly'
      });

      // Confirm card payment
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            name: user.name,
            email: user.email
          }
        }
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        // Payment succeeded, update the user's subscription status
        await api.post('/api/payments/upgrade', {
          plan: 'monthly'
        });
        
        // Clear the payment required flag
        localStorage.removeItem('paymentRequired');
        
        // Inform parent component of success
        onSuccess();
      }
    } catch (err) {
      setError(err.message || 'An error occurred during payment processing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-dark-500/50 p-4 rounded-lg">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#FFFFFF',
              '::placeholder': {
                color: '#AAAAAA',
              },
            },
            invalid: {
              color: '#EF4444',
            },
          },
        }} />
      </div>
      
      {error && (
        <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      
      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!stripe || loading}
          className={`flex-1 py-3 px-6 ${loading ? 'bg-primary-700' : 'bg-primary hover:bg-primary-600'} transition-colors rounded-xl text-white font-medium flex items-center justify-center`}
        >
          {loading ? 'Processing...' : 'Pay $20/month'}
          {!loading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 px-6 bg-dark-300 hover:bg-dark-200 transition-colors rounded-xl font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

/**
 * Component that shows when transaction limit is reached and a user
 * attempts an action that requires payment. This replaces the harsh blocking
 * behavior with a friendly redirect to the subscription page.
 */
const PaywallRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [transactionCount, setTransactionCount] = useState(
    localStorage.getItem('transactionCount') || '20+'
  );
  const [transactionLimit, setTransactionLimit] = useState(
    localStorage.getItem('transactionLimit') || '20'
  );
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Update counts from localStorage
    const storedCount = localStorage.getItem('transactionCount');
    const storedLimit = localStorage.getItem('transactionLimit');
    
    if (storedCount) setTransactionCount(storedCount);
    if (storedLimit) setTransactionLimit(storedLimit);

    // Check for successful payment from redirect
    const urlParams = new URLSearchParams(window.location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      handleCheckoutSuccess(sessionId);
    }
  }, []);

  const handleUpgradeClick = () => {
    setShowPaymentForm(true);
  };

  const handleCheckoutSuccess = async (sessionId) => {
    try {
      setLoading(true);
      
      // Confirm the checkout session with the backend
      await api.post('/api/payments/confirm-checkout-session', {
        sessionId
      });
      
      // Clear payment required flag
      localStorage.removeItem('paymentRequired');
      
      // Show success message
      setPaymentSuccess(true);
      
      // Redirect to dashboard after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to confirm your payment. Please contact support.');
      console.error('Checkout confirmation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutRedirect = async () => {
    try {
      setLoading(true);
      
      // Request checkout session from the server
      const { data } = await api.post('/api/payments/create-checkout-session', {
        plan: 'monthly'
      });
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      setError('Failed to create checkout session. Please try again.');
      console.error('Checkout error:', err);
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    setPaymentSuccess(true);
    
    // Reset transaction flags
    localStorage.removeItem('paymentRequired');
    
    // Redirect to dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };

  const handleCancelPayment = () => {
    setShowPaymentForm(false);
  };

  const handleSeeMorePlans = () => {
    navigate('/payments/subscription');
  };

  const handleReturnToDashboard = () => {
    navigate('/dashboard');
  };

  if (paymentSuccess) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-dark-500">
        <div className="max-w-md w-full mx-4 rounded-2xl bg-dark-400 shadow-xl p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Payment Successful!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for upgrading to Premium. You now have unlimited transactions and full access to all features.
          </p>
          <p className="text-sm text-gray-500 mb-8">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-dark-500">
      <div className="max-w-2xl w-full mx-4 rounded-2xl bg-dark-400 shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary-700 to-primary p-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mb-4">
            <CreditCardIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">Transaction Limit Reached</h2>
          <p className="mt-2 text-primary-100">
            You've used all {transactionLimit} free transactions
          </p>
        </div>
        
        {/* Content */}
        <div className="p-8">
          {error && (
            <div className="mb-4 bg-red-500/10 text-red-500 p-3 rounded-lg text-sm">
              {error}
              <button 
                onClick={() => setError(null)} 
                className="ml-2 text-red-300 hover:text-red-100"
              >
                Dismiss
              </button>
            </div>
          )}
          
          {!showPaymentForm ? (
            <>
              <div className="mb-8 text-center">
                <p className="text-lg mb-4">
                  Hi {user?.name?.split(' ')[0]}, you've reached your free trial limit of {transactionLimit} transactions.
                </p>
                <p className="text-gray-400">
                  Upgrade to our premium plan to continue using all features with unlimited transactions.
                </p>
              </div>
              
              {/* Features list */}
              <div className="bg-dark-500/50 p-6 rounded-xl mb-8">
                <h3 className="font-medium mb-4">Premium benefits include:</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="bg-green-500/10 text-green-500 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span><strong>Unlimited</strong> transactions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500/10 text-green-500 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Full access to all reporting and analytics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500/10 text-green-500 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-green-500/10 text-green-500 rounded-full min-w-[1.25rem] h-5 flex items-center justify-center mr-2 mt-0.5">✓</span>
                    <span>Advanced customization options</span>
                  </li>
                </ul>
              </div>
              
              {/* Payment options */}
              <div className="space-y-4">
                <button
                  onClick={handleCheckoutRedirect}
                  disabled={loading}
                  className="w-full py-3 px-6 bg-primary hover:bg-primary-600 transition-colors rounded-xl text-white font-medium flex items-center justify-center"
                >
                  {loading ? 'Processing...' : 'Checkout with Stripe'}
                  {!loading && <ArrowRightIcon className="ml-2 h-4 w-4" />}
                </button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-dark-400 text-gray-400">or</span>
                  </div>
                </div>
                
                <button
                  onClick={handleUpgradeClick}
                  className="w-full py-3 px-6 bg-dark-300 hover:bg-dark-200 transition-colors rounded-xl font-medium"
                >
                  Pay with Card
                </button>
                
                <div className="flex justify-center mt-4">
                  <button
                    onClick={handleSeeMorePlans}
                    className="text-primary-300 hover:text-primary-200 text-sm font-medium"
                  >
                    See Annual Plan Options
                  </button>
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <button
                  onClick={handleReturnToDashboard}
                  className="text-gray-400 hover:text-gray-300 text-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="mb-6 text-center">
                <h3 className="text-xl font-medium mb-2">Upgrade to Premium</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Enter your payment details to get unlimited transactions
                </p>
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                  <span className="font-medium">$20.00</span>
                  <span className="text-xs text-primary-300">/ month</span>
                </div>
              </div>
              
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  onSuccess={handlePaymentSuccess} 
                  onCancel={handleCancelPayment}
                />
              </Elements>
              
              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  Your payment is secure and processed by Stripe. 
                  You can cancel your subscription at any time.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaywallRedirect;