import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import AdminPanel from './pages/AdminPanel';
import Navbar from './components/Navbar';
import LoginModal from './components/LoginModal';

const App = () => {
  const [currentView, setCurrentView] = useState('home');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar 
        onNavigate={setCurrentView} 
        onLoginClick={() => setIsLoginModalOpen(true)}
        isAuthenticated={isAuthenticated}
      />
      
      <main className="container mx-auto px-4 py-8">
        {currentView === 'home' && <HomePage />}
        {currentView === 'admin' && (
          isAuthenticated ? <AdminPanel /> : (
            <div className="max-w-md mx-auto mt-16 bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
              <h2 className="text-2xl font-bold mb-3 text-gray-800">Access Denied</h2>
              <p className="text-gray-600 mb-6">You must be logged in as an administrator or seller to access this panel.</p>
              <button 
                onClick={() => setIsLoginModalOpen(true)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 transition-colors"
              >
                Log In Now
              </button>
            </div>
          )
        )}
      </main>

      {isLoginModalOpen && (
        <LoginModal 
          onClose={() => setIsLoginModalOpen(false)} 
          onSuccess={() => {
            setIsLoginModalOpen(false);
            window.location.reload();
          }} 
        />
      )}
    </div>
  );
};

export default App;
