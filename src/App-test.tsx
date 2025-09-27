import React, { useState } from 'react';
import type { Wine, WineFormData } from './types/wine';
import { WineForm } from './components/WineForm';
import { WineList } from './components/WineList';

const TestApp: React.FC = () => {
  const [wines, setWines] = useState<Wine[]>([]);
  const [editingWine, setEditingWine] = useState<Wine | null>(null);
  const [showForm, setShowForm] = useState(false);

  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const addWine = (wineData: WineFormData) => {
    const newWine: Wine = {
      id: generateId(),
      ...wineData,
      dateAdded: new Date().toISOString(),
      dateModified: new Date().toISOString(),
    };
    setWines(prev => [newWine, ...prev]);
  };

  const updateWine = (id: string, wineData: WineFormData) => {
    setWines(prev => prev.map(wine => 
      wine.id === id 
        ? { ...wine, ...wineData, dateModified: new Date().toISOString() }
        : wine
    ));
  };

  const deleteWine = (id: string) => {
    setWines(prev => prev.filter(wine => wine.id !== id));
  };

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

export default TestApp;
