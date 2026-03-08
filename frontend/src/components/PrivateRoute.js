import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * PrivateRoute Component
 * Protects routes based on authentication and role
 */
const PrivateRoute = ({ children, user, allowedRoles }) => {
  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return children;
};

export default PrivateRoute;
