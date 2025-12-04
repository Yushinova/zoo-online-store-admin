'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import { UploadService } from '@/api/uploadImageService';
import { productImageService } from '@/api/productImageService';
import { ProductImageRequest } from '@/models/productImage';
import styles from './ImageUpload.module.css';
import { API_CONFIG } from '@/config/api';

export default function ImageUploader({ 
  onImagesChange, 
  productId, 
  existingImages = []
}) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);
  const BASE_YC_URL = `${API_CONFIG.YC_URL}/${API_CONFIG.YC_BACKET}`;
  //минимальные ограничения
  const MAX_FILES = 4;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  //инициализируем images, если пользуемс для update продукта
  useEffect(() => {
    console.log('ImageUploader: existingImages changed', existingImages);
    
    if (!Array.isArray(existingImages)) return;
    
    const formattedImages = existingImages.map(img => ({
      id: img.id || 0,
      imageName: img.imageName || '',
      altText: img.altText || '',
      productId: img.productId || productId
    }));
    
    console.log('Formatted images for display:', formattedImages);
    setImages(formattedImages);
  }, [existingImages, productId]);

  const saveImageToDatabase = async (uploadedImage, originalFile) => {
    try {
      const request = new ProductImageRequest();
      request.imageName = uploadedImage.fileName;//ВАЖНО именно этот сервис возвращает публичный URL
      request.altText = originalFile.name;
      request.productId = productId;

      console.log('Saving to database:', request);
      
      // сохраняем в базу данных и получаем ответ или ошибку
      const savedImage = await productImageService.insert(request);
      console.log('Successfully saved to database:', savedImage);
      
      //формируем объект для отображения
      return {
        id: savedImage.id || 0,
        imageName: uploadedImage.fileName,
        altText: originalFile.name,
        productId: productId
      };
      
    } catch (error) {
      console.error('Error saving to database:', error);
      
      //если не удалось сохранить в БД, удаляем файл из ведерка
      try {
        await fetch(`/api/yandex-upload?fileName=${encodeURIComponent(uploadedImage.fileName)}`, {
          method: 'DELETE',
        });
      } catch (deleteError) {
        console.error('Failed to delete from storage:', deleteError);
      }
      
      throw new Error(`Failed to save image to database: ${error.message}`);
    }
  };

  const handleFileSelect = async (files) => {
    if (!productId) {
      alert('Не указан ID товара');
      return;
    }

    const validFiles = Array.from(files).filter(file => {
      if (!file.type.startsWith('image/')) {
        alert('Можно загружать только изображения');
        return false;
      }
      
      if (file.size > MAX_FILE_SIZE) {
        alert(`Файл "${file.name}" слишком большой. Максимальный размер: 5MB`);
        return false;
      }
      
      return true;
    });

    if (validFiles.length === 0) return;

    if (images.length + validFiles.length > MAX_FILES) {
      alert(`Можно загрузить не более ${MAX_FILES} изображений. Уже загружено: ${images.length}`);
      return;
    }

    setUploading(true);
    try {
      console.log('Starting upload of', validFiles.length, 'files');
      
      //загружаем файлы в Yandex Cloud Storage
      const uploadResults = await UploadService.uploadMultipleFiles(validFiles);
      console.log('Upload results:', uploadResults);
      
      //сохраняем информацию о каждом изображении в базу данных
      const savedImages = [];
      
      for (let i = 0; i < uploadResults.length; i++) {
        const uploadedImage = uploadResults[i];
        const originalFile = validFiles[i];
        
        console.log('Processing upload result:', {
          uploadedImage,
          originalFile
        });
        
        const savedImage = await saveImageToDatabase(uploadedImage, originalFile);
        savedImages.push(savedImage);
      }

      //обновляем состояние и добавляем новые изображения
      const newImages = [...images, ...savedImages];
      console.log('New images state:', newImages);
      setImages(newImages);
      
      // Уведомляем родительский компонент об изменениях
      if (onImagesChange) {
        onImagesChange(newImages);
      }
      
      alert(`Успешно загружено ${savedImages.length} изображений`);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Ошибка загрузки: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event) => {
    if (event.target.files.length > 0) {
      handleFileSelect(event.target.files);
    }
    event.target.value = ''; //сброс input
  };

  const handleDeleteImage = async (imageName, index, imageId) => {
    if (!productId) {
      alert('Не указан ID товара');
      return;
    }

    if (!window.confirm('Вы уверены, что хотите удалить это изображение?')) {
      return;
    }

    try {
      console.log('Deleting image:', { imageName, index, imageId });
      
      //удаляем из Yandex Cloud Storage работаем через роутер (обход CORS YC)
      await fetch(`/api/yandex-upload?fileName=${encodeURIComponent(imageName)}`, {
        method: 'DELETE',
      });

      //удаляем из базы данных
      if (imageName) {
        await productImageService.deleteByName(imageName);
      }

      //обновляем состояние
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      
      if (onImagesChange) {
        onImagesChange(newImages);
      }
      
      alert('Изображение удалено');
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка удаления: ' + error.message);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  //форматируем имя файла для отображения
  const formatFileNameForDisplay = (fullPath) => {
    if (!fullPath) return 'Без имени';
    
    const parts = fullPath.split('/');
    return parts[parts.length - 1];
  };

  //получение URL для отображения
  const getDisplayUrl = (image) => {
    if (image.imageName) {
      //формируем URL для превью
      return `${BASE_YC_URL}/${image.imageName}`;
    }
    
    return '/notimage.jpeg';//заглушка
  };

  return (
    <div className={styles.uploader}>
      <h3 className={styles.title}>
        {images.length > 0 ? 'Управление изображениями' : 'Загрузка изображений'}
      </h3>
      
      {/* Информация о товаре */}
      <div className={styles.productInfo}>
        <span>ID товара: <strong>{productId}</strong></span>
        <span>Изображений: <strong>{images.length}/{MAX_FILES}</strong></span>
      </div>

      {/* Кнопка загрузки */}
      <div className={styles.uploadSection}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className={styles.fileInput}
          disabled={uploading || images.length >= MAX_FILES}
        />
        
        <button 
          onClick={triggerFileInput}
          disabled={uploading || images.length >= MAX_FILES}
          className={`${styles.uploadButton} ${images.length >= MAX_FILES ? styles.disabled : ''}`}
        >
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              Загрузка...
            </div>
          ) : images.length >= MAX_FILES ? (
            'Достигнут лимит изображений'
          ) : (
            `Выбрать фото (${images.length}/${MAX_FILES})`
          )}
        </button>
        
        <p className={styles.helpText}>
          Максимум {MAX_FILES} фото, не более 5MB каждое. Поддерживаются JPG, PNG, WebP
        </p>
      </div>

      {/* Сетка превью */}
      {images.length > 0 && (
        <div className={styles.previews}>
          <h4 className={styles.previewsTitle}>
            {images.length === 1 ? '1 изображение' : `${images.length} изображения`}
          </h4>
          
          <div className={styles.previewsGrid}>
            {images.map((image, index) => {
              const displayUrl = getDisplayUrl(image);
              const displayName = formatFileNameForDisplay(image.imageName || image.fileName);
              
              return (
                <div key={image.id || `image-${index}`} className={styles.previewItem}>
                  <div className={styles.imageContainer}>
                    <img 
                      src={displayUrl}
                      alt={image.altText || `Изображение ${index + 1}`}
                      className={styles.previewImage}
                      onError={(e) => {
                        console.error('Failed to load image:', image);
                        e.target.src = '/notimage.jpeg';
                        e.target.onerror = null; //предотвращаем бесконечный цикл ошибок
                      }}
                      onLoad={() => {
                        console.log('Image loaded successfully:', image);
                      }}
                    />
                    <button 
                      onClick={() => handleDeleteImage(
                        image.imageName,
                        index, 
                        image.id
                      )}
                      className={styles.deleteButton}
                      title="Удалить изображение"
                    >
                      ×
                    </button>
                  </div>
                  <div className={styles.imageInfo}>
                    <span className={styles.imageName} title={image.imageName}>
                      {displayName}
                    </span>
                    {image.altText && (
                      <span className={styles.altText} title={image.altText}>
                        {image.altText.length > 20 ? `${image.altText.substring(0, 20)}...` : image.altText}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Сообщение, если нет изображений */}
      {images.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📷</div>
          <p>Пока нет загруженных изображений</p>
          <p className={styles.emptyHint}>Добавьте изображения товара</p>
        </div>
      )}
    </div>
  );
}