'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/api/adminService';
import { authService, AuthService } from '@/api/authService';
import styles from './Home.module.css'; //импорт стилей

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
    adminService.logout();//очищаем данные пользователя и apikey
    router.push('/auth');
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
        {/* Здесь потом добавим меню для управления */}
      </main>
    </div>
  );
}