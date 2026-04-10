import { createContext, useContext, useReducer, type ReactNode } from 'react';
import { defaultFeatureFlags, type FeatureFlags } from '../config/featureFlags';

type FeatureFlagsAction =
  | { type: 'SET_FLAG'; key: keyof FeatureFlags; value: FeatureFlags[keyof FeatureFlags] }
  | { type: 'RESET' };

function featureFlagsReducer(state: FeatureFlags, action: FeatureFlagsAction): FeatureFlags {
  switch (action.type) {
    case 'SET_FLAG':
      return { ...state, [action.key]: action.value };
    case 'RESET':
      return { ...defaultFeatureFlags };
    default:
      return state;
  }
}

const FeatureFlagsContext = createContext<{
  flags: FeatureFlags;
  dispatch: React.Dispatch<FeatureFlagsAction>;
} | null>(null);

export function FeatureFlagsProvider({ children }: { children: ReactNode }) {
  const [flags, dispatch] = useReducer(featureFlagsReducer, defaultFeatureFlags);
  return (
    <FeatureFlagsContext.Provider value={{ flags, dispatch }}>
      {children}
    </FeatureFlagsContext.Provider>
  );
}

export function useFeatureFlags() {
  const context = useContext(FeatureFlagsContext);
  if (!context) throw new Error('useFeatureFlags must be used within FeatureFlagsProvider');
  return context;
}
