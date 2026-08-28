import React from 'react';
import { logout } from '../api/authService';

const Navbar = ({ onNavigate, onLoginClick, isAuthenticated }) => {
  const handleLogout = () => {
    logout();
    window.location.reload();
  };

  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <h1 
              className="text-2xl font-bold text-blue-600 cursor-pointer" 
              onClick={() => onNavigate('home')}
            >
              MarketPlace
            </h1>
            <div className="hidden md:flex space-x-4">
              <button onClick={() => onNavigate('home')} className="text-gray-600 hover:text-blue-600">
                Home
              </button>
              {isAuthenticated && (
                <button onClick={() => onNavigate('admin')} className="text-gray-600 hover:text-blue-600">
                  Admin Panel
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
                Log out
              </button>
            ) : (
              <button onClick={onLoginClick} className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">
                Log in
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
