import React, { createContext, ReactNode, useContext, useState } from 'react';

interface BackgroundContextType {
  color: string | undefined;
  setColor: (color: string | undefined) => void;
  imageUrl: string | undefined;
  setImageUrl: (url: string | undefined) => void;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

export function BackgroundProvider({ children }: { children: ReactNode }) {
  // Default to a light gray background for the entire app
  const [color, setColor] = useState<string | undefined>('#efefef');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);

  return (
    <BackgroundContext.Provider value={{ color, setColor, imageUrl, setImageUrl }}>
      {children}
    </BackgroundContext.Provider>
  );
}

// Custom hook to easily access the background state anywhere
export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}