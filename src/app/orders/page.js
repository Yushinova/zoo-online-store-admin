'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminService } from '@/api/adminService'; // ⚡ экземпляр
import { orderService } from '@/api/orderService'; // ⚡ экземпляр
import OrderCard from '@/components/order/OrderCard';
import styles from './Orders.module.css';

export default function OrdersPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    console.log('🔍 Checking auth...', {
      currentAdmin: adminService.currentAdmin,
      hasToken: !!adminService.token
    });

    if (!adminService.currentAdmin) {
      console.log('❌ No admin, redirecting to auth');
      router.push('/auth');
    } else {
      console.log('✅ Admin found:', adminService.currentAdmin);
      setAdmin(adminService.currentAdmin);
      loadOrders();
    }
  }, [router, currentPage]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('📦 Loading orders...');
      
      // ⚡ Используем экземпляр orderService, а не класс
      const ordersData = await orderService.getOrdersSorted(currentPage, pageSize);
      console.log("✅ Orders loaded:", ordersData);
      
      setOrders(ordersData);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      alert(`Ошибка при загрузке заказов: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderUpdated = (updatedOrder) => {
    setOrders(prev => prev.map(order => 
      order.id === updatedOrder.id ? updatedOrder : order
    ));
  };

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка заказов...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Управление заказами</h1>
        <div className={styles.userInfo}>
          <span>Админ: {admin?.name}</span>
          <button onClick={handleBack} className={styles.backButton}>
            Назад
          </button>
        </div>
      </header>
      
      <main className={styles.content}>
        <div className={styles.ordersHeader}>
          <h2>Список заказов</h2>
          <div className={styles.pagination}>
            <button 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className={styles.pageButton}
            >
              Назад
            </button>
            <span>Страница {currentPage}</span>
            <button 
              onClick={() => setCurrentPage(prev => prev + 1)}
              className={styles.pageButton}
            >
              Вперед
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Заказы не найдены</p>
            <button onClick={loadOrders} className={styles.retryButton}>
              Попробовать снова
            </button>
          </div>
        ) : (
          <div className={styles.ordersList}>
            {orders.map(order => (
              <OrderCard 
                key={order.id} 
                order={order} 
                onOrderUpdated={handleOrderUpdated}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}