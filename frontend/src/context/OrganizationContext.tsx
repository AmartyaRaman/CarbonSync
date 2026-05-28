import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface OrganizationContextType {
  currentOrg: string;
  setCurrentOrg: (org: string) => void;
  availableOrgs: string[];
  addOrg: (org: string) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export const OrganizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentOrg, setCurrentOrg] = useState<string>('Default Organization');
  const [availableOrgs, setAvailableOrgs] = useState<string[]>([
    'Default Organization',
    'Breathe ESG Pvt Ltd',
    'WeWork India',
    'Embassy Services',
  ]);

  const addOrg = (org: string) => {
    if (org && !availableOrgs.includes(org)) {
      setAvailableOrgs((prev) => [...prev, org]);
    }
  };

  return (
    <OrganizationContext.Provider value={{ currentOrg, setCurrentOrg, availableOrgs, addOrg }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
