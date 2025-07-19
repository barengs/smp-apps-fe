import React from 'react';
import DashboardHeader from './DashboardHeader';
import { Sidebar } from './Sidebar';
import Footer from '@/components/landing/Footer'; // Reusing the existing Footer
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, title }) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {!isMobile && (
        <aside className="w-64 flex-shrink-0">
          <Sidebar />
        </aside>
      )}
      <div className="flex flex-col flex-grow">
        <DashboardHeader title={title} />
        <main className="flex-grow p-6 mt-20"> {/* Added mt-20 to account for fixed header */}
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;