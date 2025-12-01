'use client';
import { useState, useEffect } from 'react';
import { productService } from '@/api/productService';
import { ProductQueryParameters } from "@/models/product";
import ProductCard from '@/components/product/ProductCard';
import ProductFilters from '@/components/product/ProductFilters';
import ProductForm from '@/components/product/ProductForm';
import styles from './ProductsManager.module.css';

export default function ProductsManager() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState(() => {
    const params = new ProductQueryParameters();
    params.page = 1;
    params.pageSize = 8;
    return params;
  });
  const [hasMore, setHasMore] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // Загрузка товаров
  const loadProducts = async (useFilters = filters) => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Loading products with filters:', useFilters);
      const productsData = await productService.getAllWithFilterAndPagination(useFilters);
      
      setProducts(productsData || []);
      
      // Предполагаем, что если сервер вернул меньше товаров чем pageSize, значит больше нет
      const returnedCount = productsData?.length || 0;
      setHasMore(returnedCount >= useFilters.pageSize);
      
    } catch (err) {
      console.error('Error loading products:', err);
      setError(`Ошибка загрузки: ${err.message}`);
      setProducts([]);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Обработчики фильтров
  const handleFiltersChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(prev => ({
      ...newFilters,
      page: 1, // Сбрасываем на первую страницу
      pageSize: prev.pageSize
    }));
  };

  const handleApplyFilters = async (appliedFilters) => {
    console.log('Applying filters:', appliedFilters);
    const newFilters = {
      ...appliedFilters,
      page: 1,
      pageSize: filters.pageSize
    };
    setFilters(newFilters);
    await loadProducts(newFilters);
  };

  const handleResetFilters = async (resetFilters) => {
    console.log('Filters reset:', resetFilters);
    const defaultFilters = new ProductQueryParameters();
    defaultFilters.page = 1;
    defaultFilters.pageSize = filters.pageSize;
    setFilters(defaultFilters);
    await loadProducts(defaultFilters);
  };

  // Пагинация
  const handleNextPage = () => {
    const nextPage = filters.page + 1;
    const newFilters = { ...filters, page: nextPage };
    setFilters(newFilters);
    loadProducts(newFilters);
  };

  const handlePrevPage = () => {
    if (filters.page > 1) {
      const prevPage = filters.page - 1;
      const newFilters = { ...filters, page: prevPage };
      setFilters(newFilters);
      loadProducts(newFilters);
    }
  };

  const handlePageSizeChange = (newSize) => {
    const pageSize = Number(newSize);
    const newFilters = { 
      ...filters, 
      pageSize: pageSize,
      page: 1 // Сбрасываем на первую страницу
    };
    setFilters(newFilters);
    loadProducts(newFilters);
  };

  // Обработчик клика по товару
  const handleProductClick = (product) => {
    console.log('Product clicked:', product);
    // TODO: Можно сделать редактирование товара по клику
    alert(`Выбран товар: ${product.name}\nЦена: ${product.price} руб.\nID: ${product.id}`);
  };

  // Обработчик успешного создания товара
  const handleProductCreated = () => {
    setShowAddForm(false);
    loadProducts(); // Перезагружаем список товаров
  };

  return (
    <div className={styles.container}>
      {/* Шапка с кнопкой добавления */}
      <div className={styles.header}>
        <h2 className={styles.title}>Управление товарами</h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
        >
          <svg className={styles.addIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Добавить товар
        </button>
      </div>

      {/* Фильтры */}
      <ProductFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
      />

      {/* Сообщение об ошибке */}
      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {/* Загрузка */}
      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          Загрузка товаров...
        </div>
      ) : (
        <>
          {/* Список товаров */}
          {products.length === 0 ? (
            <div className={styles.emptyState}>
              <svg className={styles.emptyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
              </svg>
              <h3>Товары не найдены</h3>
              <p>Попробуйте изменить параметры фильтрации или создайте новый товар</p>
              <button 
                onClick={() => setShowAddForm(true)}
                className={styles.addButtonEmpty}
              >
                Создать первый товар
              </button>
            </div>
          ) : (
            <>
              <div className={styles.productsInfo}>
                <span>Товаров на странице: {products.length}</span>
                <span>Страница: {filters.page}</span>
              </div>
              
              <div className={styles.productsGrid}>
                {products.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    onClick={handleProductClick}
                    size="medium"
                  />
                ))}
              </div>
            </>
          )}

          {/* Простая пагинация */}
          {products.length > 0 && (
            <div className={styles.simplePagination}>
              <button 
                onClick={handlePrevPage}
                disabled={filters.page === 1}
                className={styles.paginationButton}
              >
                ← Назад
              </button>
              
              <div className={styles.pageInfo}>
                Страница {filters.page}
              </div>
              
              <button 
                onClick={handleNextPage}
                disabled={!hasMore}
                className={styles.paginationButton}
              >
                Далее →
              </button>
            </div>
          )}
        </>
      )}

      {/* Модальное окно с формой добавления товара */}
      {showAddForm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <ProductForm
              onSuccess={handleProductCreated}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}