import React, { useState, useEffect } from 'react';
import { X, Clock, User } from 'lucide-react';
import { api, type AuditLog } from '../services/api';

interface AuditTimelineProps { 
  recordId: number;
  onClose: () => void;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({
  recordId,
  onClose,
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getAuditLog(recordId);
        // Sort in chronological order (earliest first)
        const sorted = [...data].sort(
          (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );
        setLogs(sorted);
      } catch (err: any) {
        setError(err.message || 'Failed to load audit logs.');
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [recordId]);

  const formatValue = (val: any) => {
    if (!val) return '';
    return Object.entries(val)
      .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
      .join(', ');
  };

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white border-l border-slate-200 shadow-2xl flex flex-col z-50 animate-slide-in">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Audit Trail</h3>
          <p className="text-xs text-slate-500 font-medium">Record ID: # {recordId}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 border border-slate-200 rounded-lg text-slate-400 hover:text-slate-700 bg-white shadow-2xs transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-2">
            <svg className="animate-spin h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="text-xs font-semibold">Retrieving history logs...</span>
          </div>
        ) : error ? (
          <div className="text-center text-rose-600 text-xs font-bold p-4 bg-rose-50 border border-rose-100 rounded-xl">
            {error}
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center text-slate-500 text-sm py-12">
            No audit logs recorded for this item.
          </div>
        ) : (
          <div className="relative border-l border-slate-200 ml-4 space-y-8 py-2">
            {logs.map((log) => (
              <div key={log.id} className="relative pl-6">
                {/* Node icon */}
                <div className="absolute -left-3 top-1 bg-white border-2 border-emerald-500 rounded-full p-1 text-emerald-600 shadow-2xs">
                  <Clock className="w-3 h-3" />
                </div>

                {/* Log details */}
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-xs font-bold text-slate-900 capitalize">
                      {log.action.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 mb-2 font-medium">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </p>

                  {/* Changes info card */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                    {log.old_value && (
                      <div className="mb-1 flex items-center space-x-1.5 flex-wrap">
                        <span className="text-slate-400 font-bold uppercase tracking-wider text-[9px]">From:</span>
                        <span className="font-semibold text-slate-800">{formatValue(log.old_value)}</span>
                      </div>
                    )}
                    {log.new_value && (
                      <div className="flex items-center space-x-1.5 flex-wrap">
                        <span className="text-emerald-500 font-bold uppercase tracking-wider text-[9px]">To:</span>
                        <span className="font-semibold text-emerald-800">{formatValue(log.new_value)}</span>
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex items-center space-x-1 mt-2 text-[10px] font-bold text-slate-500">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>User:</span>
                    <span className="text-slate-700 font-semibold">{log.modified_by}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default AuditTimeline;
