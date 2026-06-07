import { createContext, useContext } from 'react';

type SoundName = 'typing' | 'boot' | 'error' | 'click' | 'beep' | 'success';

interface SoundFXContextType {
  play: (name: SoundName) => void;
  enabled: boolean;
  setEnabled: (v: boolean) => void;
}

const SoundFXContext = createContext<SoundFXContextType>({
  play: () => {},
  enabled: false,
  setEnabled: () => {},
});

export function useSoundFX() {
  return useContext(SoundFXContext);
}

export function SoundFXProvider({ children }: { children: React.ReactNode }) {
  const play = (name: SoundName) => {
    // Placeholder: log to console. Future implementation would play actual audio files.
    // eslint-disable-next-line no-console
    console.log(`[SoundFX] Would play: ${name}`);
  };

  return (
    <SoundFXContext.Provider value={{ play, enabled: false, setEnabled: () => {} }}>
      {children}
    </SoundFXContext.Provider>
  );
}
