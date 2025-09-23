import { createContext, useContext, useState } from 'react';

const ScrollEnabledContext = createContext<{
  scrollEnabled: boolean;
  setScrollEnabled: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  scrollEnabled: true,
  setScrollEnabled: (args: any)=>{}
});

export function ScrollEnabledProvider({ children }: any) {
  const [scrollEnabled, setScrollEnabled] = useState<boolean>(true);

  return (
    <ScrollEnabledContext.Provider
      value={{
        scrollEnabled,
        setScrollEnabled,
      }}
    >
      {children}
    </ScrollEnabledContext.Provider>
  );
}

export const useScrollEnabled = () => {
  return useContext(ScrollEnabledContext);
};
