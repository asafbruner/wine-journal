import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import type { Wine, WineFormData } from './types/wine';
import type { UserCredentials, SignUpData } from './types/auth';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { WineProvider, useWineContext } from './context/WineContext';
import { WineForm } from './components/WineForm';
import { WineList } from './components/WineList';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';
import { AdminLoginForm } from './components/AdminLoginForm';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthService } from './services/authService';

const WineJournalApp: React.FC = () => {
  const { wines, addWine, updateWine, deleteWine } = useWineContext();
  const { user, logout } = useAuthContext();
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [showForm, setShowForm] = useState(false);
  const navigate = useNavigate();

  const handleAddWine = (wineData: WineFormData) => {
    addWine(wineData);
    setShowForm(false);
  };

  const handleEditWine = (wine: Wine) => {
    setEditingWine(wine);
    setShowForm(true);
  };

  const handleUpdateWine = (wineData: WineFormData) => {
    if (editingWine) {
      updateWine(editingWine.id, wineData);
      setEditingWine(null);
      setShowForm(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingWine(null);
    setShowForm(false);
  };

  const handleDeleteWine = (id: string) => {
    deleteWine(id);
  };

  const handleLogout = () => {
    logout();
    setShowForm(false);
    setEditingWine(null);
  };

  const handleAdminAccess = () => {
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="relative mb-4">
            {user && (
              <div className="absolute top-0 right-0 flex space-x-2">
                <button
                  onClick={handleAdminAccess}
                  className="text-sm text-red-600 hover:text-red-500 px-3 py-1 rounded-md hover:bg-red-50 transition-colors"
                >
                  Admin
                </button>
                <button
                  onClick={handleLogout}
                  className="text-sm text-blue-600 hover:text-blue-500 px-3 py-1 rounded-md hover:bg-blue-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              🍷 Wine Journal
            </h1>
            {user && (
              <div className="text-center mb-2">
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  Welcome, {user.name || user.email}
                </span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            Keep track of your wine tastings and discoveries
          </p>
        </header>

        <div className="mb-8">
          {!showForm ? (
            <div className="text-center">
              <button
                onClick={() => setShowForm(true)}
                className="btn-primary"
              >
                Add New Wine
              </button>
            </div>
          ) : (
            <WineForm
              onSubmit={editingWine ? handleUpdateWine : handleAddWine}
              initialData={editingWine ? {
                name: editingWine.name,
                vintage: editingWine.vintage,
                rating: editingWine.rating,
                notes: editingWine.notes,
                photo: editingWine.photo
              } : undefined}
              submitLabel={editingWine ? 'Update Wine' : 'Add Wine'}
              onCancel={handleCancelEdit}
            />
          )}
        </div>

        <WineList
          wines={wines}
          onEdit={handleEditWine}
          onDelete={handleDeleteWine}
        />
      </div>
    </div>
  );
};

const AdminRoute: React.FC = () => {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAdminLogin = async (credentials: UserCredentials) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await AuthService.adminLogin(credentials);
      if (result.success) {
        setIsAdminAuthenticated(true);
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred during login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    navigate('/');
  };

  const handleBackToApp = () => {
    navigate('/');
  };

  if (!isAdminAuthenticated) {
    return (
      <AdminLoginForm
        onSubmit={handleAdminLogin}
        onBackToApp={handleBackToApp}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  const users = AuthService.getAllUsersForAdmin();
  
  return (
    <AdminDashboard
      users={users}
      onLogout={handleAdminLogout}
    />
  );
};

const AuthenticatedApp: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/admin" element={<AdminRoute />} />
      <Route path="/" element={
        isAuthenticated ? (
          <WineProvider>
            <WineJournalApp />
          </WineProvider>
        ) : (
          <AuthScreen />
        )
      } />
    </Routes>
  );
};

const AuthScreen: React.FC = () => {
  const { login, signUp, isLoading, error } = useAuthContext();
  const [isSignUp, setIsSignUp] = useState(false);

  const handleLogin = async (credentials: UserCredentials) => {
    await login(credentials);
  };

  const handleSignUp = async (userData: SignUpData) => {
    await signUp(userData);
  };

  if (isSignUp) {
    return (
      <SignUpForm
        onSubmit={handleSignUp}
        onSwitchToLogin={() => setIsSignUp(false)}
        isLoading={isLoading}
        error={error}
      />
    );
  }

  return (
    <LoginForm
      onSubmit={handleLogin}
      onSwitchToSignUp={() => setIsSignUp(true)}
      isLoading={isLoading}
      error={error}
    />
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthenticatedApp />
      </AuthProvider>
    </Router>
  );
}

export default App;
