import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useOrganization } from '../context/OrganizationContext';

interface UploadCardProps {
  sourceType: 'sap' | 'utility' | 'travel';
  title: string;
  description: string;
  sampleColumns: string[];
  onUploadSuccess: (summary: any) => void;
}

export const UploadCard: React.FC<UploadCardProps> = ({
  sourceType,
  title,
  description,
  sampleColumns,
  onUploadSuccess,
}) => {
  const { currentOrg } = useOrganization();
  const [dragActive, setDragActive] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [successSummary, setSuccessSummary] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.name.endsWith('.csv')) {
        setFile(droppedFile);
        setError(null);
        setSuccessSummary(null);
      } else {
        setError('Only CSV files are supported.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.name.endsWith('.csv')) {
        setFile(selectedFile);
        setError(null);
        setSuccessSummary(null);
      } else {
        setError('Only CSV files are supported.');
      }
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const res = await api.uploadCSV(file, sourceType, currentOrg);
      setSuccessSummary(res.summary);
      setFile(null);
      onUploadSuccess(res.summary);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-6 hover:shadow-md transition-all duration-300">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <Upload className="w-6 height-6" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">
            Source: {sourceType.toUpperCase()}
          </p>
        </div>
      </div>

      <p className="text-sm text-slate-500 mb-5 leading-relaxed">{description}</p>

      {/* Drag & Drop Zone */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
          dragActive 
            ? 'border-emerald-500 bg-emerald-50/20' 
            : file 
            ? 'border-emerald-300 bg-slate-50/50' 
            : 'border-slate-300 hover:border-slate-400 bg-slate-50/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".csv"
          onChange={handleFileChange}
        />

        {file ? (
          <div className="flex flex-col items-center text-center">
            <FileText className="w-12 h-12 text-slate-500 mb-3" />
            <span className="text-sm font-semibold text-slate-800 mb-1">{file.name}</span>
            <span className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</span>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center">
            <Upload className="w-10 h-10 text-slate-400 mb-3" />
            <span className="text-sm font-semibold text-slate-800 mb-1">
              Drag & drop CSV here or click to browse
            </span>
            <span className="text-xs text-slate-400">Supports standard .csv format</span>
          </div>
        )}
      </div>

      {/* Columns helper */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-slate-700 mb-2 uppercase tracking-wider">Required Columns:</h4>
        <div className="flex flex-wrap gap-1.5">
          {sampleColumns.map((col) => (
            <code key={col} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono border border-slate-200">
              {col}
            </code>
          ))}
        </div>
      </div>

      {/* Buttons / Messages */}
      <div className="mt-6 flex flex-col space-y-3">
        {file && (
          <button
            onClick={(e) => { e.stopPropagation(); handleUpload(); }}
            disabled={uploading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl transition duration-200 disabled:bg-emerald-400 flex items-center justify-center space-x-2"
          >
            {uploading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Processing Ingestion...</span>
              </>
            ) : (
              <span>Confirm & Process Upload</span>
            )}
          </button>
        )}

        {successSummary && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-emerald-800">File Ingested Successfully!</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                <span>Total Rows: <strong>{successSummary.total}</strong></span>
                <span>Approved: <strong className="text-emerald-700">{successSummary.approved}</strong></span>
                <span>Suspicious: <strong className="text-amber-700">{successSummary.suspicious}</strong></span>
                <span>Failed: <strong className="text-rose-700">{successSummary.failed}</strong></span>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 flex items-center space-x-3 text-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-bold text-rose-800">Error Ingesting CSV</p>
              <p className="text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default UploadCard;
