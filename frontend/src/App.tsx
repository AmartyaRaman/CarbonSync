import React, { useState } from 'react';
import { LayoutDashboard, UploadCloud, CheckSquare, Building2, Leaf } from 'lucide-react';
import { OrganizationProvider, useOrganization } from './context/OrganizationContext';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Review from './pages/Review';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'review'>('dashboard');
  const { currentOrg, setCurrentOrg, availableOrgs } = useOrganization();

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'upload':
        return <Upload />;
      case 'review':
        return <Review />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col md:flex-row antialiased font-sans text-slate-800">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-[#161C28] text-white flex flex-col shrink-0 shadow-lg">
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3.5">
          <div className="p-2 bg-emerald-500 rounded-xl text-[#161C28] shadow-sm">
            <Leaf className="w-6 h-6 fill-current" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none">CarbonSync</h1>
            <span className="text-[10px] font-bold text-emerald-400 tracking-wider uppercase">Breathe ESG Platform</span>
          </div>
        </div>

        {/* Tenant Switcher dropdown */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#121822]">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
            <Building2 className="w-3 h-3 mr-1 text-slate-400" />
            Active Tenant Organization
          </label>
          <select
            value={currentOrg}
            onChange={(e) => setCurrentOrg(e.target.value)}
            className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl py-2 px-3 focus:outline-none focus:border-emerald-500 text-slate-200 font-semibold cursor-pointer"
          >
            {availableOrgs.map((org) => (
              <option key={org} value={org}>
                {org}
              </option>
            ))}
          </select>
        </div>

        {/* Sidebar Tabs Links */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
              activeTab === 'dashboard'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <LayoutDashboard className="w-5 h-5 shrink-0" />
            <span>Sustainability Insights</span>
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
              activeTab === 'upload'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <UploadCloud className="w-5 h-5 shrink-0" />
            <span>Ingestion Hub</span>
          </button>

          <button
            onClick={() => setActiveTab('review')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide transition-all ${
              activeTab === 'review'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <CheckSquare className="w-5 h-5 shrink-0" />
            <span>Audit & Review</span>
          </button>
        </nav>

        {/* Sidebar Footer info */}
        <div className="p-6 border-t border-slate-800 text-[10px] text-slate-500 text-center font-bold">
          © 2026 Breathe ESG Services
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <OrganizationProvider>
      <MainLayout />
    </OrganizationProvider>
  );
};

export default App;
