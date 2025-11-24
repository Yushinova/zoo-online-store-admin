'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/api/adminService';
import styles from './Home.module.css';

export default function HomePage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!adminService.currentAdmin && !adminService.token) {
      router.push('/auth');
    } else {
      setAdmin(adminService.currentAdmin);
      setLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    adminService.logout();
    router.push('/auth');
  };

  const navigateToOrders = () => {
    router.push('/orders');
  };

  const navigateToShop = () => {
    router.push('/shop');
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Главная страница</h1>
        <div className={styles.userInfo}>
          <span>Привет, {admin?.name}!</span>
          <button 
            onClick={handleLogout}
            className={styles.logoutButton}
          >
            Выйти
          </button>
        </div>
      </header>
      
      <main className={styles.content}>
        <h2 className={styles.contentTitle}>Панель администратора</h2>
        <p className={styles.contentText}>
          Добро пожаловать в систему управления магазином! Здесь вы можете управлять товарами, 
          заказами, категориями и другими настройками магазина.
        </p>
        
        {/* ⚡ ДОБАВЛЯЕМ КНОПКИ ДЛЯ НАВИГАЦИИ */}
        <div className={styles.navigation}>
          <button 
            onClick={navigateToOrders}
            className={styles.navButton}
          >
            📦 Заказы
          </button>
          <button 
            onClick={navigateToShop}
            className={styles.navButton}
          >
            🏪 Магазин
          </button>
        </div>
      </main>
    </div>
  );
}