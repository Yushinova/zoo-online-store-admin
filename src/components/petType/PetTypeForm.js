'use client';
import { useState, useEffect } from 'react';
import { petTypeService } from '@/api/petTypeService'
import { categoryService } from '@/api/categoryService';
import { UploadService } from '@/api/uploadImageService';
import styles from './PetTypeForm.module.css';

// Используем переменные из .env
const YANDEX_CLOUD_BASE_URL = process.env.NEXT_PUBLIC_YC_PUBLIC_URL || 'https://storage.yandexcloud.net';
const YANDEX_BUCKET_NAME = process.env.NEXT_PUBLIC_YC_BUCKET_NAME || 'backet-online-storage';

export default function PetTypeForm({ 
  petType = null, 
  onSuccess, 
  onCancel 
}) {
  const isEditMode = !!petType;
  
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    imageName: ''
  });

  useEffect(() => {
    loadCategories();
    if (isEditMode && petType) {
      // Заполняем форму данными для редактирования
      setFormData({
        name: petType.name || '',
        imageName: petType.imageName || ''
      });
      
      // Устанавливаем выбранные категории
      if (petType.categories) {
        setSelectedCategories(petType.categories.map(cat => cat.id));
      }
      
      // Устанавливаем превью изображения если есть
      if (petType.imageName) {
        // Формируем полный URL к изображению в Yandex Cloud
        const fullImageUrl = `${YANDEX_CLOUD_BASE_URL}/${YANDEX_BUCKET_NAME}/${petType.imageName}`;
        console.log('Setting image preview URL:', fullImageUrl);
        setImagePreview(fullImageUrl);
      }
    }
  }, [petType, isEditMode]);

  const loadCategories = async () => {
    try {
      const categoriesData = await categoryService.getAllAsync();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Пожалуйста, выберите файл изображения');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('Размер файла не должен превышать 5MB');
        return;
      }

      setImageFile(file);
      
      // Создаем превью из выбранного файла
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Пожалуйста, введите название типа питомца');
      return;
    }

    setLoading(true);

    try {
      let imageFileName = formData.imageName;

      // Если выбрано новое изображение, загружаем его
      if (imageFile) {
        console.log('Загружаем новое изображение...');
        const uploadResults = await UploadService.uploadMultipleFiles([imageFile]);
        const uploadedImage = uploadResults[0];
        imageFileName = uploadedImage.fileName;
        console.log('Новое изображение загружено:', uploadedImage);
      }

      if (isEditMode) {
        // РЕДАКТИРОВАНИЕ - изображение не обязательно
        console.log('Редактируем Pet Type...');
        const updateRequest = {
          id: petType.id,
          name: formData.name,
          imageName: imageFileName, // Может быть пустым если нет изображения
          CategoriesIds: selectedCategories
        };

        console.log('Обновляем Pet Type с данными:', updateRequest);
        const updatedPetType = await petTypeService.updateWithCategories(updateRequest);
        console.log('Pet Type обновлен:', updatedPetType);

        alert(`Тип питомца "${updatedPetType.name}" успешно обновлен!`);
      } else {
        // СОЗДАНИЕ - изображение обязательно
        if (!imageFile) {
          alert('Пожалуйста, выберите изображение');
          setLoading(false);
          return;
        }

        console.log('Создаем новый Pet Type...');
        const petTypeRequest = {
          name: formData.name,
          imageName: imageFileName
        };

        console.log('Создаем Pet Type с данными:', petTypeRequest);
        const createdPetType = await petTypeService.insert(petTypeRequest);
        console.log('Pet Type создан:', createdPetType);

        // Обновляем категории если есть выбранные
        if (selectedCategories.length > 0) {
          console.log('Обновляем связи с категориями:', selectedCategories);
          const updateRequest = {
            id: createdPetType.id,
            name: createdPetType.name,
            imageName: createdPetType.imageName,
            CategoriesIds: selectedCategories
          };
          
          await petTypeService.updateWithCategories(updateRequest);
          console.log('Связи с категориями обновлены');
        }

        alert(`Тип питомца "${createdPetType.name}" успешно создан!`);
      }

      // Сбрасываем форму
      if (!isEditMode) {
        setFormData({ name: '', imageName: '' });
        setSelectedCategories([]);
        setImageFile(null);
        setImagePreview('');
      }
      
      if (onSuccess) {
        onSuccess();
      }

    } catch (error) {
      console.error('Error:', error);
      alert(`Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setFormData({ name: '', imageName: '' });
    setSelectedCategories([]);
    setImageFile(null);
    setImagePreview('');
  };

  const triggerFileInput = () => {
    document.getElementById('imageInput').click();
  };

  // Функция для получения URL превью
  const getPreviewUrl = () => {
    if (imagePreview) {
      return imagePreview;
    }
    if (isEditMode && petType?.imageName) {
      return `${YANDEX_CLOUD_BASE_URL}/${YANDEX_BUCKET_NAME}/${petType.imageName}`;
    }
    return '';
  };

  const previewUrl = getPreviewUrl();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        {isEditMode ? 'Редактировать тип питомца' : 'Создать новый тип питомца'}
      </h2>

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Название */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Название типа питомца *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Например: Собаки, Кошки, Птицы..."
            className={styles.input}
            required
          />
        </div>

        {/* Загрузка изображения */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Изображение {!isEditMode && '*'}
          </label>
          
          <div className={styles.imageUploadSection}>
            {/* Превью изображения - показываем только если есть изображение */}
            {previewUrl && (
              <div className={styles.imagePreview}>
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className={styles.previewImage}
                  onError={(e) => {
                    console.log('Image not available:', previewUrl);
                    // Просто скрываем изображение если не загрузилось, без ошибки
                    e.target.style.display = 'none';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview('');
                    // При редактировании очищаем imageName
                    if (isEditMode) {
                      setFormData(prev => ({ ...prev, imageName: '' }));
                    }
                  }}
                  className={styles.removeImageButton}
                >
                  ×
                </button>
              </div>
            )}

            {/* Кнопка выбора файла */}
            <div className={styles.uploadButtonContainer}>
              <button
                type="button"
                onClick={triggerFileInput}
                className={styles.uploadButton}
              >
                <svg className={styles.uploadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {isEditMode ? 'Изменить изображение' : 'Выбрать изображение'}
              </button>
              <input 
                id="imageInput"
                type="file" 
                className={styles.fileInput}
                accept="image/*"
                onChange={handleImageSelect}
              />
              <p className={styles.uploadSubtext}>
                {isEditMode 
                  ? 'Оставьте пустым чтобы сохранить текущее изображение' 
                  : 'PNG, JPG, JPEG (макс. 5MB)'}
              </p>
            </div>
          </div>
        </div>

        {/* Выбор категорий */}
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Категории (опционально)
          </label>
          
          <div className={styles.categoriesContainer}>
            <div className={styles.categoriesGrid}>
              {categories.map(category => (
                <label key={category.id} className={styles.categoryLabel}>
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className={styles.categoryCheckbox}
                  />
                  <span className={styles.categoryName}>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
          
          {selectedCategories.length > 0 && (
            <p className={styles.selectedCount}>
              Выбрано категорий: {selectedCategories.length}
            </p>
          )}
        </div>

        {/* Кнопки */}
        <div className={styles.buttonsContainer}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Отмена
            </button>
          )}
          <button
            type="button"
            onClick={clearForm}
            disabled={loading}
            className={`${styles.button} ${styles.clearButton}`}
          >
            Очистить
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${styles.submitButton}`}
          >
            {loading ? (
              <>
                <div className={styles.loadingSpinner}></div>
                {isEditMode ? 'Обновление...' : 'Создание...'}
              </>
            ) : (
              isEditMode ? 'Обновить тип питомца' : 'Создать тип питомца'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}