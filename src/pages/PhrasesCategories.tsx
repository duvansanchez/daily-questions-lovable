import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Eye, EyeOff, Tag } from 'lucide-react';
import { phrasesAPI } from '@/services/api';
import CategoryModal from '../components/phrases/CategoryModal';
import SubcategoryModal from '../components/phrases/SubcategoryModal';
import type { PhraseCategory, PhraseSubcategory } from '@/types';

interface CategoryWithCount extends PhraseCategory {
  phraseCount: number;
  subcategories: SubcategoryWithCount[];
}

interface SubcategoryWithCount extends PhraseSubcategory {
  phraseCount: number;
}

function mapCategory(item: any): CategoryWithCount {
  return {
    id: String(item.id),
    name: item.name,
    description: item.description || undefined,
    active: item.active,
    phraseCount: item.phrase_count ?? 0,
    subcategories: (item.subcategories ?? []).map((s: any): SubcategoryWithCount => ({
      id: String(s.id),
      name: s.name,
      description: s.description || undefined,
      active: s.active,
      phraseCount: s.phrase_count ?? 0,
    })),
  };
}

export default function PhrasesCategories() {
  const [categories, setCategories] = useState<CategoryWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<PhraseCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<{ category: PhraseCategory; subcategory: PhraseSubcategory } | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

  const loadCategories = async () => {
    try {
      const data = await phrasesAPI.getCategoriesAdmin();
      setCategories(data.map(mapCategory));
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleCreateCategory = () => {
    setEditingCategory(null);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: PhraseCategory) => {
    setEditingCategory(category);
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (cat && cat.phraseCount > 0) {
      alert(`No puedes eliminar esta categoría porque tiene ${cat.phraseCount} frases asociadas.`);
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta categoría?')) return;
    const prev = categories;
    setCategories(c => c.filter(x => x.id !== id));
    try {
      await phrasesAPI.deleteCategory(id);
      if (selectedCategoryId === id) setSelectedCategoryId(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setCategories(prev);
    }
  };

  const handleToggleCategoryActive = async (id: string) => {
    const cat = categories.find(c => c.id === id);
    if (!cat) return;
    const nextActive = !cat.active;
    setCategories(prev => prev.map(c => c.id === id ? { ...c, active: nextActive } : c));
    try {
      await phrasesAPI.updateCategory(id, { active: nextActive });
    } catch (error) {
      console.error('Error toggling category:', error);
      setCategories(prev => prev.map(c => c.id === id ? { ...c, active: cat.active } : c));
    }
  };

  const handleSaveCategory = async (formData: any) => {
    try {
      if (editingCategory) {
        const updated = await phrasesAPI.updateCategory(editingCategory.id, {
          name: formData.name,
          description: formData.description || null,
          active: formData.active,
        });
        setCategories(prev => prev.map(c =>
          c.id === editingCategory.id
            ? { ...c, name: updated.name || formData.name, description: updated.description || formData.description, active: updated.active ?? formData.active }
            : c
        ));
      } else {
        await phrasesAPI.createCategory({
          name: formData.name,
          description: formData.description || null,
          active: formData.active,
        });
        await loadCategories();
      }
    } catch (error) {
      console.error('Error saving category:', error);
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

  const handleDeleteSubcategory = async (categoryId: string, subcategoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    const sub = cat?.subcategories.find(s => s.id === subcategoryId) as SubcategoryWithCount | undefined;
    if (sub && sub.phraseCount > 0) {
      alert(`No puedes eliminar esta subcategoría porque tiene ${sub.phraseCount} frases asociadas.`);
      return;
    }
    if (!confirm('¿Estás seguro de eliminar esta subcategoría?')) return;
    const prev = categories;
    setCategories(prev => prev.map(c =>
      c.id === categoryId ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subcategoryId) } : c
    ));
    try {
      await phrasesAPI.deleteSubcategory(subcategoryId);
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      setCategories(prev);
    }
  };

  const handleToggleSubcategoryActive = async (categoryId: string, subcategoryId: string) => {
    const cat = categories.find(c => c.id === categoryId);
    const sub = cat?.subcategories.find(s => s.id === subcategoryId);
    if (!sub) return;
    const nextActive = !sub.active;
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, subcategories: c.subcategories.map(s => s.id === subcategoryId ? { ...s, active: nextActive } : s) }
        : c
    ));
    try {
      await phrasesAPI.updateSubcategory(subcategoryId, { active: nextActive });
    } catch (error) {
      console.error('Error toggling subcategory:', error);
      setCategories(prev => prev.map(c =>
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.map(s => s.id === subcategoryId ? { ...s, active: sub.active } : s) }
          : c
      ));
    }
  };

  const handleSaveSubcategory = async (formData: any) => {
    if (!editingSubcategory) return;
    const { category } = editingSubcategory;
    try {
      if (editingSubcategory.subcategory) {
        const updated = await phrasesAPI.updateSubcategory(editingSubcategory.subcategory.id, {
          name: formData.name,
          description: formData.description || null,
          active: formData.active,
        });
        setCategories(prev => prev.map(c =>
          c.id === category.id
            ? { ...c, subcategories: c.subcategories.map(s =>
                s.id === editingSubcategory.subcategory.id
                  ? { ...s, name: updated.name || formData.name, description: updated.description || formData.description, active: updated.active ?? formData.active }
                  : s
              )}
            : c
        ));
      } else {
        await phrasesAPI.createSubcategory({
          name: formData.name,
          description: formData.description || null,
          active: formData.active,
          category_id: category.id,
        });
        await loadCategories();
      }
    } catch (error) {
      console.error('Error saving subcategory:', error);
    }
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

          {loading ? (
            <div className="text-sm text-muted-foreground py-8 text-center">Cargando...</div>
          ) : (
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
                  {categories.map(category => (
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
                            {category.phraseCount} frases
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
                  ))}
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
                            const sub = subcategory as SubcategoryWithCount;
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
                                      {sub.phraseCount} frases
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
          )}
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
