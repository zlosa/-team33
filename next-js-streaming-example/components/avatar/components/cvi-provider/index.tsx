import { ReactNode } from 'react';
import { DailyProvider } from '@daily-co/daily-react';

interface CVIProviderProps {
  children: ReactNode;
}

export const CVIProvider = ({ children }: CVIProviderProps) => {
  return (
    <DailyProvider>
      {children}
    </DailyProvider>
  );
};
