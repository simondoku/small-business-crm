// backend/controllers/paymentController.js
const User = require('../models/User');
const dotenv = require('dotenv');

// Ensure environment variables are loaded
dotenv.config();

// Log to help with debugging
console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);

// Initialize Stripe with the secret key
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Get the current user's subscription status
 */
const getSubscriptionStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('transactionCount isPremium subscriptionStatus subscriptionExpiry');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Calculate remaining free transactions
    const freeTransactionsRemaining = Math.max(0, 20 - user.transactionCount);
    
    res.json({
      subscriptionStatus: user.subscriptionStatus,
      isPremium: user.isPremium,
      transactionCount: user.transactionCount,
      freeTransactionsRemaining,
      subscriptionExpiry: user.subscriptionExpiry,
      requiresUpgrade: !user.isPremium && user.transactionCount >= 20,
      limit: 20
    });
  } catch (error) {
    console.error('Error fetching subscription status:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a payment intent with Stripe
 */
const createPaymentIntent = async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Valid plan (monthly or yearly) is required' });
    }
    
    // Calculate amount based on plan
    const amount = plan === 'monthly' ? 2000 : 20000; // $20 or $200 in cents
    
    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      metadata: {
        userId: req.user._id.toString(),
        plan,
      },
    });
    
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Create a Stripe checkout session
 */
const createCheckoutSession = async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Valid plan (monthly or yearly) is required' });
    }
    
    // Set product details based on the plan
    const productName = plan === 'monthly' ? 'Premium Monthly Plan' : 'Premium Annual Plan';
    const unitAmount = plan === 'monthly' ? 2000 : 20000; // $20 or $200 in cents
    const interval = plan === 'monthly' ? 'month' : 'year';
    
    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: productName,
              description: `${plan === 'monthly' ? 'Monthly' : 'Annual'} subscription to Premium CRM features`,
            },
            unit_amount: unitAmount,
            recurring: {
              interval: interval,
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${req.headers.origin}/payments/subscription?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin}/payments/subscription`,
      client_reference_id: req.user._id.toString(),
      customer_email: req.user.email,
      metadata: {
        userId: req.user._id.toString(),
        plan: plan
      }
    });
    
    res.json({ url: session.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Confirm a successful checkout session
 */
const confirmCheckoutSession = async (req, res) => {
  try {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }
    
    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    
    // Make sure this session belongs to the current user
    const userId = session.metadata.userId || session.client_reference_id;
    
    if (userId !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    if (session.payment_status === 'paid') {
      // Get plan details from session metadata
      const plan = session.metadata.plan || 'monthly';
      
      // Update user subscription
      await updateUserSubscription(req.user._id, plan);
      
      return res.json({ success: true });
    } else {
      return res.status(400).json({ message: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Error confirming checkout session:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Upgrade a user's account to premium
 */
const upgradeAccount = async (req, res) => {
  try {
    const { plan } = req.body;
    
    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Valid plan (monthly or yearly) is required' });
    }
    
    await updateUserSubscription(req.user._id, plan);
    
    res.json({ success: true, message: 'Account upgraded successfully' });
  } catch (error) {
    console.error('Error upgrading account:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Handle Stripe webhook events
 */
const handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  let event;
  
  try {
    // Verify the event came from Stripe
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
    } else {
      // For development without the webhook secret
      event = req.body;
    }
    
    // Handle specific events
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        
        // Make sure this is a subscription checkout
        if (session.mode === 'subscription') {
          const userId = session.metadata.userId || session.client_reference_id;
          const plan = session.metadata.plan || 'monthly';
          
          if (userId) {
            await updateUserSubscription(userId, plan);
            console.log(`User ${userId} subscription updated via webhook`);
          }
        }
        break;
        
      case 'invoice.paid':
        // Successful payment for a subscription
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;
        
        if (subscriptionId) {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          const userId = subscription.metadata.userId;
          
          if (userId) {
            // Extend the subscription
            const user = await User.findById(userId);
            
            if (user) {
              // Calculate new expiry date based on subscription interval
              const interval = subscription.items.data[0].plan.interval;
              const intervalCount = subscription.items.data[0].plan.interval_count || 1;
              
              let newExpiry;
              if (user.subscriptionExpiry && user.subscriptionExpiry > new Date()) {
                // Extend from current expiry
                newExpiry = new Date(user.subscriptionExpiry);
              } else {
                // Start from now if expired or not set
                newExpiry = new Date();
              }
              
              // Add time based on subscription interval
              if (interval === 'month') {
                newExpiry.setMonth(newExpiry.getMonth() + intervalCount);
              } else if (interval === 'year') {
                newExpiry.setFullYear(newExpiry.getFullYear() + intervalCount);
              }
              
              // Update user subscription details
              user.isPremium = true;
              user.subscriptionStatus = interval === 'month' ? 'monthly' : 'yearly';
              user.subscriptionExpiry = newExpiry;
              user.stripeCustomerId = invoice.customer;
              user.stripeSubscriptionId = subscriptionId;
              
              await user.save();
              console.log(`User ${userId} subscription renewed`);
            }
          }
        }
        break;
        
      case 'invoice.payment_failed':
        // Failed payment for a subscription
        const failedInvoice = event.data.object;
        const failedSubscriptionId = failedInvoice.subscription;
        
        if (failedSubscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(failedSubscriptionId);
          const userId = subscription.metadata.userId;
          
          if (userId) {
            // Flag the account for payment failure
            const user = await User.findById(userId);
            
            if (user) {
              user.paymentFailure = true;
              await user.save();
              console.log(`Payment failed for user ${userId}`);
            }
          }
        }
        break;
        
      case 'customer.subscription.deleted':
        // Subscription canceled or expired
        const canceledSubscription = event.data.object;
        const canceledUserId = canceledSubscription.metadata.userId;
        
        if (canceledUserId) {
          const user = await User.findById(canceledUserId);
          
          if (user) {
            user.isPremium = false;
            user.subscriptionStatus = 'free';
            user.stripeSubscriptionId = null;
            
            await user.save();
            console.log(`User ${canceledUserId} subscription canceled`);
          }
        }
        break;
    }
    
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error.message);
    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

/**
 * Cancel a user's subscription
 */
const cancelSubscription = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.stripeSubscriptionId) {
      return res.status(400).json({ message: 'No active subscription found' });
    }
    
    // Cancel the subscription at period end
    await stripe.subscriptions.update(user.stripeSubscriptionId, {
      cancel_at_period_end: true
    });
    
    // Update user
    user.cancelAtPeriodEnd = true;
    await user.save();
    
    res.json({ success: true, message: 'Subscription will be canceled at the end of the billing period' });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper function to update a user's subscription
 */
const updateUserSubscription = async (userId, plan) => {
  const user = await User.findById(userId);
  
  if (!user) {
    throw new Error('User not found');
  }
  
  // Calculate subscription expiry date
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