'use client';
import { useState, useEffect } from 'react';
import { categoryService } from '@/api/categoryService';
import styles from './CategoryManager.module.css';

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  //загрузка категорий
  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAllAsync();
      setCategories(data);
      setError('');
    } catch (err) {
      console.error('Error loading categories:', err);
      setError(`Ошибка загрузки: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  //добавление новой категории
  const handleAddCategory = async (e) => {
    e.preventDefault();
    
    if (!newCategoryName.trim()) {
      alert('Пожалуйста, введите название категории');
      return;
    }

    setSubmitting(true);

    try {
      const categoryRequest = {
        name: newCategoryName.trim()
      };

      await categoryService.insert(categoryRequest);
      
      //очищаем форму и обновляем список
      setNewCategoryName('');
      setShowAddForm(false);
      await loadCategories();
      
      alert(`Категория "${newCategoryName}" успешно создана!`);
    } catch (err) {
      console.error('Error adding category:', err);
      alert(`Ошибка создания категории: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  //удаление категории
  const handleDeleteCategory = async (category) => {
    if (!confirm(`Вы уверены, что хотите удалить категорию "${category.name}"?`)) {
      return;
    }

    setDeletingId(category.id);

    try {
      await categoryService.deleteById(category.id);
      await loadCategories();
      alert(`Категория "${category.name}" успешно удалена!`);
    } catch (err) {
      console.error('Error deleting category:', err);
      alert(`Ошибка удаления категории: ${err.message}`);
    } finally {
      setDeletingId(null);
    }
  };

  const cancelAdd = () => {
    setShowAddForm(false);
    setNewCategoryName('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Управление категориями</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
          disabled={showAddForm}
        >
          <svg className={styles.addIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Добавить категорию
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/*ФОРМА ДОБАВЛЕНИЯ*/}
      {showAddForm && (
        <div className={styles.addFormContainer}>
          <form onSubmit={handleAddCategory} className={styles.addForm}>
            <h3 className={styles.addFormTitle}>Новая категория</h3>
            <div className={styles.formGroup}>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Введите название категории"
                className={styles.nameInput}
                autoFocus
                disabled={submitting}
              />
            </div>
            <div className={styles.formActions}>
              <button
                type="button"
                onClick={cancelAdd}
                disabled={submitting}
                className={styles.cancelButton}
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={submitting || !newCategoryName.trim()}
                className={styles.submitButton}
              >
                {submitting ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Создание...
                  </>
                ) : (
                  'Создать категорию'
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/*СПИСОК КАТЕГОРИЙ*/}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          Загрузка категорий...
        </div>
      ) : categories.length === 0 ? (
        <div className={styles.emptyState}>
          <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
          <h3>Категории не найдены</h3>
          <p>Добавьте первую категорию для организации товаров</p>
        </div>
      ) : (
        <div className={styles.categoriesList}>
          {categories.map(category => (
            <div key={category.id} className={styles.categoryItem}>
              <div className={styles.categoryInfo}>
                <span className={styles.categoryName}>{category.name}</span>
              </div>
              <button
                onClick={() => handleDeleteCategory(category)}
                disabled={deletingId === category.id}
                className={styles.deleteButton}
              >
                {deletingId === category.id ? (
                  <>
                    <div className={styles.loadingSpinner}></div>
                    Удаление...
                  </>
                ) : (
                  <>
                    <svg className={styles.deleteIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                    Удалить
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}