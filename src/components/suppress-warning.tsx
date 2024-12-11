import { useEffect } from 'react';

export const SuppressAntDWarnings: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (
        typeof args[0] === 'string' && 
        args[0].includes('Accessing element.ref was removed in React 19')
      ) {
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  return <>{children}</>;
};