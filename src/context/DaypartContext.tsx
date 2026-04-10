import { createContext, useContext, useReducer, type ReactNode } from 'react';

export type Daypart = 'breakfast' | 'lunch' | 'dinner' | 'late-night';

interface DaypartState {
  daypart: Daypart;
}

type DaypartAction = { type: 'SET_DAYPART'; daypart: Daypart };

const initialState: DaypartState = { daypart: 'lunch' };

function daypartReducer(state: DaypartState, action: DaypartAction): DaypartState {
  switch (action.type) {
    case 'SET_DAYPART':
      return { daypart: action.daypart };
    default:
      return state;
  }
}

const DaypartContext = createContext<{
  state: DaypartState;
  dispatch: React.Dispatch<DaypartAction>;
} | null>(null);

export function DaypartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(daypartReducer, initialState);
  return (
    <DaypartContext.Provider value={{ state, dispatch }}>
      {children}
    </DaypartContext.Provider>
  );
}

export function useDaypart() {
  const context = useContext(DaypartContext);
  if (!context) throw new Error('useDaypart must be used within DaypartProvider');
  return context;
}
