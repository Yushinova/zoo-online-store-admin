'use client';
import { useState } from 'react';
import { API_CONFIG } from '@/config/api';
import styles from './ProductCard.module.css';

const YANDEX_CLOUD_BASE_URL = API_CONFIG.YC_URL || 'https://storage.yandexcloud.net';
const YANDEX_BUCKET_NAME = API_CONFIG.YC_BACKET || 'backet-online-storage';

export default function ProductCard({ 
  product, 
  onClick,
  onEdit, // Новый пропс для редактирования
  size = 'medium', // 'small' | 'medium' | 'large'
  showEditButton = false // Новый пропс для показа кнопки редактирования
}) {
  const [imageError, setImageError] = useState(false);
  
  if (!product) return null;

  // Получаем первую картинку или заглушку
  const getImageUrl = () => {
    if (!product.productImages || product.productImages.length === 0) {
      return '/notimage.jpeg';
    }
    
    const firstImage = product.productImages[0];
    return `${YANDEX_CLOUD_BASE_URL}/${YANDEX_BUCKET_NAME}/${firstImage.imageName}` || '/notimage.jpeg';
  };

  const imageName = getImageUrl();

  const handleClick = (e) => {
    // Проверяем, не кликнули ли по кнопке редактирования
    if (e.target.closest(`.${styles.editButton}`)) {
      return;
    }
    
    if (onClick && product.isActive) {
      onClick(product);
    }
  };

  const handleEditClick = (e) => {
    e.stopPropagation();
    if (onEdit) {
      onEdit(product);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  // Генерация звезд для рейтинга
  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(product.rating);
    const hasHalfStar = product.rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className={styles.starFull}>★</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className={styles.starHalf}>★</span>);
      } else {
        stars.push(<span key={i} className={styles.starEmpty}>★</span>);
      }
    }
    
    return stars;
  };

  return (
    <div 
      className={`${styles.card} ${styles[size]} ${!product.isActive ? styles.inactive : ''}`}
      onClick={handleClick}
    >
      {/* Бейдж акции */}
      {product.isPromotion && (
        <div className={styles.promotionBadge}>
          Акция
        </div>
      )}

      {/* Контейнер изображения */}
      <div className={styles.imageContainer}>
        <img 
          src={imageError ? '/notimage.jpeg' : imageName}
          alt={product.name}
          className={styles.image}
          onError={handleImageError}
          loading="lazy"
        />
        
        {/* Кнопка редактирования */}
        {showEditButton && onEdit && (
          <button 
            className={styles.editButton}
            onClick={handleEditClick}
            title="Редактировать товар"
          >
            <svg className={styles.editIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
          </button>
        )}
        
        {!product.isActive && (
          <div className={styles.inactiveOverlay}>
            <span>Нет в наличии</span>
          </div>
        )}
      </div>

      {/* Контент карточки */}
      <div className={styles.content}>
        {/* Название */}
        <h3 className={styles.name} title={product.name}>
          {product.name}
        </h3>

        {/* Бренд */}
        {product.brand && (
          <div className={styles.brand}>
            {product.brand}
          </div>
        )}

        {/* Рейтинг */}
        <div className={styles.rating}>
          {renderStars()}
          <span className={styles.ratingValue}>{product.rating?.toFixed(1) || '0.0'}</span>
        </div>

        {/* Цена */}
        <div className={styles.priceSection}>
          <div className={styles.price}>
            {formatPrice(product.price)}
          </div>
          {product.costPrice > 0 && product.price < product.costPrice && (
            <div className={styles.oldPrice}>
              {formatPrice(product.costPrice)}
            </div>
          )}
        </div>

        {/* Индикатор количества */}
        {product.quantity <= 10 && product.quantity > 0 && (
          <div className={styles.quantityWarning}>
            Осталось: {product.quantity} шт.
          </div>
        )}

        {product.quantity === 0 && product.isActive && (
          <div className={styles.quantityWarning}>
            Под заказ
          </div>
        )}

        {/* Типы животных (только тэги) */}
        {product.petTypes && product.petTypes.length > 0 && (
          <div className={styles.petTypes}>
            {product.petTypes.slice(0, 2).map((petType, index) => (
              <span key={petType.id || index} className={styles.petTypeTag}>
                {petType.name}
              </span>
            ))}
            {product.petTypes.length > 2 && (
              <span className={styles.moreTag}>+{product.petTypes.length - 2}</span>
            )}
          </div>
        )}

        {/* Категория (дополнительно для админки) */}
        {product.category && (
          <div className={styles.categoryInfo}>
            Категория: {product.category.name}
          </div>
        )}
      </div>
    </div>
  );
}