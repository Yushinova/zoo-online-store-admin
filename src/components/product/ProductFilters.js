'use client';
import { useState, useEffect } from 'react';
import { categoryService } from '@/api/categoryService';
import { petTypeService } from '@/api/petTypeService';
import { ProductQueryParameters } from "@/models/product";
import styles from './ProductFilters.module.css';

export default function ProductFilters({ 
  filters = new ProductQueryParameters(), 
  onFiltersChange,
  onApplyFilters,
  onResetFilters 
}) {
  const [categories, setCategories] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localFilters, setLocalFilters] = useState(filters);

  // Загрузка категорий и типов животных
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [categoriesData, petTypesData] = await Promise.all([
          categoryService.getAllAsync(),
          petTypeService.getAllWithCategoties()
        ]);
        setCategories(categoriesData);
        setPetTypes(petTypesData);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Обновление локальных фильтров при изменении пропсов
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleInputChange = (field, value) => {
    const newFilters = {
      ...localFilters,
      [field]: value === '' ? null : value
    };
    setLocalFilters(newFilters);
    
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleApply = () => {
    if (onApplyFilters) {
      onApplyFilters(localFilters);
    }
  };

  const handleReset = () => {
    const resetFilters = new ProductQueryParameters();
    // Сохраняем пагинацию при сбросе
    resetFilters.page = localFilters.page;
    resetFilters.pageSize = localFilters.pageSize;
    
    setLocalFilters(resetFilters);
    
    if (onResetFilters) {
      onResetFilters(resetFilters);
    }
    
    if (onFiltersChange) {
      onFiltersChange(resetFilters);
    }
  };

  const handleNumberInput = (field, value) => {
    const numValue = value === '' ? null : Number(value);
    handleInputChange(field, numValue);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        Загрузка фильтров...
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3 className={styles.title}>Фильтры товаров</h3>
        <div className={styles.actions}>
          <button 
            onClick={handleReset}
            className={styles.resetButton}
            type="button"
          >
            Сбросить
          </button>
          <button 
            onClick={handleApply}
            className={styles.applyButton}
            type="button"
          >
            Применить
          </button>
        </div>
      </div>

      {/* Верхняя строка - основные фильтры */}
      <div className={styles.topRow}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Название товара</label>
          <input
            type="text"
            value={localFilters.name || ''}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Введите название..."
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Бренд</label>
          <input
            type="text"
            value={localFilters.brand || ''}
            onChange={(e) => handleInputChange('brand', e.target.value)}
            placeholder="Введите бренд..."
            className={styles.input}
          />
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Цена</label>
          <div className={styles.priceRange}>
            <input
              type="number"
              value={localFilters.minPrice || ''}
              onChange={(e) => handleNumberInput('minPrice', e.target.value)}
              placeholder="Мин"
              className={styles.priceInput}
              min="0"
            />
            <span className={styles.priceSeparator}>—</span>
            <input
              type="number"
              value={localFilters.maxPrice || ''}
              onChange={(e) => handleNumberInput('maxPrice', e.target.value)}
              placeholder="Макс"
              className={styles.priceInput}
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Нижняя строка - дополнительные фильтры */}
      <div className={styles.bottomRow}>
        <div className={styles.filterGroup}>
          <label className={styles.label}>Рейтинг от</label>
          <select
            value={localFilters.rating || ''}
            onChange={(e) => handleNumberInput('rating', e.target.value)}
            className={styles.select}
          >
            <option value="">Любой</option>
            <option value="4">4+ ★</option>
            <option value="3">3+ ★</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Категория</label>
          <select
            value={localFilters.categoryId || ''}
            onChange={(e) => handleNumberInput('categoryId', e.target.value)}
            className={styles.select}
          >
            <option value="">Все категории</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Тип животного</label>
          <select
            value={localFilters.petTypeId || ''}
            onChange={(e) => handleNumberInput('petTypeId', e.target.value)}
            className={styles.select}
          >
            <option value="">Все типы</option>
            {petTypes.map(petType => (
              <option key={petType.id} value={petType.id}>
                {petType.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.label}>Статус</label>
          <div className={styles.checkboxGroup}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localFilters.isActive === true}
                onChange={(e) => handleInputChange('isActive', e.target.checked ? true : null)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Активные</span>
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={localFilters.isPromotion === true}
                onChange={(e) => handleInputChange('isPromotion', e.target.checked ? true : null)}
                className={styles.checkbox}
              />
              <span className={styles.checkboxText}>Акционные</span>
            </label>
          </div>
        </div>
      </div>

      {/* Мобильная версия - компактные кнопки */}
      <div className={styles.mobileActions}>
        <button 
          onClick={handleReset}
          className={styles.mobileResetButton}
          type="button"
        >
          Сбросить
        </button>
        <button 
          onClick={handleApply}
          className={styles.mobileApplyButton}
          type="button"
        >
          Применить
        </button>
      </div>
    </div>
  );
}