// backend/controllers/paymentController.js
const User = require('../models/User');

// Skip Stripe initialization completely
console.log('Payment features are disabled - focusing on core application features');

/**
 * Get the current user's subscription status
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('transactionCount isPremium subscriptionStatus subscriptionExpiry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // For now, let's make all users premium to bypass paywall restrictions
    res.json({
      subscriptionStatus: 'paid',
      isPremium: true,
      transactionCount: user.transactionCount,
      freeTransactionsRemaining: 999999, // Unlimited for now
      subscriptionExpiry: new Date(2099, 11, 31), // Far future date
      requiresUpgrade: false,
      limit: 999999 // No practical limit
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a payment intent with Stripe
 * Disabled for now - returning dummy success response
 */
const createPaymentIntent = async (req, res) => {
  // Return a mock successful response
  res.json({ 
    clientSecret: 'mock_client_secret_for_development',
    mockMode: true,
    message: 'Payment processing is disabled. Focusing on core features.'
  });
};

/**
 * Create a checkout session
 * Disabled for now - returning dummy success response
 */
const createCheckoutSession = async (req, res) => {
  // Return a mock successful response
  res.json({ 
    url: '#', 
    mockMode: true,
    message: 'Payment processing is disabled. Focusing on core features.'
  });
};

/**
 * Confirm a checkout session
 * Disabled for now - returning dummy success response
 */
const confirmCheckoutSession = async (req, res) => {
  // Auto-upgrade the user
  await updateUserSubscription(req.user._id, 'yearly');
  res.json({ success: true });
};

/**
 * Upgrade a user's account to premium
 * Always succeeds in this version
 */
const upgradeAccount = async (req, res) => {
  try {
    const { plan = 'yearly' } = req.body;
    await updateUserSubscription(req.user._id, plan);
    res.json({ success: true, message: 'Account upgraded successfully' });
  } catch (error) {
    console.error('Error upgrading account:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handle webhook events
 * Disabled for now - returning dummy success response
 */
const handleWebhook = async (req, res) => {
  res.json({ received: true });
};

/**
 * Cancel a user's subscription
 * Disabled for now - returning dummy success response
 */
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Just mark as cancelled, but keep premium status for now
    await User.findByIdAndUpdate(req.user._id, {
      cancelAtPeriodEnd: true
    });
    
    res.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update a user's subscription status
 */
const updateUserSubscription = async (userId, plan) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  const now = new Date();
  const expiryDate = new Date(now);
  
  if (plan === 'monthly') {
    expiryDate.setMonth(expiryDate.getMonth() + 1);
  } else {
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
  }
  
  // Update user subscription details
  user.isPremium = true;
  user.subscriptionStatus = plan;
  user.subscriptionExpiry = expiryDate;
  user.paymentFailure = false;
  user.cancelAtPeriodEnd = false;
  
  await user.save();
};

module.exports = {
  getSubscriptionStatus,
  createPaymentIntent,
  createCheckoutSession,
  confirmCheckoutSession,
  upgradeAccount,
  handleWebhook,
  cancelSubscription
};