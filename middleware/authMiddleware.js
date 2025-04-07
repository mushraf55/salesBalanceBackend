const jwt = require('jsonwebtoken');

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers['authorization'];
    console.log("Auth header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token is required' });
    }

    const token = authHeader.split(' ')[1]; // Get only the token part

    try {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decodedToken;

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Access forbidden: You do not have the correct role' });
      }

      next();
    } catch (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ message: 'Invalid token or token has expired' });
    }
  };
};

module.exports = authMiddleware; // Export middleware using CommonJS
