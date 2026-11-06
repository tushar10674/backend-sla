// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
require('dotenv').config();
// Force consistent JWT secret to fix signature mismatch
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key';

const verifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');

  if (!authHeader) {
    return res.status(401).json({ message: 'Access denied, token missing' });
  }

  const token = authHeader.split(' ')[1] || authHeader;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (!decoded || (!decoded._id && !decoded.id)) {
      return res.status(400).json({ message: 'Invalid token payload' });
    }

    req.user = decoded; // attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ 
      message: 'Invalid token',
      error: error.message 
    });
  }
};

// Optional token verification: attaches user if valid token present, otherwise proceeds
const optionalVerifyToken = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return next();
  }
  const token = authHeader.split(' ')[1] || authHeader;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (decoded && (decoded._id || decoded.id)) {
      req.user = decoded;
    }
  } catch (err) {
    // Proceed as unauthenticated guest
  }
  next();
};

const isAdmin = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'Super Admin' || req.user.isAdmin)) {
    return next();
  }
  return res.status(403).json({ message: 'Access denied, administrator privileges required' });
};

module.exports = { verifyToken, optionalVerifyToken, isAdmin };
