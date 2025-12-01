'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/api/adminService';
import PetTypeManager from '@/components/petType/PetTypeManager'; // Импортируем наш компонент
import CategoryManager from '@/components/category/CategoryManager';
import styles from './Shop.module.css';
import ProductsManager from '@/components/product/ProductsManager';

export default function ShopPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('petTypes'); // 'petTypes' | 'products' | 'categories'

  useEffect(() => {
    if (!adminService.currentAdmin && !adminService.token) {
      router.push('/auth');
    } else {
      setAdmin(adminService.currentAdmin);
      setLoading(false);
    }
  }, [router]);

  const handleBack = () => {
    router.push('/');
  };

  const handleLogout = () => {
    adminService.logout();
    router.push('/auth');
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  // Рендер контента в зависимости от активной секции
  const renderContent = () => {
  switch (activeSection) {
    case 'petTypes':
      return <PetTypeManager />;
    case 'products':
      return <ProductsManager />;
    case 'categories':
      return <CategoryManager />;
    default:
      return <PetTypeManager />;
  }
};

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Управление магазином</h1>
        <div className={styles.userInfo}>
          <span className={styles.adminName}>Админ: {admin?.name}</span>
          <div className={styles.headerButtons}>
            <button onClick={handleBack} className={styles.backButton}>
              На главную
            </button>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Выйти
            </button>
          </div>
        </div>
      </header>
      
      {/* Навигация по разделам */}
      <nav className={styles.navigation}>
        <button 
          className={`${styles.navButton} ${activeSection === 'petTypes' ? styles.active : ''}`}
          onClick={() => setActiveSection('petTypes')}
        >
          🐾 Типы животных
        </button>
          <button 
          className={`${styles.navButton} ${activeSection === 'categories' ? styles.active : ''}`}
          onClick={() => setActiveSection('categories')}
        >
          📂 Категории
        </button>
        <button 
          className={`${styles.navButton} ${activeSection === 'products' ? styles.active : ''}`}
          onClick={() => setActiveSection('products')}
        >
          🛍️ Товары
        </button>
      
      </nav>
      
      <main className={styles.content}>
        {renderContent()}
      </main>
    </div>
  );
}