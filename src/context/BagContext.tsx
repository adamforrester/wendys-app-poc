import { createContext, useContext, useReducer, type ReactNode } from 'react';

export interface BagItemComboSelections {
  side: { id: string; name: string };
  drink: { id: string; name: string };
  sizeUpgrade: boolean;
}

export interface BagItem {
  id: string;
  menuItemId: string;
  name: string;
  quantity: number;
  price: number;
  customizations: { removed: string[] };
  comboSelections: BagItemComboSelections | null;
}

interface BagState {
  items: BagItem[];
  locationConfirmed: boolean;
  promoCode: string | null;
}

type BagAction =
  | { type: 'ADD_ITEM'; item: BagItem }
  | { type: 'REMOVE_ITEM'; id: string }
  | { type: 'UPDATE_QUANTITY'; id: string; quantity: number }
  | { type: 'SET_PROMO'; code: string | null }
  | { type: 'CONFIRM_LOCATION' }
  | { type: 'RESET_LOCATION_CONFIRMATION' }
  | { type: 'CLEAR_BAG' };

const initialState: BagState = {
  items: [],
  locationConfirmed: false,
  promoCode: null,
};

function bagReducer(state: BagState, action: BagAction): BagState {
  switch (action.type) {
    case 'ADD_ITEM':
      return { ...state, items: [...state.items, action.item] };
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map((i) =>
          i.id === action.id ? { ...i, quantity: Math.max(1, action.quantity) } : i
        ),
      };
    case 'SET_PROMO':
      return { ...state, promoCode: action.code };
    case 'CONFIRM_LOCATION':
      return { ...state, locationConfirmed: true };
    case 'RESET_LOCATION_CONFIRMATION':
      return { ...state, locationConfirmed: false };
    case 'CLEAR_BAG':
      return initialState;
    default:
      return state;
  }
}

const BagContext = createContext<{
  state: BagState;
  dispatch: React.Dispatch<BagAction>;
} | null>(null);

export function BagProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bagReducer, initialState);
  return (
    <BagContext.Provider value={{ state, dispatch }}>
      {children}
    </BagContext.Provider>
  );
}

export function useBag() {
  const context = useContext(BagContext);
  if (!context) throw new Error('useBag must be used within BagProvider');
  return context;
}
