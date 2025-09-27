export interface User {
  id: string;
  email: string;
  name?: string;
  dateCreated: string;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface SignUpData extends UserCredentials {
  name?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (credentials: UserCredentials) => Promise<boolean>;
  signUp: (userData: SignUpData) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
}

export interface StoredUser {
  id: string;
  email: string;
  name?: string;
  passwordHash: string;
  dateCreated: string;
}
