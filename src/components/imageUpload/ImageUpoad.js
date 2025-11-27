'use client';
import { useState, useRef } from 'react';
import { UploadService } from '@/api/uploadImageService';
import { productImageService } from '@/api/productImageService';
import { ProductImageRequest } from '@/models/productImage';
import styles from './ImageUpload.module.css';

export default function ImageUploader({ onImagesChange, productId = 1 }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Конфигурация
  const MAX_FILES = 4;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const saveImageToDatabase = async (uploadedImage, originalFile) => {
    try {
      const request = new ProductImageRequest();
      request.imageName = uploadedImage.fileName;
      request.altText = originalFile.name; // Используем имя файла как alt текст
      request.productId = productId;

      console.log('Saving to database:', request);
      await productImageService.insert(request);
      console.log('Successfully saved to database');
      
      return true;
    } catch (error) {
      console.error('Error saving to database:', error);
      // Если не удалось сохранить в БД, удаляем файл из хранилища
      await fetch(`/api/yandex-upload?fileName=${encodeURIComponent(uploadedImage.fileName)}`, {
        method: 'DELETE',
      });
      throw new Error(`Failed to save image to database: ${error.message}`);
    }
  };

  const handleFileSelect = async (files) => {
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
      alert(`Можно загрузить не более ${MAX_FILES} изображений`);
      return;
    }

    setUploading(true);
    try {
      // 1. Загружаем файлы в Yandex Cloud Storage
      const uploadResults = await UploadService.uploadMultipleFiles(validFiles);
      
      // 2. Сохраняем информацию о каждом изображении в базу данных
      const savedImages = [];
      
      for (let i = 0; i < uploadResults.length; i++) {
        const uploadedImage = uploadResults[i];
        const originalFile = validFiles[i];
        
        await saveImageToDatabase(uploadedImage, originalFile);
        savedImages.push(uploadedImage);
      }

      // 3. Обновляем состояние
      const newImages = [...images, ...savedImages];
      setImages(newImages);
      
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
    event.target.value = ''; // Сброс input
  };

  const handleDeleteImage = async (fileName, index) => {
    try {
      // 1. Удаляем из Yandex Cloud Storage
      await fetch(`/api/yandex-upload?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      // 2. Удаляем из базы данных
      await productImageService.deleteByName(fileName);

      // 3. Обновляем состояние
      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      
      if (onImagesChange) {
        onImagesChange(newImages);
      }
      
      alert('Изображение удалено');
      
    } catch (error) {
      console.error('Delete failed:', error);
      
      if (error.message.includes('NotFound')) {
        // Если в БД не нашли, все равно удаляем из состояния
        const newImages = images.filter((_, i) => i !== index);
        setImages(newImages);
        if (onImagesChange) onImagesChange(newImages);
      } else {
        alert('Ошибка удаления: ' + error.message);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploader}>
      {/* Кнопка загрузки */}
      <div className={styles.uploadSection}>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className={styles.fileInput}
        />
        
        <button 
          onClick={triggerFileInput}
          disabled={uploading || images.length >= MAX_FILES}
          className={styles.uploadButton}
        >
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              Загрузка...
            </div>
          ) : (
            `Выбрать фото (${images.length}/${MAX_FILES})`
          )}
        </button>
        
        <p className={styles.helpText}>
          Максимум {MAX_FILES} фото, не более 5MB каждое
        </p>
        
        <p className={styles.productInfo}>
          Product ID: {productId}
        </p>
      </div>

      {/* Сетка превью */}
      {images.length > 0 && (
        <div className={styles.previews}>
          <div className={styles.previewsGrid}>
            {images.map((image, index) => (
              <div key={index} className={styles.previewItem}>
                <img 
                  src={image.publicUrl} 
                  alt={`Preview ${index + 1}`}
                  className={styles.previewImage}
                />
                <button 
                  onClick={() => handleDeleteImage(image.fileName, index)}
                  className={styles.deleteButton}
                  title="Удалить изображение"
                >
                  ×
                </button>
                <div className={styles.imageInfo}>
                  <span className={styles.imageName}>
                    {image.fileName.split('/').pop()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}