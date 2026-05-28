import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/_/backend/api/';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach the authentication token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle 401 Unauthorized errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // If we are not on the login page or root, redirect/reload to prompt login
      if (!window.location.pathname.includes('/login')) {
        window.location.reload();
      }
    }
    return Promise.reject(error);
  }
);

export interface UserProfile {
  user_id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'Viewer';
}

export interface LoginResponse {
  token: string;
  user_id: number;
  username: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'Viewer';
}

export interface NormalizedRecord {
  id: number;
  organization: number;
  organization_name: string;
  source: number;
  source_type: 'SAP' | 'Utility' | 'Travel';
  category: string;
  quantity: number;
  unit: string;
  scope: 'Scope 1' | 'Scope 2' | 'Scope 3';
  status: 'Approved' | 'Failed' | 'Suspicious' | 'Pending';
  created_at: string;
}

export interface AuditLog {
  id: number;
  record: number;
  action: string;
  old_value: any;
  new_value: any;
  modified_by: string;
  timestamp: string;
}

export interface UploadResponse {
  message: string;
  summary: {
    total: number;
    approved: number;
    failed: number;
    suspicious: number;
  };
}

export const api = {
  // Upload CSVs
  uploadCSV: async (file: File, sourceType: 'sap' | 'utility' | 'travel', organizationName: string): Promise<UploadResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('organization', organizationName);

    const response = await apiClient.post<UploadResponse>(`upload/${sourceType}/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get records with optional filters
  getRecords: async (params?: { scope?: string; source?: string; status?: string }): Promise<{ results: NormalizedRecord[]; count: number }> => {
    const response = await apiClient.get<{ results: NormalizedRecord[]; count: number }>('records/', { params });
    return response.data;
  },

  // Get suspicious records
  getSuspiciousRecords: async (): Promise<NormalizedRecord[]> => {
    const response = await apiClient.get<NormalizedRecord[]>('records/suspicious/');
    return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
  },

  // Get approved records
  getApprovedRecords: async (): Promise<NormalizedRecord[]> => {
    const response = await apiClient.get<NormalizedRecord[]>('records/approved/');
    return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
  },

  // Approve a record
  approveRecord: async (id: number): Promise<NormalizedRecord> => {
    const response = await apiClient.patch<NormalizedRecord>(`records/${id}/approve/`);
    return response.data;
  },

  // Flag a record as suspicious
  flagRecord: async (id: number, reason: string): Promise<NormalizedRecord> => {
    const response = await apiClient.patch<NormalizedRecord>(`records/${id}/flag/`, { reason });
    return response.data;
  },

  // Get audit log trail for a record
  getAuditLog: async (recordId: number): Promise<AuditLog[]> => {
    const response = await apiClient.get<AuditLog[]>(`audit/${recordId}/`);
    return Array.isArray(response.data) ? response.data : (response.data as any).results || [];
  },

  // Authentication
  login: async (username: string, password: string): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('auth/login/', { username, password });
    return response.data;
  },

  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await apiClient.get<UserProfile>('auth/me/');
    return response.data;
  },
};
