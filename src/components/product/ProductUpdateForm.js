'use client';
import { useState, useEffect, useCallback } from 'react';
import { productService } from '@/api/productService';
import { ProductRequest } from "@/models/product";
import { categoryService } from '@/api/categoryService';
import { petTypeService } from '@/api/petTypeService';
import { ProductFormFields } from '@/components/product/ProductFormFields';
import { ProductFormButtons } from '@/components/product/ProductFormButtons';
import { ProductImagesStep } from '@/components/product/ProductImagesStep';
import { ValidationErrors } from '@/components/product/ValidationErrors';
import styles from './ProductForm.module.css';

export default function ProductUpdateForm({ 
  productId, 
  onSuccess, 
  onCancel,
  onDelete 
}) {
  const [step, setStep] = useState(1); // 1 - форма товара, 2 - управление картинками
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [isDeleteConfirm, setIsDeleteConfirm] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);
  const [loadError, setLoadError] = useState(null);
  const [originalProduct, setOriginalProduct] = useState(null); // Сохраняем оригинальный объект продукта
  
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
    petTypeIds: [] // Для отправки в ProductRequest
  });

  const [selectedPetTypes, setSelectedPetTypes] = useState([]); // Массив объектов для отображения
  const [imagesKey, setImagesKey] = useState(0); // Ключ для принудительного обновления компонента изображений

  // Мемоизируем загрузку изображений товара
  const loadProductImages = useCallback(async () => {
    if (!productId) return;
    
    try {
      const productData = await productService.getByIdWithAllInfo(productId);
      const images = Array.isArray(productData?.productImages) 
        ? productData.productImages 
        : [];
      console.log('Изображения загружены:', images);
      setExistingImages(images);
      // Меняем ключ, чтобы компонент сбросил внутреннее состояние
      setImagesKey(prev => prev + 1);
    } catch (error) {
      console.error('Ошибка загрузки изображений:', error);
      setExistingImages([]);
    }
  }, [productId]);

  // Загрузка данных товара и справочников
  useEffect(() => {
    const loadData = async () => {
      try {
        setFetching(true);
        setLoadError(null);
        
        console.log('=== ЗАГРУЗКА ДАННЫХ ТОВАРА ===');
        console.log('ID товара:', productId);
        
        // Загружаем все данные параллельно
        const [productData, categoriesData, petTypesData] = await Promise.all([
          productService.getByIdWithAllInfo(productId),
          categoryService.getAllAsync(),
          petTypeService.getAll().catch(() => [])
        ]);
        
        console.log('Данные товара загружены (ProductResponse):', productData);
        
        // Заполняем форму данными товара
        if (productData) {
          // Сохраняем оригинальный объект продукта
          setOriginalProduct(productData);
          
          // Извлекаем petTypeIds из массива petTypes (объектов)
          const petTypeIds = Array.isArray(productData.petTypes) 
            ? productData.petTypes.map(pet => pet.id).filter(id => id !== undefined && id !== null)
            : [];
          
          // Конвертируем ProductResponse в данные для формы
          const formattedData = {
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price?.toString() || '0',
            costPrice: productData.costPrice?.toString() || '0',
            quantity: productData.quantity?.toString() || '0',
            brand: productData.brand || '',
            isPromotion: Boolean(productData.isPromotion),
            isActive: productData.isActive !== undefined ? Boolean(productData.isActive) : true,
            categoryId: productData.categoryId?.toString() || '',
            petTypeIds: petTypeIds // Это массив ID для ProductRequest
          };
          
          console.log('Форматированные данные для формы:', formattedData);
          console.log('PetType IDs для отправки:', petTypeIds);
          console.log('PetTypes объекты из ProductResponse:', productData.petTypes);
          
          setFormData(formattedData);
          
          // Сохраняем выбранные типы животных как объекты для отображения
          setSelectedPetTypes(productData.petTypes || []);
          
          // Сохраняем изображения товара (массив ProductImageResponse)
          const images = Array.isArray(productData.productImages) 
            ? productData.productImages 
            : [];
          console.log('Изображения товара загружены:', images);
          setExistingImages(images);
        } else {
          throw new Error('Товар не найден');
        }
        
        // Сохраняем категории и типы животных
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setPetTypes(Array.isArray(petTypesData) ? petTypesData : []);
        
        console.log('=== ЗАГРУЗКА ЗАВЕРШЕНА ===');
        
      } catch (error) {
        console.error('Ошибка загрузки данных товара:', error);
        setLoadError(error.message || 'Неизвестная ошибка загрузки');
      } finally {
        setFetching(false);
      }
    };
    
    if (productId) {
      loadData();
    } else {
      setLoadError('ID товара не указан');
      setFetching(false);
    }
  }, [productId]); // Зависимость только от productId

  // Мемоизируем обработчик изменения изображений
  const handleImagesChange = useCallback((updatedImages) => {
    console.log('Images changed:', updatedImages);
    setExistingImages(updatedImages);
  }, []); // Без зависимостей

  // Мемоизируем обработчик удаления изображения
  const handleImageDelete = useCallback(() => {
    console.log('Image deleted, reloading images...');
    // Перезагружаем изображения товара
    loadProductImages();
  }, [loadProductImages]); // Зависимость от loadProductImages

  // Очищаем ошибки валидации при изменении данных
  useEffect(() => {
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleNumberInput = (name, value) => {
    if (value === '') {
      setFormData(prev => ({
        ...prev,
        [name]: ''
      }));
    } else {
      const numValue = Number(value);
      setFormData(prev => ({
        ...prev,
        [name]: isNaN(numValue) ? '' : numValue.toString()
      }));
    }
  };

  const handlePetTypeToggle = (petTypeId) => {
    setFormData(prev => {
      const currentIds = Array.isArray(prev.petTypeIds) ? prev.petTypeIds : [];
      const isSelected = currentIds.includes(petTypeId);
      
      let newIds;
      if (isSelected) {
        // Удаляем ID
        newIds = currentIds.filter(id => id !== petTypeId);
        // Обновляем selectedPetTypes
        setSelectedPetTypes(prevSelected => 
          prevSelected.filter(pet => pet.id !== petTypeId)
        );
      } else {
        // Добавляем ID
        newIds = [...currentIds, petTypeId];
        // Находим объект petType и добавляем в selectedPetTypes
        const petTypeToAdd = petTypes.find(pet => pet.id === petTypeId);
        if (petTypeToAdd) {
          setSelectedPetTypes(prevSelected => [...prevSelected, petTypeToAdd]);
        }
      }
      
      return { ...prev, petTypeIds: newIds };
    });
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.name || !formData.name.trim()) errors.push('Название товара обязательно');
    if (!formData.description || !formData.description.trim()) errors.push('Описание товара обязательно');
    
    const priceNum = Number(formData.price);
    if (!formData.price || isNaN(priceNum) || priceNum <= 0) {
      errors.push('Цена должна быть числом больше 0');
    }
    
    if (!formData.categoryId) errors.push('Выберите категорию');
    
    const petTypeIds = Array.isArray(formData.petTypeIds) ? formData.petTypeIds : [];
    if (petTypeIds.length === 0) {
      errors.push('Выберите хотя бы один тип животного');
    }
    
    return errors;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      alert(errors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      // Создаем запрос на обновление согласно ProductRequest
      const request = new ProductRequest();
      
      // Заполняем поля из formData
      request.name = formData.name.trim();
      request.description = formData.description.trim();
      request.price = Number(formData.price) || 0;
      request.costPrice = formData.costPrice ? Number(formData.costPrice) : 0;
      request.quantity = Number(formData.quantity) || 0;
      request.brand = formData.brand.trim();
      
      // Сохраняем рейтинг из оригинального продукта (обычно не меняется при обновлении)
      request.rating = originalProduct?.rating || 0;
      
      request.isPromotion = Boolean(formData.isPromotion);
      request.isActive = Boolean(formData.isActive);
      request.categoryId = Number(formData.categoryId);
      
      // Конвертируем petTypeIds в массив чисел для ProductRequest
      const petTypeIds = Array.isArray(formData.petTypeIds) 
        ? formData.petTypeIds.map(id => Number(id)).filter(id => !isNaN(id))
        : [];
      request.petTypeIds = petTypeIds;

      console.log('=== ОБНОВЛЕНИЕ ТОВАРА ===');
      console.log('ID товара:', productId);
      console.log('ProductRequest для отправки:', request);
      console.log('PetTypeIds для отправки:', petTypeIds);
      console.log('Рейтинг из оригинала:', originalProduct?.rating);
      
      // Используем метод updateById с productId и ProductRequest
      const updatedProduct = await productService.updateById(productId, request);
      
      console.log('Товар успешно обновлен (ProductResponse):', updatedProduct);
      
      // Обновляем originalProduct с новыми данными
      setOriginalProduct(updatedProduct);
      
      alert(`Товар "${updatedProduct.name}" успешно обновлен!`);
      
      // Переходим к шагу управления картинками
      setStep(2);
      
    } catch (error) {
      console.error('Ошибка обновления товара:', error);
      alert(`Ошибка обновления товара: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleteConfirm) {
      setIsDeleteConfirm(true);
      return;
    }

    const confirmed = window.confirm(
      `Вы уверены, что хотите удалить товар "${formData.name}"?\n` +
      `Это действие нельзя отменить.`
    );

    if (!confirmed) {
      setIsDeleteConfirm(false);
      return;
    }

    setLoading(true);
    try {
      await productService.deleteById(productId);
      alert('Товар успешно удален!');
      if (onDelete) onDelete();
    } catch (error) {
      console.error('Ошибка удаления товара:', error);
      alert(`Ошибка удаления товара: ${error.message}`);
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

  const handleClearForm = () => {
    const confirmed = window.confirm(
      'Вы уверены, что хотите очистить форму?\n' +
      'Все внесенные изменения будут потеряны.'
    );
    
    if (confirmed && originalProduct) {
      // Используем оригинальный ProductResponse для восстановления формы
      const petTypeIds = Array.isArray(originalProduct.petTypes) 
        ? originalProduct.petTypes.map(pet => pet.id).filter(id => id !== undefined && id !== null)
        : [];
      
      const formattedData = {
        name: originalProduct.name || '',
        description: originalProduct.description || '',
        price: originalProduct.price?.toString() || '0',
        costPrice: originalProduct.costPrice?.toString() || '0',
        quantity: originalProduct.quantity?.toString() || '0',
        brand: originalProduct.brand || '',
        isPromotion: Boolean(originalProduct.isPromotion),
        isActive: originalProduct.isActive !== undefined ? Boolean(originalProduct.isActive) : true,
        categoryId: originalProduct.categoryId?.toString() || '',
        petTypeIds: petTypeIds
      };
      
      setFormData(formattedData);
      setSelectedPetTypes(originalProduct.petTypes || []);
      setExistingImages(originalProduct.productImages || []);
    }
  };

  // Показываем ошибку загрузки
  if (loadError) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div className={styles.errorIcon}>⚠️</div>
          <h3>Ошибка загрузки данных</h3>
          <p>{loadError}</p>
          <div className={styles.errorButtons}>
            <button
              type="button"
              onClick={onCancel}
              className={styles.cancelButton}
            >
              Закрыть
            </button>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className={styles.submitButton}
            >
              Обновить страницу
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Загрузка
  if (fetching) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div className={styles.loadingSpinner}></div>
          <p>Загрузка данных товара...</p>
          <p className={styles.loadingDetail}>ID товара: {productId}</p>
        </div>
      </div>
    );
  }

  // Шаг 1: Форма редактирования товара
  if (step === 1) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Редактирование товара</h2>
          <div className={styles.productId}>ID: {productId}</div>
          <div className={styles.currentName}>
            Текущее название: <strong>{formData.name}</strong>
          </div>
        </div>
        
        {/* Отладочная информация */}
        <div className={styles.debugInfo}>
          <details>
            <summary>Информация о загрузке</summary>
            <div className={styles.debugStats}>
              <p><strong>Товар:</strong> {formData.name}</p>
              <p><strong>Рейтинг (из оригинала):</strong> {originalProduct?.rating || 0}</p>
              <p><strong>Категорий загружено:</strong> {categories.length}</p>
              <p><strong>Типов животных загружено:</strong> {petTypes.length}</p>
              <p><strong>Выбрано типов животных:</strong> {Array.isArray(formData.petTypeIds) ? formData.petTypeIds.length : 0}</p>
              <p><strong>Изображений товара:</strong> {existingImages.length}</p>
              <p><strong>Категория ID:</strong> {formData.categoryId || '(не выбран)'}</p>
            </div>
          </details>
        </div>
        
        <ValidationErrors errors={validationErrors} />
        
        <form onSubmit={handleUpdate} className={styles.form}>
          <ProductFormFields
            formData={formData}
            categories={categories}
            petTypes={petTypes}
            loading={loading}
            validationErrors={validationErrors}
            fetching={fetching}
            onInputChange={handleInputChange}
            onNumberInput={handleNumberInput}
            onPetTypeToggle={handlePetTypeToggle}
          />

          <ProductFormButtons
            mode="update"
            loading={loading}
            validationErrors={validationErrors}
            formData={formData}
            categories={categories}
            onCancel={onCancel}
            onClear={handleClearForm}
            onDelete={handleDelete}
            isDeleteConfirm={isDeleteConfirm}
            onSubmit={handleUpdate}
            submitLabel="Сохранить изменения"
          />
        </form>
      </div>
    );
  }

  // Шаг 2: Управление картинками
  return (
    <div className={styles.container}>
      <ProductImagesStep
        key={`images-${productId}-${imagesKey}`} // Добавляем ключ для сброса состояния
        productId={productId}
        productName={formData.name}
        existingImages={existingImages}
        onBack={handleBackToEdit}
        onFinish={handleFinish}
        onImagesChange={handleImagesChange}
        onImageDelete={handleImageDelete}
        mode="update"
      />
    </div>
  );
}