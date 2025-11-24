'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/api/adminService';
import styles from './Shop.module.css';

export default function ShopPage() {
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

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Управление магазином</h1>
        <div className={styles.userInfo}>
          <span>Админ: {admin?.name}</span>
          <button onClick={handleBack} className={styles.backButton}>
            Назад
          </button>
        </div>
      </header>
      
      <main className={styles.content}>
        <h2>Товары и категории</h2>
        <p>Здесь вы можете управлять товарами, категориями и настройками магазина.</p>
        
        {/* Заглушка для будущего контента */}
        <div className={styles.placeholder}>
          <p>🏪 Функционал управления магазином в разработке</p>
        </div>
      </main>
    </div>
  );
}