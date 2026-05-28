import React, { useState } from 'react';
import { Filter, Search, RotateCcw, AlertTriangle, Eye, ShieldAlert, Sparkles, ChevronDown } from 'lucide-react';
import { useRecords } from '../hooks/useRecords';
import ReviewTable from '../components/ReviewTable';
import AuditTimeline from '../components/AuditTimeline';

export const Review: React.FC = () => {
  const { records, loading, approve, flag, filters, setFilters, refetch } = useRecords();
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => {
      const updated = { ...prev, [key]: value };
      if (!value) {
        delete (updated as any)[key];
      }
      return updated;
    });
  };

  const handleResetFilters = () => {
    setFilters({});
    setSearchTerm('');
  };

  // Client side search filter (category)
  const filteredRecords = records.filter((r) =>
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 relative">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Audit & Review Center
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Review validated records, manually flag anomalies, approve compliant logs, and inspect audit histories.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by category (e.g. Diesel)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-sm border border-slate-200 bg-slate-50/50 hover:bg-slate-50 focus:bg-white rounded-xl py-2.5 pl-10 pr-4 transition-all duration-200 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Source */}
          <div className="relative">
            <select
              value={(filters as any).source || ''}
              onChange={(e) => handleFilterChange('source', e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">All Sources</option>
              <option value="SAP">SAP</option>
              <option value="Utility">Utility</option>
              <option value="Travel">Travel</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 pointer-events-none text-slate-400" />
          </div>

          {/* Scope */}
          <div className="relative">
            <select
              value={(filters as any).scope || ''}
              onChange={(e) => handleFilterChange('scope', e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">All Scopes</option>
              <option value="Scope 1">Scope 1</option>
              <option value="Scope 2">Scope 2</option>
              <option value="Scope 3">Scope 3</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 pointer-events-none text-slate-400" />
          </div>

          {/* Status */}
          <div className="relative">
            <select
              value={(filters as any).status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="text-xs font-bold bg-white border border-slate-200 rounded-xl py-2.5 pl-3 pr-8 focus:outline-none focus:border-emerald-500 appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Suspicious">Suspicious</option>
              <option value="Failed">Failed</option>
            </select>
            <ChevronDown className="absolute right-2.5 top-2.5 w-4 h-4 pointer-events-none text-slate-400" />
          </div>

          {/* Reset */}
          {Object.keys(filters).length > 0 || searchTerm ? (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-slate-800 p-2.5 space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Main Review Table */}
      <ReviewTable
        records={filteredRecords}
        loading={loading}
        onApprove={approve}
        onFlag={flag}
        onViewAudit={(id) => setSelectedRecordId(id)}
      />

      {/* Side Audit Timeline Panel */}
      {selectedRecordId !== null && (
        <AuditTimeline
          recordId={selectedRecordId}
          onClose={() => setSelectedRecordId(null)}
        />
      )}
    </div>
  );
};
export default Review;
