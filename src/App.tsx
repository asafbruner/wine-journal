import React, { useState } from 'react';
import type { Wine, WineFormData } from './types/wine';
import type { UserCredentials, SignUpData } from './types/auth';
import { AuthProvider, useAuthContext } from './context/AuthContext';
import { WineProvider, useWineContext } from './context/WineContext';
import { WineForm } from './components/WineForm';
import { WineList } from './components/WineList';
import { LoginForm } from './components/LoginForm';
import { SignUpForm } from './components/SignUpForm';

const WineJournalApp: React.FC = () => {
  const { wines, addWine, updateWine, deleteWine } = useWineContext();
  const { user, logout } = useAuthContext();
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [showForm, setShowForm] = useState(false);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex-1"></div>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                🍷 Wine Journal
              </h1>
            </div>
            <div className="flex-1 text-right">
              {user && (
                <div className="flex items-center justify-end space-x-4">
                  <span className="text-sm text-gray-600">
                    Welcome, {user.name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="text-sm text-blue-600 hover:text-blue-500"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
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

  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <WineProvider>
      <WineJournalApp />
    </WineProvider>
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
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

export default App;
