import React from 'react';
import { Leaf, RefreshCw, BarChart3, AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import StatCard from '../components/StatCard';

export const Dashboard: React.FC = () => {
  const { records, loading, refetch } = useRecords();

  // Compute stats
  const totalEmissions = records
    .filter((r) => r.status === 'Approved')
    .reduce((sum, r) => sum + r.quantity, 0);

  const scope1 = records
    .filter((r) => r.scope === 'Scope 1' && r.status === 'Approved')
    .reduce((sum, r) => sum + r.quantity, 0);

  const scope2 = records
    .filter((r) => r.scope === 'Scope 2' && r.status === 'Approved')
    .reduce((sum, r) => sum + r.quantity, 0);

  const scope3 = records
    .filter((r) => r.scope === 'Scope 3' && r.status === 'Approved')
    .reduce((sum, r) => sum + r.quantity, 0);

  const countApproved = records.filter((r) => r.status === 'Approved').length;
  const countSuspicious = records.filter((r) => r.status === 'Suspicious').length;
  const countFailed = records.filter((r) => r.status === 'Failed').length;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Sustainability Insights
          </h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Real-time carbon calculations, data health metrics, and audit progress logs.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-2xs hover:shadow-xs disabled:opacity-50 space-x-2"
        >
          <RefreshCw className={`w-4 h-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Main Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Emissions (CO₂e)"
          value={`${totalEmissions.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`}
          description="Carbon footprint of approved records only"
          icon={<Leaf className="w-5 h-5" />}
          colorTheme="green"
        />
        <StatCard
          title="Scope 1 Emissions"
          value={`${scope1.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`}
          description="Direct fuel and procurement combustion"
          icon={<BarChart3 className="w-5 h-5" />}
          colorTheme="blue"
        />
        <StatCard
          title="Scope 2 Emissions"
          value={`${scope2.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`}
          description="Purchased electricity consumption"
          icon={<BarChart3 className="w-5 h-5" />}
          colorTheme="yellow"
        />
        <StatCard
          title="Scope 3 Emissions"
          value={`${scope3.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`}
          description="Business travel, logistics, and services"
          icon={<BarChart3 className="w-5 h-5" />}
          colorTheme="slate"
        />
      </div>

      {/* Data Validation Health Cards */}
      <div>
        <h3 className="text-md font-bold text-slate-800 tracking-wide uppercase mb-4">
          Data Quality & Validation Health
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex items-center space-x-4 bg-emerald-50/55 border border-emerald-100 rounded-2xl p-5 shadow-2xs">
            <div className="p-3 bg-emerald-100/80 rounded-xl text-emerald-700">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none">{countApproved}</span>
              <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mt-1">Approved & Locked</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-amber-50/55 border border-amber-100 rounded-2xl p-5 shadow-2xs">
            <div className="p-3 bg-amber-100/80 rounded-xl text-amber-700">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none">{countSuspicious}</span>
              <p className="text-xs font-bold text-amber-800 uppercase tracking-wider mt-1">Flagged Suspicious</p>
            </div>
          </div>

          <div className="flex items-center space-x-4 bg-rose-50/55 border border-rose-100 rounded-2xl p-5 shadow-2xs">
            <div className="p-3 bg-rose-100/80 rounded-xl text-rose-700">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black text-slate-900 leading-none">{countFailed}</span>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider mt-1">Failed Validation</p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual breakdown block */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 flex flex-col items-center justify-center py-16 text-center">
        <div className="max-w-md space-y-4">
          <h3 className="text-lg font-bold text-slate-900">Emissions Share Breakdown</h3>
          <p className="text-sm text-slate-500 leading-relaxed">
            See the proportional contribution of each scope to your organization's total carbon footprint. Update/approve records in the Review panel to recalculate.
          </p>
          <div className="flex items-center space-x-1 w-full bg-slate-100 rounded-full h-4 overflow-hidden mt-6 shadow-inner border border-slate-200">
            {totalEmissions > 0 ? (
              <>
                <div
                  title={`Scope 1: ${((scope1 / totalEmissions) * 100).toFixed(1)}%`}
                  style={{ width: `${(scope1 / totalEmissions) * 100}%` }}
                  className="bg-sky-500 h-full transition-all duration-500"
                />
                <div
                  title={`Scope 2: ${((scope2 / totalEmissions) * 100).toFixed(1)}%`}
                  style={{ width: `${(scope2 / totalEmissions) * 100}%` }}
                  className="bg-amber-500 h-full transition-all duration-500"
                />
                <div
                  title={`Scope 3: ${((scope3 / totalEmissions) * 100).toFixed(1)}%`}
                  style={{ width: `${(scope3 / totalEmissions) * 100}%` }}
                  className="bg-slate-400 h-full transition-all duration-500"
                />
              </>
            ) : (
              <div className="bg-slate-200 w-full h-full" />
            )}
          </div>
          <div className="flex items-center justify-center space-x-6 text-xs text-slate-500 font-semibold pt-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
              <span>Scope 1</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>Scope 2</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
              <span>Scope 3</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
