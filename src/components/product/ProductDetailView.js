'use client';
import { useState, useEffect } from 'react';
import { productService } from '@/api/productService';
import styles from './ProductDetailView.module.css';
import { categoryService } from '@/api/categoryService';

const YANDEX_CLOUD_BASE_URL = process.env.NEXT_PUBLIC_YC_PUBLIC_URL || 'https://storage.yandexcloud.net';
const YANDEX_BUCKET_NAME = process.env.NEXT_PUBLIC_YC_BUCKET_NAME || 'backet-online-storage';

export default function ProductDetailView({ productId, onClose }) {
  const [product, setProduct] = useState(null);
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (productId) {
      fetchProductDetails();
    }
  }, [productId]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const productData = await productService.getByIdWithAllInfo(productId);
      setProduct(productData);
      const categoryDate = await categoryService.getById(productData.categoryId);
      setCategory(categoryDate);
      
    } catch (err) {
      setError(err.message || 'Ошибка при загрузке товара');
      console.error('Error fetching product details:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return '/notimage.jpeg';
    return `${YANDEX_CLOUD_BASE_URL}/${YANDEX_BUCKET_NAME}/${imageName}`;
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Загрузка информации о товаре...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.error}>
            <h3>Ошибка</h3>
            <p>{error}</p>
            <button onClick={onClose} className={styles.closeBtn}>Закрыть</button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        <div className={styles.header}>
          <h2>Информация о товаре</h2>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div className={styles.content}>
          {/*колонка - изображения*/}
          <div className={styles.leftColumn}>
            <div className={styles.imageContainer}>
              {product.productImages && product.productImages.length > 0 ? (
                <>
                  <div className={styles.mainImage}>
                    <img
                      src={getImageUrl(product.productImages[0].imageName)}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/notimage.jpeg';
                      }}
                    />
                  </div>
                  
                  {product.productImages.length > 1 && (
                    <div className={styles.thumbnailContainer}>
                      <p className={styles.thumbnailLabel}>Другие изображения:</p>
                      <div className={styles.thumbnails}>
                        {product.productImages.slice(1).map((image, index) => (
                          <div key={image.id || index} className={styles.thumbnail}>
                            <img
                              src={getImageUrl(image.imageName)}
                              alt={`${product.name} ${index + 2}`}
                              onError={(e) => {
                                e.target.src = '/notimage.jpeg';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className={styles.noImage}>
                  <img src="/notimage.jpeg" alt="Нет изображения" />
                  <p>Изображение отсутствует</p>
                </div>
              )}
            </div>
          </div>

          {/*колонка - информация */}
          <div className={styles.rightColumn}>
            <div className={styles.productInfo}>

              <div className={styles.titleSection}>
                <h1 className={styles.productName}>{product.name}</h1>
                <div className={styles.statusIcons}>
                  {product.isPromotion && (
                    <span className={styles.promotionIcon} title="Акционный товар">🔥</span>
                  )}
                  {!product.isActive && (
                    <span className={styles.inactiveIcon} title="Не активен">⛔</span>
                  )}
                </div>
              </div>

              {/*характеристики*/}
              <div className={styles.specs}>
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Цена продажи:</span>
                  <span className={styles.price}>{formatPrice(product.price)}</span>
                </div>

                {product.costPrice > 0 && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Себестоимость:</span>
                    <span className={styles.costPrice}>{formatPrice(product.costPrice)}</span>
                  </div>
                )}

                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Количество:</span>
                  <span className={`${styles.quantity} ${product.quantity === 0 ? styles.outOfStock : ''}`}>
                    {product.quantity} шт.
                    {product.quantity === 0 && product.isActive && ' (под заказ)'}
                  </span>
                </div>

                {product.brand && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Бренд:</span>
                    <span className={styles.brand}>{product.brand}</span>
                  </div>
                )}

                {product.rating > 0 && (
                  <div className={styles.specRow}>
                    <span className={styles.specLabel}>Рейтинг:</span>
                    <span className={styles.rating}>{product.rating.toFixed(1)}/5</span>
                  </div>
                )}

                {/* ID для разработки*/}
                <div className={styles.specRow}>
                  <span className={styles.specLabel}>ID товара:</span>
                  <span className={styles.id}>{product.id}</span>
                </div>

                <div className={styles.specRow}>
                  <span className={styles.specLabel}>Категория:</span>
                  <span className={styles.category}>{category.name}</span>
                </div>
              </div>

              {product.description && (
                <div className={styles.descriptionSection}>
                  <h3 className={styles.sectionTitle}>Описание</h3>
                  <div className={styles.description}>
                    {product.description}
                  </div>
                </div>
              )}

              {product.petTypes && product.petTypes.length > 0 && (
                <div className={styles.petTypesSection}>
                  <h3 className={styles.sectionTitle}>Для животных</h3>
                  <div className={styles.petTypes}>
                    {product.petTypes.map((petType, index) => (
                      <span key={petType.id || index} className={styles.petType}>
                        {petType.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {product.productImages && product.productImages.length > 0 && (
                <div className={styles.imagesInfo}>
                  <h3 className={styles.sectionTitle}>Изображения</h3>
                  <p>Всего изображений: {product.productImages.length}</p>
                  <div className={styles.imageNames}>
                    {product.productImages.map((image, index) => (
                      <div key={image.id || index} className={styles.imageName}>
                        <span>{index + 1}. {image.imageName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.closeButton}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}