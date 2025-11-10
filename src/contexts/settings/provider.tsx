import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { SettingsContext } from './context';
import type { DistanceUnit } from './types';

const STORAGE_KEY = 'quietlocations_distance_unit';

interface Props {
  children: ReactNode;
}

export function SettingsProvider({ children }: Props) {
  const [distanceUnit, setDistanceUnit] = useState<DistanceUnit>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return (stored === 'km' || stored === 'mi') ? stored : 'km';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, distanceUnit);
  }, [distanceUnit]);

  const toggleDistanceUnit = () => {
    setDistanceUnit(prev => prev === 'km' ? 'mi' : 'km');
  };

  return (
    <SettingsContext.Provider value={{ distanceUnit, toggleDistanceUnit, setDistanceUnit }}>
      {children}
    </SettingsContext.Provider>
  );
}