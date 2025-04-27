import React from 'react';
import Navigation from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />
      <main className="flex-grow container mx-auto px-4 py-6">
        {children}
      </main>
      <footer className="bg-gray-800 py-4">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; {new Date().getFullYear()} Education Order. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;