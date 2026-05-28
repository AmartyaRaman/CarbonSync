import React, { useState } from 'react';
import { Check, AlertTriangle, XOctagon, Eye, Filter } from 'lucide-react';
import { type NormalizedRecord } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ReviewTableProps {
  records: NormalizedRecord[];
  loading: boolean;
  onApprove: (id: number) => Promise<void>;
  onFlag: (id: number, reason: string) => Promise<void>;
  onViewAudit: (id: number) => void;
}

export const ReviewTable: React.FC<ReviewTableProps> = ({
  records,
  loading,
  onApprove,
  onFlag,
  onViewAudit,
}) => {
  const { isAdminOrAnalyst } = useAuth();
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
  const [flagReason, setFlagReason] = useState<string>('');
  const [flagLoading, setFlagLoading] = useState<number | null>(null);
  const [approveLoading, setApproveLoading] = useState<number | null>(null);

  const handleApprove = async (id: number) => {
    setApproveLoading(id);
    try {
      await onApprove(id);
    } catch (e) {
      // Handled by hook
    } finally {
      setApproveLoading(null);
    }
  };

  const handleFlagSubmit = async (id: number) => {
    if (!flagReason.trim()) return;
    setFlagLoading(id);
    try {
      await onFlag(id, flagReason);
      setSelectedRecordId(null);
      setFlagReason('');
    } catch (e) {
      // Handled by hook
    } finally {
      setFlagLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <Check className="w-3 h-3 mr-0.5" />
            Approved
          </span>
        );
      case 'Suspicious':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-0.5" />
            Suspicious
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XOctagon className="w-3 h-3 mr-0.5" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Record Info</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Source</th>
              <th scope="col" className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Scope / Category</th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Quantity</th>
              <th scope="col" className="px-6 py-3.5 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-3.5 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-slate-500 text-sm">
                  <div className="flex justify-center items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Loading data records...</span>
                  </div>
                </td>
              </tr>
            ) : records.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-slate-500 text-sm">
                  No records found matching filters.
                </td>
              </tr>
            ) : (
              records.map((record) => (
                <React.Fragment key={record.id}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-900"># {record.id}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(record.created_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 border border-slate-200 text-slate-700 rounded-md">
                        {record.source_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-slate-800">{record.category}</div>
                      <div className="text-xs font-semibold text-slate-500">
                        {record.scope}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-slate-900">
                      {record.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      <span className="text-xs font-medium text-slate-500 ml-1">{record.unit}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {getStatusBadge(record.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-1.5">
                      <button
                        onClick={() => onViewAudit(record.id)}
                        title="View audit trail"
                        className="inline-flex items-center p-1.5 border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 transition-all shadow-2xs"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {isAdminOrAnalyst && record.status !== 'Approved' && record.status !== 'Failed' && (
                        <button
                          onClick={() => handleApprove(record.id)}
                          disabled={approveLoading === record.id}
                          className="inline-flex items-center px-2.5 py-1.5 border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 shadow-2xs"
                        >
                          Approve
                        </button>
                      )}

                      {isAdminOrAnalyst && record.status !== 'Suspicious' && (
                        <button
                          onClick={() => setSelectedRecordId(selectedRecordId === record.id ? null : record.id)}
                          className="inline-flex items-center px-2.5 py-1.5 border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg text-xs font-bold transition-all shadow-2xs"
                        >
                          Flag
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* Inline flagging input drawer */}
                  {selectedRecordId === record.id && (
                    <tr className="bg-amber-50/30">
                      <td colSpan={6} className="px-6 py-4 border-t border-amber-100">
                        <div className="flex items-center space-x-3 max-w-xl ml-auto">
                          <input
                            type="text"
                            placeholder="Reason for flagging as suspicious..."
                            value={flagReason}
                            onChange={(e) => setFlagReason(e.target.value)}
                            className="flex-1 text-sm bg-white border border-amber-200 rounded-xl py-2 px-3 focus:outline-none focus:border-amber-400 font-medium"
                          />
                          <button
                            onClick={() => handleFlagSubmit(record.id)}
                            disabled={flagLoading === record.id || !flagReason.trim()}
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs py-2 px-4 rounded-xl transition disabled:opacity-50"
                          >
                            Submit Flag
                          </button>
                          <button
                            onClick={() => { setSelectedRecordId(null); setFlagReason(''); }}
                            className="text-slate-500 hover:text-slate-800 text-xs font-bold px-2"
                          >
                            Cancel
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ReviewTable;
