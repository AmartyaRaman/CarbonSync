import { useState, useEffect, useCallback } from 'react';
import { api, type NormalizedRecord } from '../services/api';
import { useOrganization } from '../context/OrganizationContext';

export const useRecords = (initialFilters?: { scope?: string; source?: string; status?: string }) => {
  const { currentOrg } = useOrganization();
  const [records, setRecords] = useState<NormalizedRecord[]>([]);
  const [filters, setFilters] = useState(initialFilters || {});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all records with current filters
      const data = await api.getRecords(filters);
      
      // Filter by the current tenant organization on the client side for visual consistency,
      // as multi-tenancy filters based on organization name.
      const filtered = data.results.filter(
        (rec) => rec.organization_name.toLowerCase() === currentOrg.toLowerCase()
      );
      setRecords(filtered);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch records');
    } finally {
      setLoading(false);
    }
  }, [filters, currentOrg]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const approve = async (id: number) => {
    try {
      await api.approveRecord(id);
      await fetchRecords(); // refresh records
    } catch (err: any) {
      setError(err.message || 'Failed to approve record');
      throw err;
    }
  };

  const flag = async (id: number, reason: string) => {
    try {
      await api.flagRecord(id, reason);
      await fetchRecords(); // refresh records
    } catch (err: any) {
      setError(err.message || 'Failed to flag record');
      throw err;
    }
  };

  return {
    records,
    loading,
    error,
    filters,
    setFilters,
    refetch: fetchRecords,
    approve,
    flag,
  };
};
