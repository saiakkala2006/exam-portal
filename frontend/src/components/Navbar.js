import React from 'react';
import './Navbar.css';
import ThemeToggle from './ThemeToggle';

/**
 * Navbar Component
 * Displays navigation bar with user info and logout
 */
const Navbar = ({ user, logout, title }) => {
  return (
    <nav className="navbar">

      <h2>{title || 'Online Exam Portal'}</h2>
      <div className="navbar-right">
        <span>Welcome, {user?.name}</span>
        <ThemeToggle />
        <button className="btn btn-secondary" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
