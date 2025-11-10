import jwt from 'jsonwebtoken';

/**
 * Authentication middleware to verify JWT tokens
 * Extracts user info from token and attaches to request
 * 
 * Usage in serverless functions:
 *   const authResult = await requireAuth(req);
 *   if (authResult.error) {
 *     return sendJson(res, authResult.status, { error: authResult.error });
 *   }
 *   const user = authResult.user; // { user_id, email }
 */

export async function requireAuth(req) {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization || req.headers.Authorization;
    
    if (!authHeader) {
      return { error: 'Authentication required', status: 401 };
    }

    // Expected format: "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return { error: 'Invalid authorization format. Use: Bearer <token>', status: 401 };
    }

    const token = parts[1];

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Return decoded user info
    return {
      user: {
        user_id: decoded.user_id,
        email: decoded.email
      }
    };

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired. Please log in again.', status: 401 };
    }
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', status: 401 };
    }
    console.error('Auth middleware error:', error);
    return { error: 'Authentication failed', status: 401 };
  }
}

/**
 * Optional authentication - returns user if token is valid, null otherwise
 * Useful for endpoints that work with or without authentication
 */
export async function optionalAuth(req) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  
  if (!authHeader) {
    return { user: null };
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return { user: null };
  }

  try {
    const token = parts[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return {
      user: {
        user_id: decoded.user_id,
        email: decoded.email
      }
    };
  } catch (error) {
    return { user: null };
  }
}
