import React, { useState } from 'react';
import { FileDown, RefreshCw, Layers } from 'lucide-react';
import UploadCard from '../components/UploadCard';

export const Upload: React.FC = () => {
  const [lastUploadedSummary, setLastUploadedSummary] = useState<any | null>(null);

  const handleUploadSuccess = (summary: any) => {
    setLastUploadedSummary(summary);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          Ingestion Hub
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Upload raw enterprise sustainability CSV reports to start automated parsing and scope extraction.
        </p>
      </div>

      {/* Grid of Upload Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <UploadCard
          sourceType="sap"
          title="SAP Procurement"
          description="Combustion resources, industrial fuels (petrol, diesel, coal, natural gas), and materials inventory data."
          sampleColumns={['material_name', 'quantity', 'unit', 'posting_date']}
          onUploadSuccess={handleUploadSuccess}
        />
        <UploadCard
          sourceType="utility"
          title="Utility Billing"
          description="Facility utility invoices, commercial/industrial electricity readings, and electricity grid consumption."
          sampleColumns={['facility', 'billing_start', 'billing_end', 'consumption', 'unit']}
          onUploadSuccess={handleUploadSuccess}
        />
        <UploadCard
          sourceType="travel"
          title="Travel Records"
          description="Business travel logs, flight flight segments, airport configurations, hotels, and transport logs."
          sampleColumns={['travel_type', 'origin', 'destination', 'trip_date']}
          onUploadSuccess={handleUploadSuccess}
        />
      </div>

      {/* Sample files notice */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 shadow-2xs">
        <div className="flex items-start space-x-3.5">
          <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-600 shadow-3xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-800">Need sample CSV files for testing?</h4>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
              Use the dummy CSV files inside the project's root <code>external-data/</code> folder (e.g., <code>sap_data.csv</code>) to test ingestion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Upload;
