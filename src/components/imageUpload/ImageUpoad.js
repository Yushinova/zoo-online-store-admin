'use client';
import { useState, useRef } from 'react';
import { UploadService } from '@/api/uploadImageService';
import styles from './ImageUpload.module.css';

export default function ImageUploader({ onImagesChange, maxFiles = 10 }) {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = async (files) => {
    const validFiles = Array.from(files).filter(file => 
      file.type.startsWith('image/')
    );

    if (validFiles.length === 0) return;

    if (images.length + validFiles.length > maxFiles) {
      alert(`Можно загрузить не более ${maxFiles} изображений`);
      return;
    }

    setUploading(true);
    try {
      const results = await UploadService.uploadMultipleFiles(validFiles);
      const newImages = [...images, ...results];
      
      setImages(newImages);
      if (onImagesChange) onImagesChange(newImages);
      
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Ошибка загрузки: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event) => {
    handleFiles(event.target.files);
    event.target.value = ''; // Сброс input
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragOver(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragOver(false);
  };

  const handleDeleteImage = async (fileName, index) => {
    try {
      await fetch(`/api/yandex-upload?fileName=${encodeURIComponent(fileName)}`, {
        method: 'DELETE',
      });

      const newImages = images.filter((_, i) => i !== index);
      setImages(newImages);
      if (onImagesChange) onImagesChange(newImages);
      
    } catch (error) {
      console.error('Delete failed:', error);
      alert('Ошибка удаления: ' + error.message);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={styles.uploader}>
      {/* Область загрузки */}
      <div 
        className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileInput}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileInput}
          className={styles.fileInput}
        />
        
        <div className={styles.dropZoneContent}>
          {uploading ? (
            <div className={styles.uploadingState}>
              <div className={styles.spinner}></div>
              <p>Загрузка...</p>
            </div>
          ) : (
            <>
              <div className={styles.uploadIcon}>📁</div>
              <p className={styles.dropZoneText}>
                Перетащите изображения сюда или нажмите для выбора
              </p>
              <p className={styles.dropZoneSubtext}>
                Максимум {maxFiles} файлов
              </p>
            </>
          )}
        </div>
      </div>

      {/* Сетка превью */}
      {images.length > 0 && (
        <div className={styles.previews}>
          <h3 className={styles.previewsTitle}>
            Загруженные изображения ({images.length}/{maxFiles})
          </h3>
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
                  <span className={styles.imageSize}>
                    {(image.size / 1024).toFixed(1)} KB
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