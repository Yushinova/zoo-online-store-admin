'use client';
import { useState, useEffect } from 'react';
import styles from './PetTypeCard.module.css';

const YANDEX_CLOUD_BASE_URL = process.env.NEXT_PUBLIC_YC_PUBLIC_URL || 'https://storage.yandexcloud.net';
const YANDEX_BUCKET_NAME = process.env.NEXT_PUBLIC_YC_BUCKET_NAME || 'backet-online-storage';

export default function PetTypeCard({ 
  petType, 
  onClick, 
  size = 'medium',
  showName = true,
  orientation = 'horizontal' // 'horizontal' или 'vertical'
}) {
  const [imageError, setImageError] = useState(false);

  if (!petType) return null;

  useEffect(() => {
    console.log('PetTypeCard received:', petType);
  }, [petType]);

  const getImageUrl = () => {
    if (!petType.imageName) {
      return null;
    }
    
    const imageUrl = `${YANDEX_CLOUD_BASE_URL}/${YANDEX_BUCKET_NAME}/${petType.imageName}`;
    return imageUrl;
  };

  const imageUrl = getImageUrl();

  const handleClick = () => {
    if (onClick) {
      onClick(petType);
    }
  };

  const handleImageError = (e) => {
    console.error('Image load failed:', imageUrl);
    setImageError(true);
  };

  return (
    <div 
      className={`${styles.card} ${styles[size]} ${styles[orientation]} ${onClick ? styles.clickable : ''}`}
      onClick={handleClick}
    >
      <div className={styles.imageContainer}>
        {imageUrl && !imageError ? (
          <img 
            src={imageUrl} 
            alt={petType.name}
            className={styles.image}
            onError={handleImageError}
            onLoad={() => console.log('Image loaded:', petType.name)}
          />
        ) : null}
        <div className={styles.placeholder} style={{ display: imageUrl && !imageError ? 'none' : 'flex' }}>
          <svg className={styles.placeholderIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
      </div>
      
      {showName && (
        <div className={styles.name}>{petType.name}</div>
      )}
    </div>
  );
}