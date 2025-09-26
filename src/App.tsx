import React, { useState } from 'react';
import type { Wine, WineFormData } from './types/wine';
import { WineProvider, useWineContext } from './context/WineContext';
import { WineForm } from './components/WineForm';
import { WineList } from './components/WineList';

const WineJournalApp: React.FC = () => {
  const { wines, addWine, updateWine, deleteWine } = useWineContext();
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍷 Wine Journal
          </h1>
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
                notes: editingWine.notes
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

function App() {
  return (
    <WineProvider>
      <WineJournalApp />
    </WineProvider>
  );
}

export default App;
