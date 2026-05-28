import React, { useState } from 'react';
import { LayoutDashboard, UploadCloud, CheckSquare, Building2, Leaf, LogOut, ChevronDown } from 'lucide-react';
import { OrganizationProvider, useOrganization } from './context/OrganizationContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Review from './pages/Review';
import Login from './pages/Login';

const MainLayout: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'upload' | 'review'>('dashboard');
  const { currentOrg, setCurrentOrg, availableOrgs } = useOrganization();
  const { user, logout } = useAuth();

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
    <div className="h-screen bg-slate-50/50 flex flex-col md:flex-row antialiased font-sans text-slate-800 overflow-hidden">
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

        {/* User Profile Info section */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#121822] flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center text-sm tracking-wide shrink-0">
            {user?.username?.substring(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-extrabold text-white truncate">{user?.username}</div>
            <div className="text-[9px] font-semibold text-slate-400 flex items-center mt-0.5">
              <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-extrabold uppercase tracking-wide leading-none ${
                user?.role === 'Admin' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' :
                user?.role === 'Analyst' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                {user?.role}
              </span>
            </div>
          </div>
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

        {/* Tenant Switcher dropdown */}
        <div className="px-6 py-4 border-b border-slate-800 bg-[#121822]">
          <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center">
            <Building2 className="w-3 h-3 mr-1 text-slate-400" />
            Active Tenant Organization
          </label>
          <div className="relative">
            <select
              value={currentOrg}
              onChange={(e) => setCurrentOrg(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-slate-700 rounded-xl py-2 pl-3 pr-8 focus:outline-none focus:border-emerald-500 text-slate-200 font-semibold cursor-pointer appearance-none"
            >
              {availableOrgs.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 pointer-events-none text-slate-400" />
          </div>
          {/* Sign Out Button */}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-bold tracking-wide text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-all cursor-pointer mt-3"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-7xl mx-auto w-full">
        {renderContent()}
      </main>
    </div>
  );
};

const AppContent: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Loading Session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return <MainLayout />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <OrganizationProvider>
        <AppContent />
      </OrganizationProvider>
    </AuthProvider>
  );
};

export default App;
