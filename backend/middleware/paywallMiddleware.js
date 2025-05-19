// backend/middleware/paywallMiddleware.js
const User = require('../models/User');

/**
 * Middleware to check if a user has exceeded their free transaction limit
 * For non-admin users, redirects to payment page after 20 transactions
 */
const checkTransactionLimit = async (req, res, next) => {
  try {
    // Skip check for admin users
    if (req.user && req.user.role === 'admin') {
      return next();
    }

    // Skip check for critical routes - dashboard view, analytics view, and payment routes
    const criticalPaths = ['/api/analytics', '/api/payments', '/api/users/login', '/api/users/profile'];
    if (criticalPaths.some(path => req.originalUrl.startsWith(path))) {
      return next();
    }

    const user = await User.findById(req.user._id);
    
    // If user is premium or paid, allow transaction
    if (user.isPremium || user.subscriptionStatus === 'paid') {
      return next();
    }
    
    // Check if user has exceeded transaction limit
    if (user.transactionCount >= 20) {
      // Instead of blocking with 402, return a special status code that indicates redirection
      return res.status(200).json({ 
        redirectToPayment: true,
        message: 'Free transaction limit reached. Please upgrade your account to continue.',
        transactionCount: user.transactionCount,
        limit: 20,
        upgradeUrl: '/payments/subscription'
      });
    }
    
    // Increment the transaction count for free users
    // We'll actually increment the count in the sale controller after successful transaction
    req.isCountableTransaction = true;
    
    next();
  } catch (error) {
    console.error('Paywall middleware error:', error);
    res.status(500).json({ message: 'Server error in transaction validation' });
  }
};

module.exports = { checkTransactionLimit };