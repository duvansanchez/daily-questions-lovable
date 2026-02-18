import { useState } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Tag } from 'lucide-react';
import { mockPhraseCategories, mockPhrases } from '@/data/mockData';
import CategoryModal from '../components/phrases/CategoryModal';
import SubcategoryModal from '../components/phrases/SubcategoryModal';
import type { PhraseCategory, PhraseSubcategory } from '@/types';

export default function PhrasesCategories() {
  const [categories, setCategories] = useState(mockPhraseCategories);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PhraseCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{ category: PhraseCategory; subcategory: PhraseSubcategory } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: PhraseCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = (id: string) => {
    const phrasesInCategory = mockPhrases.filter(p => p.categoryId === id).length;
    if (phrasesInCategory > 0) {
      alert(`No puedes eliminar esta categoría porque tiene ${phrasesInCategory} frases asociadas.`);
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta categoría?')) {
      setCategories(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleToggleCategoryActive = (id: string) => {
    setCategories(prev => prev.map(c =>
      c.id === id ? { ...c, active: !c.active } : c
    ));
  };

  const handleSaveCategory = (formData: any) => {
    if (editingCategory) {
      setCategories(prev => prev.map(c =>
        c.id === editingCategory.id ? { ...c, ...formData } : c
      ));
    } else {
      const newCategory: PhraseCategory = {
        id: `cat-${Date.now()}`,
        ...formData,
        subcategories: [],
      };
      setCategories(prev => [...prev, newCategory]);
    }
  };

  const handleCreateSubcategory = (category: PhraseCategory) => {
    setSelectedCategoryId(category.id);
    setEditingSubcategory({ category, subcategory: null as any });
    setShowSubcategoryModal(true);
  };

  const handleEditSubcategory = (category: PhraseCategory, subcategory: PhraseSubcategory) => {
    setSelectedCategoryId(category.id);
    setEditingSubcategory({ category, subcategory });
    setShowSubcategoryModal(true);
  };

  const handleDeleteSubcategory = (categoryId: string, subcategoryId: string) => {
    const phrasesInSubcategory = mockPhrases.filter(p => p.subcategoryId === subcategoryId).length;
    if (phrasesInSubcategory > 0) {
      alert(`No puedes eliminar esta subcategoría porque tiene ${phrasesInSubcategory} frases asociadas.`);
      return;
    }
    if (confirm('¿Estás seguro de eliminar esta subcategoría?')) {
      setCategories(prev => prev.map(c =>
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subcategoryId) }
          : c
      ));
    }
  };

  const handleToggleSubcategoryActive = (categoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? {
            ...c,
            subcategories: c.subcategories.map(s =>
              s.id === subcategoryId ? { ...s, active: !s.active } : s
            ),
          }
        : c
    ));
  };

  const handleSaveSubcategory = (formData: any) => {
    if (!editingSubcategory) return;

    const { category } = editingSubcategory;

    if (editingSubcategory.subcategory) {
      // Editar subcategoría existente
      setCategories(prev => prev.map(c =>
        c.id === category.id
          ? {
              ...c,
              subcategories: c.subcategories.map(s =>
                s.id === editingSubcategory.subcategory.id ? { ...s, ...formData } : s
              ),
            }
          : c
      ));
    } else {
      // Crear nueva subcategoría
      const newSubcategory: PhraseSubcategory = {
        id: `sub-${Date.now()}`,
        ...formData,
      };
      setCategories(prev => prev.map(c =>
        c.id === category.id
          ? { ...c, subcategories: [...c.subcategories, newSubcategory] }
          : c
      ));
    }
  };

  const getPhrasesCount = (categoryId: string, subcategoryId?: string) => {
    if (subcategoryId) {
      return mockPhrases.filter(p => p.subcategoryId === subcategoryId).length;
    }
    return mockPhrases.filter(p => p.categoryId === categoryId).length;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2 flex items-center gap-3">
              <Tag className="h-8 w-8 text-primary" />
              Gestionar Categorías
            </h1>
            <p className="text-muted-foreground">
              Organiza tus frases en categorías y subcategorías
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-xl font-heading font-bold text-foreground mb-6">
            Gestión de Categorías y Subcategorías
          </h2>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Categorías */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Categorías</h3>
                <button
                  onClick={handleCreateCategory}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Nueva Categoría
                </button>
              </div>

              <div className="space-y-3">
                {categories.map(category => {
                  const phrasesCount = getPhrasesCount(category.id);
                  const activeSubcategories = category.subcategories.filter(s => s.active).length;

                  return (
                    <div
                      key={category.id}
                      className={`rounded-xl p-4 border-2 transition-all ${
                        category.active
                          ? 'bg-primary/5 border-primary/30'
                          : 'bg-muted/50 border-border opacity-60'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground mb-1">{category.name}</h4>
                          {category.description && (
                            <p className="text-xs text-muted-foreground">{category.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                            {phrasesCount} frases
                          </span>
                          <span className="px-2 py-1 rounded-md bg-muted text-muted-foreground text-xs font-semibold">
                            {category.subcategories.length} subcategorías
                          </span>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelectedCategoryId(selectedCategoryId === category.id ? null : category.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                              selectedCategoryId === category.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            title="Ver subcategorías"
                          >
                            {selectedCategoryId === category.id ? 'Ocultar' : 'Ver'} subcategorías
                          </button>
                          <button
                            onClick={() => handleToggleCategoryActive(category.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              category.active
                                ? 'text-success hover:bg-success/10'
                                : 'text-muted-foreground hover:bg-muted'
                            }`}
                            title={category.active ? 'Desactivar' : 'Activar'}
                          >
                            {category.active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                          </button>
                          <button
                            onClick={() => handleEditCategory(category)}
                            className="p-2 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(category.id)}
                            className="p-2 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Subcategorías */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Subcategorías</h3>
              </div>

              {!selectedCategory ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-muted/30 rounded-xl">
                  <Tag className="h-12 w-12 text-muted-foreground/30 mb-4" />
                  <p className="text-muted-foreground font-medium">Selecciona una categoría</p>
                  <p className="text-xs text-muted-foreground mt-1">Haz clic en "Ver subcategorías" para gestionar las subcategorías de una categoría</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        {selectedCategory.name}
                      </h4>
                      <button
                        onClick={() => handleCreateSubcategory(selectedCategory)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-all"
                      >
                        <Plus className="h-3 w-3" />
                        Nueva Subcategoría
                      </button>
                    </div>

                    {selectedCategory.subcategories.length === 0 ? (
                      <div className="text-xs text-muted-foreground italic p-6 bg-muted/30 rounded-lg text-center">
                        Esta categoría no tiene subcategorías aún
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {selectedCategory.subcategories.map(subcategory => {
                          const phrasesCount = getPhrasesCount(selectedCategory.id, subcategory.id);

                          return (
                            <div
                              key={subcategory.id}
                              className={`rounded-lg p-3 border transition-all ${
                                subcategory.active
                                  ? 'bg-background border-border'
                                  : 'bg-muted/50 border-border opacity-60'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="text-sm font-medium text-foreground">{subcategory.name}</h5>
                                  {subcategory.description && (
                                    <p className="text-xs text-muted-foreground mt-0.5">{subcategory.description}</p>
                                  )}
                                  <span className="inline-block mt-2 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-semibold">
                                    {phrasesCount} frases
                                  </span>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => handleToggleSubcategoryActive(selectedCategory.id, subcategory.id)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                      subcategory.active
                                        ? 'text-success hover:bg-success/10'
                                        : 'text-muted-foreground hover:bg-muted'
                                    }`}
                                    title={subcategory.active ? 'Desactivar' : 'Activar'}
                                  >
                                    {subcategory.active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                                  </button>
                                  <button
                                    onClick={() => handleEditSubcategory(selectedCategory, subcategory)}
                                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors"
                                    title="Editar"
                                  >
                                    <Edit2 className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSubcategory(selectedCategory.id, subcategory.id)}
                                    className="p-1.5 rounded-lg text-destructive hover:bg-destructive/10 transition-colors"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modals */}
        <CategoryModal
          open={showCategoryModal}
          onOpenChange={setShowCategoryModal}
          category={editingCategory}
          onSave={handleSaveCategory}
        />

        <SubcategoryModal
          open={showSubcategoryModal}
          onOpenChange={setShowSubcategoryModal}
          category={editingSubcategory?.category || null}
          subcategory={editingSubcategory?.subcategory || null}
          onSave={handleSaveSubcategory}
        />
      </div>
    </div>
  );
}
