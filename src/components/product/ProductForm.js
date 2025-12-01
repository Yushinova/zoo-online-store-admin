'use client';
import { useState, useEffect } from 'react';
import { productService } from '@/api/productService';
import { ProductRequest } from "@/models/product";
import { categoryService } from '@/api/categoryService';
import { petTypeService } from '@/api/petTypeService';
import ImageUploader from '@/components/imageUpload/ImageUpoad';
import styles from './ProductForm.module.css';

export default function ProductForm({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1); // 1 - форма товара, 2 - загрузка картинок
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [createdProductId, setCreatedProductId] = useState(null);
  const [createdProductName, setCreatedProductName] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    costPrice: '',
    quantity: '',
    brand: '',
    isPromotion: false,
    isActive: true,
    categoryId: '',
    petTypeIds: []
  });

  // Загрузка категорий и типов животных
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Загрузка категорий и типов животных...');
        const [categoriesData, petTypesData] = await Promise.all([
          categoryService.getAllAsync(),
          petTypeService.getAllWithCategoties()
        ]);
        
        console.log('Категории загружены:', categoriesData);
        console.log('Типы животных загружены:', petTypesData);
        
        setCategories(categoriesData || []);
        setPetTypes(petTypesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Ошибка загрузки данных. Пожалуйста, обновите страницу.');
      }
    };
    loadData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInput = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value === '' ? '' : Number(value)
    }));
  };

  const handlePetTypeToggle = (petTypeId) => {
    setFormData(prev => {
      const newIds = prev.petTypeIds.includes(petTypeId)
        ? prev.petTypeIds.filter(id => id !== petTypeId)
        : [...prev.petTypeIds, petTypeId];
      return { ...prev, petTypeIds: newIds };
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name.trim()) errors.push('Название товара обязательно');
    if (!formData.description.trim()) errors.push('Описание товара обязательно');
    if (!formData.price || Number(formData.price) <= 0) errors.push('Цена должна быть больше 0');
    if (!formData.categoryId) errors.push('Выберите категорию');
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      // Создаем запрос
      const request = new ProductRequest();
      request.name = formData.name.trim();
      request.description = formData.description.trim();
      request.price = Number(formData.price);
      request.costPrice = formData.costPrice ? Number(formData.costPrice) : 0;
      request.quantity = Number(formData.quantity) || 0;
      request.brand = formData.brand.trim();
      request.rating = 0; // По умолчанию 0
      request.isPromotion = formData.isPromotion;
      request.isActive = formData.isActive;
      request.categoryId = Number(formData.categoryId);
      request.petTypeIds = formData.petTypeIds.map(id => Number(id));

      console.log('Creating product with data:', request);
      const createdProduct = await productService.insertProduct(request);
      
      console.log('Product created:', createdProduct);
      setCreatedProductId(createdProduct.id);
      setCreatedProductName(createdProduct.name);
      
      alert(`Товар "${createdProduct.name}" успешно создан! ID: ${createdProduct.id}\nТеперь вы можете загрузить изображения.`);
      
      // Переходим к шагу загрузки картинок
      setStep(2);
      
    } catch (error) {
      console.error('Error creating product:', error);
      alert(`Ошибка создания товара: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleBackToEdit = () => {
    setStep(1);
  };

  const clearForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      costPrice: '',
      quantity: '',
      brand: '',
      isPromotion: false,
      isActive: true,
      categoryId: '',
      petTypeIds: []
    });
  };

  // Шаг 1: Форма создания товара
  if (step === 1) {
    return (
      <div className={styles.container}>
        <h2 className={styles.title}>Создание нового товара</h2>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Основная информация */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Основная информация</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Название товара *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Введите название товара"
                className={styles.input}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Описание *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Опишите товар"
                className={styles.textarea}
                rows={4}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Бренд
              </label>
              <input
                type="text"
                name="brand"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="Введите бренд"
                className={styles.input}
              />
            </div>
          </div>

          {/* Цены и количество */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Цены и количество</h3>
            
            <div className={styles.gridTwo}>
              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Цена продажи *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={(e) => handleNumberInput('price', e.target.value)}
                  placeholder="0.00"
                  className={styles.input}
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Себестоимость
                </label>
                <input
                  type="number"
                  name="costPrice"
                  value={formData.costPrice}
                  onChange={(e) => handleNumberInput('costPrice', e.target.value)}
                  placeholder="0.00"
                  className={styles.input}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>
                Количество на складе
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={(e) => handleNumberInput('quantity', e.target.value)}
                placeholder="0"
                className={styles.input}
                min="0"
              />
            </div>
          </div>

          {/* Категория */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Категория</h3>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>
                Категория *
              </label>
              {categories.length === 0 ? (
                <div className={styles.loadingText}>
                  Загрузка категорий...
                </div>
              ) : (
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  className={styles.select}
                  required
                >
                  <option value="">Выберите категорию</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Типы животных */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Типы животных</h3>
            
            {petTypes.length === 0 ? (
              <div className={styles.loadingText}>
                Загрузка типов животных...
              </div>
            ) : (
              <>
                <div className={styles.petTypesGrid}>
                  {petTypes.map(petType => (
                    <label key={petType.id} className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={formData.petTypeIds.includes(petType.id)}
                        onChange={() => handlePetTypeToggle(petType.id)}
                        className={styles.checkbox}
                      />
                      <span className={styles.checkboxText}>{petType.name}</span>
                    </label>
                  ))}
                </div>
                {formData.petTypeIds.length > 0 && (
                  <p className={styles.selectedCount}>
                    Выбрано: {formData.petTypeIds.length} типа(ов) животных
                  </p>
                )}
              </>
            )}
          </div>

          {/* Статусы */}
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Статусы</h3>
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isPromotion"
                  checked={formData.isPromotion}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Акционный товар</span>
              </label>
              
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxText}>Активный (доступен для продажи)</span>
              </label>
            </div>
          </div>

          {/* Кнопки */}
          <div className={styles.buttons}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className={styles.cancelButton}
                disabled={loading}
              >
                Отмена
              </button>
            )}
            
            <button
              type="button"
              onClick={clearForm}
              className={styles.clearButton}
              disabled={loading}
            >
              Очистить
            </button>
            
            <button
              type="submit"
              className={styles.submitButton}
              disabled={loading || categories.length === 0}
            >
              {loading ? (
                <>
                  <div className={styles.loadingSpinner}></div>
                  Создание...
                </>
              ) : (
                'Создать товар'
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Шаг 2: Загрузка картинок
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Загрузка изображений</h2>
      
      <div className={styles.successMessage}>
        <div className={styles.successIcon}>✓</div>
        <h3>Товар успешно создан!</h3>
        <p>
          <strong>Название:</strong> {createdProductName}<br />
          <strong>ID:</strong> {createdProductId}
        </p>
        <p className={styles.successHint}>
          Теперь вы можете загрузить изображения для этого товара.
          Это можно сделать сейчас или позже через редактирование товара.
        </p>
      </div>

      {/* Компонент загрузки картинок */}
      <div className={styles.uploadSection}>
        <ImageUploader 
          productId={createdProductId}
          onImagesChange={(images) => {
            console.log('Изображения загружены:', images);
            if (images.length > 0) {
              alert(`Загружено ${images.length} изображений для товара "${createdProductName}"`);
            }
          }}
        />
      </div>

      {/* Кнопки */}
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={handleBackToEdit}
          className={styles.backButton}
        >
          ← Вернуться к созданию товара
        </button>
        
        <button
          type="button"
          onClick={handleFinish}
          className={styles.finishButton}
        >
          Завершить (можно добавить изображения позже)
        </button>
      </div>
    </div>
  );
}