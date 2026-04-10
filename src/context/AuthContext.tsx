import { createContext, useContext, useReducer, type ReactNode } from 'react';
import userData from '../data/user.json';

const defaultUser = userData.authenticatedUser;

export interface User {
  name: string;
  email: string;
  rewardsPoints: number;
  rewardsTier: string;
  favoriteLocationId: string | null;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

type AuthAction =
  | { type: 'LOGIN'; user: User }
  | { type: 'LOGOUT' }
  | { type: 'SET_AUTH'; isAuthenticated: boolean; user: User | null };

const initialState: AuthState = {
  isAuthenticated: true,
  user: {
    name: `${defaultUser.firstName} ${defaultUser.lastName}`,
    email: defaultUser.email,
    rewardsPoints: defaultUser.rewardsProfile.points,
    rewardsTier: defaultUser.rewardsProfile.tier,
    favoriteLocationId: defaultUser.favoriteLocation,
  },
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN':
      return { isAuthenticated: true, user: action.user };
    case 'LOGOUT':
      return { isAuthenticated: false, user: null };
    case 'SET_AUTH':
      return { isAuthenticated: action.isAuthenticated, user: action.user };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
} | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
