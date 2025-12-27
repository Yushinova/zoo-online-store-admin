'use client';
import { useState, useEffect } from 'react';
import { productService } from '@/api/productService';
import { ProductRequest } from "@/models/product";
import { categoryService } from '@/api/categoryService';
import { petTypeService } from '@/api/petTypeService';
import { ProductFormFields } from '@/components/product/ProductFormFields';
import { ProductFormButtons } from '@/components/product/ProductFormButtons';
import { ProductImagesStep } from '@/components/product/ProductImagesStep';
import { ValidationErrors } from '@/components/product/ValidationErrors';
import { ProductFormHeader } from '@/components/product/ProductFormHeader';
import styles from './ProductForm.module.css';

export default function ProductForm({ onSuccess, onCancel }) {
  const [step, setStep] = useState(1); //1 - форма товара, 2 - загрузка картинок
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [petTypes, setPetTypes] = useState([]);
  const [createdProductId, setCreatedProductId] = useState(null);
  const [createdProductName, setCreatedProductName] = useState('');
  const [validationErrors, setValidationErrors] = useState([]);
  
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

  //загрузка категорий и типов животных
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Загрузка категорий и типов животных...');
        const [categoriesData, petTypesData] = await Promise.all([
          categoryService.getAllAsync(),
          petTypeService.getAll()
        ]);
        
        setCategories(categoriesData || []);
        setPetTypes(petTypesData || []);
      } catch (error) {
        console.error('Error loading data:', error);
        alert('Ошибка загрузки данных. Пожалуйста, обновите страницу.');
      }
    };
    loadData();
  }, []);

  //очистить ошибки валидации при изменении данных
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
    
    //хотя бы один тип животного должен быть выбран
    if (formData.petTypeIds.length === 0) {
      errors.push('Выберите тип животного');
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      setValidationErrors(errors);
      alert(errors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      const request = new ProductRequest();
      request.name = formData.name.trim();
      request.description = formData.description.trim();
      request.price = Number(formData.price);
      request.costPrice = formData.costPrice ? Number(formData.costPrice) : 0;
      request.quantity = Number(formData.quantity) || 0;
      request.brand = formData.brand.trim();
      request.rating = 0;
      request.isPromotion = formData.isPromotion;
      request.isActive = formData.isActive;
      request.categoryId = Number(formData.categoryId);
      request.petTypeIds = formData.petTypeIds.map(id => Number(id));

      console.log('Creating product with data:', request);//для отладки
      const createdProduct = await productService.insertProduct(request);
      
      console.log('Product created:', createdProduct);
      setCreatedProductId(createdProduct.id);
      setCreatedProductName(createdProduct.name);
      
      alert(`Товар "${createdProduct.name}" успешно создан! ID: ${createdProduct.id}\nТеперь вы можете загрузить изображения.`);
      
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

  const handleImagesChange = (images) => {
    console.log('Изображения загружены:', images);
    if (images.length > 0) {
      alert(`Загружено ${images.length} изображений для товара "${createdProductName}"`);
    }
  };

  //шаг 1: создание товара
  if (step === 1) {
    return (
      <div className={styles.container}>
        <ProductFormHeader title="Создание нового товара" mode="create" />
        
        <ValidationErrors errors={validationErrors} />
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <ProductFormFields
            formData={formData}
            categories={categories}
            petTypes={petTypes}
            loading={loading}
            validationErrors={validationErrors}
            onInputChange={handleInputChange}
            onNumberInput={handleNumberInput}
            onPetTypeToggle={handlePetTypeToggle}
          />

          <ProductFormButtons
            mode="create"
            loading={loading}
            validationErrors={validationErrors}
            formData={formData}
            categories={categories}
            onCancel={onCancel}
            onClear={clearForm}
            onSubmit={handleSubmit}
            submitLabel="Создать товар"
          />
        </form>
      </div>
    );
  }

  //шаг 2: загрузка картинок
  return (
    <div className={styles.container}>
      <ProductImagesStep
        productId={createdProductId}
        productName={createdProductName}
        existingImages={[]}
        onBack={handleBackToEdit}
        onFinish={handleFinish}
        onImagesChange={handleImagesChange}
        mode="create"
        createdProductName={createdProductName}
      />
    </div>
  );
}