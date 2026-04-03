'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type JourneyType = 'WELLNESS' | 'CLINICAL_PRE' | 'CLINICAL_POST' | null;

interface RecoveryContextType {
  journey: JourneyType;
  setJourney: (journey: JourneyType) => void;
  resetJourney: () => void;
}

const RecoveryContext = createContext<RecoveryContextType | undefined>(undefined);

export function RecoveryProvider({ children }: { children: ReactNode }) {
  const [journey, setJourneyState] = useState<JourneyType>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize from sessionStorage
  useEffect(() => {
    const savedJourney = sessionStorage.getItem('youniqle_journey') as JourneyType;
    if (savedJourney && ['WELLNESS', 'CLINICAL_PRE', 'CLINICAL_POST'].includes(savedJourney)) {
      setJourneyState(savedJourney);
    }
    setIsInitialized(true);
  }, []);

  const setJourney = (newJourney: JourneyType) => {
    setJourneyState(newJourney);
    if (newJourney) {
      sessionStorage.setItem('youniqle_journey', newJourney);
    } else {
      sessionStorage.removeItem('youniqle_journey');
    }
  };

  const resetJourney = () => {
    setJourney(null);
  };

  return (
    <RecoveryContext.Provider value={{ journey, setJourney, resetJourney }}>
      {isInitialized ? children : <div className="hidden">{children}</div>}
    </RecoveryContext.Provider>
  );
}

export function useRecovery() {
  const context = useContext(RecoveryContext);
  if (context === undefined) {
    throw new Error('useRecovery must be used within a RecoveryProvider');
  }
  return context;
}
