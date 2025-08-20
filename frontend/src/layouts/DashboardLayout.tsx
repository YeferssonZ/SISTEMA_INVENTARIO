import React from 'react';
import { Navbar } from '../components';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <main className="bg-gray-900">
        {children}
      </main>
    </div>
  );
};

export { DashboardLayout };
