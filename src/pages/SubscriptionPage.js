// src/pages/SubscriptionPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import MainLayout from '../components/layout/MainLayout';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import ToastNotification from '../components/common/ToastNotification';

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onSuccess, onError, selectedPlan, setSelectedPlan }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create payment intent on the server
      const { data: clientSecret } = await api.post('/api/payments/create-payment-intent', {
        plan: selectedPlan,
        userId: user._id
      });
      
      // Confirm payment with Stripe
      const result = await stripe.confirmCardPayment(clientSecret.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: {
            email: user.email,
          },
        }
      });
      
      if (result.error) {
        setError(result.error.message);
        onError(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          // Complete the subscription process
          await api.post('/api/payments/upgrade', { plan: selectedPlan });
          
          // Clear payment required flag
          localStorage.removeItem('paymentRequired');
          
          onSuccess();
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
      onError(err.message || 'An error occurred during payment processing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="my-6">
        <label className="block text-sm font-medium mb-2">Card Information</label>
        <div className="border border-dark-300/50 p-4 rounded-xl bg-dark-300/10">
          <CardElement 
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#FFFFFF',
                  '::placeholder': {
                    color: '#aab7c4',
                  },
                },
                invalid: {
                  color: '#fa755a',
                  iconColor: '#fa755a',
                },
              },
            }}
          />
        </div>
      </div>
      
      <button
        type="submit"
        disabled={!stripe || loading}
        className={`w-full py-3 rounded-xl ${
          loading 
            ? 'bg-primary/50 cursor-not-allowed' 
            : 'bg-primary hover:bg-primary-600'
        } text-white font-medium transition-colors`}
      >
        {loading ? 'Processing...' : `Pay ${selectedPlan === 'monthly' ? '$20' : '$200'}`}
      </button>
      
      {error && (
        <div className="text-red-500 mt-2 text-sm">{error}</div>
      )}
    </form>
  );
};

const SubscriptionPage = () => {
  const [toast, setToast] = useState(null);
  const { user } = useAuth();
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [showDirectPayment, setShowDirectPayment] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        setLoading(true);
        const { data } = await api.get('/api/payments/status');
        setSubscriptionStatus(data);
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchSubscriptionStatus();
    
    // Check for successful payment from redirect
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    
    if (sessionId) {
      handleCheckoutSuccess(sessionId);
    }
  }, [location]);
  
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
      handlePaymentSuccess();
      
      // Redirect to dashboard after delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      handlePaymentError('Failed to confirm your payment. Please contact support.');
      console.error('Checkout confirmation error:', err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleCheckoutRedirect = async () => {
    try {
      setCheckoutLoading(true);
      
      // Request checkout session from the server
      const { data } = await api.post('/api/payments/create-checkout-session', {
        plan: selectedPlan
      });
      
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (err) {
      handlePaymentError('Failed to create checkout session. Please try again.');
      console.error('Checkout error:', err);
      setCheckoutLoading(false);
    }
  };
  
  const handlePaymentSuccess = () => {
    setToast({
      type: 'success',
      message: 'Payment successful!',
      details: 'Your subscription has been activated',
      duration: 5000
    });
  };
  
  const handlePaymentError = (errorMessage) => {
    setToast({
      type: 'error',
      message: 'Payment failed',
      details: errorMessage,
      duration: 5000
    });
  };
  
  // If user is already a paid subscriber, show appropriate message
  if (subscriptionStatus?.isPremium) {
    return (
      <MainLayout title="Subscription">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <div className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
            <span className="text-green-500 text-3xl">✓</span>
          </div>
          <h2 className="text-xl font-medium text-green-500 mb-2">You're already subscribed!</h2>
          <p className="text-gray-300 mb-4">
            Your {subscriptionStatus.subscriptionStatus} subscription is active until{' '}
            {new Date(subscriptionStatus.subscriptionExpiry).toLocaleDateString()}.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-dark-300 hover:bg-dark-400 rounded-lg transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout title="Upgrade Your Account">
      <div className="max-w-2xl mx-auto">
        <div className="bg-dark-400 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-medium mb-4">Upgrade to Premium</h2>
          
          {subscriptionStatus && (
            <div className="mb-6 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <p className="text-yellow-500">
                You've used {subscriptionStatus.transactionCount} of your {subscriptionStatus.limit} free transactions.
                {subscriptionStatus.freeTransactionsRemaining <= 0 && ' You need to upgrade to continue using all features.'}
              </p>
            </div>
          )}
          
          <p className="text-gray-300 mb-6">
            Upgrade to our premium plan to unlock unlimited transactions and all features of our CRM system.
          </p>
          
          {/* Plan selection */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Select your subscription plan</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div
                className={`border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedPlan === 'monthly' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-dark-300/50 hover:border-primary/30'
                }`}
                onClick={() => setSelectedPlan('monthly')}
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Monthly</h4>
                  <div className="text-primary font-semibold">$20/month</div>
                </div>
                <p className="text-sm text-gray-400">Perfect for small businesses</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="bg-green-500/10 text-green-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
                    Unlimited transactions
                  </li>
                  <li className="flex items-center">
                    <span className="bg-green-500/10 text-green-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
                    All features included
                  </li>
                  <li className="flex items-center">
                    <span className="bg-green-500/10 text-green-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
                    Email support
                  </li>
                </ul>
              </div>
              
              <div
                className={`border rounded-xl p-5 cursor-pointer transition-all ${
                  selectedPlan === 'yearly' 
                    ? 'border-primary bg-primary/5' 
                    : 'border-dark-300/50 hover:border-primary/30'
                }`}
                onClick={() => setSelectedPlan('yearly')}
              >
                <div className="flex justify-between mb-2">
                  <h4 className="font-medium">Yearly</h4>
                  <div>
                    <div className="text-primary font-semibold">$200/year</div>
                    <div className="text-xs text-green-500">Save $40</div>
                  </div>
                </div>
                <p className="text-sm text-gray-400">Best value for your business</p>
                <ul className="mt-4 space-y-2 text-sm">
                  <li className="flex items-center">
                    <span className="bg-green-500/10 text-green-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
                    Unlimited transactions
                  </li>
                  <li className="flex items-center">
                    <span className="bg-green-500/10 text-green-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
                    All features included
                  </li>
                  <li className="flex items-center">
                    <span className="bg-green-500/10 text-green-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
                    Priority support
                  </li>
                  <li className="flex items-center">
                    <span className="bg-green-500/10 text-green-500 rounded-full w-5 h-5 flex items-center justify-center mr-2">✓</span>
                    Advanced analytics
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Payment options */}
            {!showDirectPayment ? (
              <div className="space-y-4">
                <button
                  onClick={handleCheckoutRedirect}
                  disabled={checkoutLoading}
                  className="w-full py-3 px-6 bg-primary hover:bg-primary-600 transition-colors rounded-xl text-white font-medium flex items-center justify-center"
                >
                  {checkoutLoading ? 'Processing...' : 'Checkout with Stripe'}
                  {!checkoutLoading && (
                    <svg className="ml-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" />
                    </svg>
                  )}
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
                  onClick={() => setShowDirectPayment(true)}
                  className="w-full py-3 px-6 bg-dark-300 hover:bg-dark-200 transition-colors rounded-xl font-medium"
                >
                  Pay with Card Directly
                </button>
              </div>
            ) : (
              <div>
                <button 
                  onClick={() => setShowDirectPayment(false)}
                  className="text-primary-300 hover:text-primary-200 mb-4 inline-flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to payment options
                </button>
                
                <Elements stripe={stripePromise}>
                  <CheckoutForm 
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    selectedPlan={selectedPlan}
                    setSelectedPlan={setSelectedPlan}
                  />
                </Elements>
              </div>
            )}
            
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>
                Your payment is secure and processed by Stripe.
                You can cancel your subscription at any time.
              </p>
              <p className="mt-2">
                By subscribing, you agree to our Terms of Service and Privacy Policy.
              </p>
            </div>
          </div>
        </div>
      </div>
      
      {toast && (
        <ToastNotification
          type={toast.type}
          message={toast.message}
          details={toast.details}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}
    </MainLayout>
  );
};

export default SubscriptionPage;