'use client';
import ImageUploader from '@/components/imageUpload/ImageUpoad';
import styles from './ProductForm.module.css';

export function ProductImagesStep({
  productId,
  productName,
  existingImages = [],
  onBack,
  onFinish,
  onImagesChange,
  onImageDelete,
  mode = 'update',
  createdProductName
}) {
  const isCreateMode = mode === 'create';
  const displayName = isCreateMode ? createdProductName : productName;

  // Обработчик изменения изображений
  const handleImagesChange = (updatedImages) => {
    console.log('ProductImagesStep: images changed', updatedImages.length);
    
    if (onImagesChange) {
      onImagesChange(updatedImages);
    }
  };

  // Обработчик удаления изображения
  const handleImageDelete = () => {
    console.log('ProductImagesStep: image deleted');
    
    if (onImageDelete) {
      onImageDelete();
    }
  };

  return (
    <div className={styles.imagesStepContainer}>
      <h2 className={styles.title}>
        {isCreateMode ? 'Загрузка изображений' : 'Управление изображениями'}
      </h2>
      
      {isCreateMode ? (
        <div className={styles.successMessage}>
          <div className={styles.successIcon}>✓</div>
          <h3>Товар успешно создан!</h3>
          <p>
            <strong>Название:</strong> {displayName}<br />
            <strong>ID:</strong> {productId}
          </p>
          <p className={styles.successHint}>
            Теперь вы можете загрузить изображения для этого товара.
            Это можно сделать сейчас или позже через редактирование товара.
          </p>
        </div>
      ) : (
        <div className={styles.productInfo}>
          <h3>{displayName}</h3>
          <p><strong>ID товара:</strong> {productId}</p>
          <p className={styles.imagesInfo}>
            {existingImages.length === 0 
              ? 'Нет загруженных изображений' 
              : `Загружено изображений: ${existingImages.length}`
            }
          </p>
        </div>
      )}

      {/* Компонент загрузки картинок */}
      <div className={styles.uploadSection}>
        <ImageUploader 
          productId={productId}
          existingImages={existingImages}
          onImagesChange={handleImagesChange}
          onImageDelete={handleImageDelete}
        />
      </div>

      {/* Кнопки */}
      <div className={styles.buttons}>
        <button
          type="button"
          onClick={onBack}
          className={styles.backButton}
        >
          ← Вернуться к {isCreateMode ? 'созданию товара' : 'редактированию'}
        </button>
        
        <button
          type="button"
          onClick={onFinish}
          className={styles.finishButton}
        >
          {isCreateMode ? 'Завершить (можно добавить изображения позже)' : 'Завершить редактирование'}
        </button>
      </div>
    </div>
  );
}
