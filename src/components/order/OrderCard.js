'use client';
import { useState } from 'react';
import { orderService} from '@/api/orderService';
import { OrderRequest, OrderUpdateRequest } from '@/models/order';
import styles from './OrderCard.module.css';

const ORDER_STATUSES = [
  { value: 'pending', label: 'В процессе оплаты' },
  { value: 'paid', label: 'Оплачен' },
  { value: 'processing', label: 'В обработке' },
  { value: 'shipped', label: 'Отправлен' },
  { value: 'delivered', label: 'Доставлен' },
  { value: 'deleted', label: 'Удален' }
];

export default function OrderCard({ order, onOrderUpdated}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedOrder, setEditedOrder] = useState({ ...order });
  const [isLoading, setIsLoading] = useState(false);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedOrder({ ...order });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedOrder({ ...order });
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const orderUp = new OrderUpdateRequest();
      orderUp.shippingCost = editedOrder.shippingCost;
      orderUp.status = editedOrder.status;
      orderUp.shippingAddress = editedOrder.shippingAddress;
   
     
      const updatedOrder = await orderService.updateOrderById(order.id, orderUp);
      
      //вызываем callback для обновления родительского компонента
      if (onOrderUpdated) {
        onOrderUpdated(updatedOrder);
      }
      
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating order:', error);
      alert(`Ошибка при обновлении заказа: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setEditedOrder(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': '#ffc107',
      'paid': '#49cc15ff',
      'processing': '#007bff',
      'shipped': '#6f42c1',
      'delivered': '#606b62ff',
      'deleted': '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const statusObj = ORDER_STATUSES.find(s => s.value === status);
    return statusObj ? statusObj.label : status;
  };

  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
 const totalWithShipping = order.amount + order.shippingCost;
  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(price);
  };

  return (
    <div className={styles.orderCard}>
      {/*заголовок заказа*/}
      <div className={styles.orderHeader}>
        <div className={styles.orderNumber}>
          Заказ #{order.orderNumber}
        </div>
        <div 
          className={styles.statusBadge}
          style={{ backgroundColor: getStatusColor(order.status) }}
        >
          {getStatusLabel(order.status)}
        </div>
      </div>

      {/*информация о пользователе*/}
      <div className={styles.userSection}>
        <h3>Информация о покупателе</h3>
        <div className={styles.userInfo}>
          <span><strong>Имя:</strong> {order.user.name}</span>
          <span><strong>Телефон:</strong> {order.user.phone}</span>
        </div>
      </div>

      {/*редактируемые поля*/}
      <div className={styles.editableSection}>
        <div className={styles.field}>
          <label className={styles.label}>Адрес доставки:</label>
          {isEditing ? (
            <textarea
              value={editedOrder.shippingAddress}
              onChange={(e) => handleChange('shippingAddress', e.target.value)}
              className={styles.textarea}
              rows="3"
            />
          ) : (
            <span className={styles.value}>
              {order.shippingAddress || 'Не указан'}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Статус заказа:</label>
          {isEditing ? (
            <select
              value={editedOrder.status}
              onChange={(e) => handleChange('status', e.target.value)}
              className={styles.select}
            >
              {ORDER_STATUSES.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          ) : (
            <span className={styles.value}>
              {getStatusLabel(order.status)}
            </span>
          )}
        </div>

        <div className={styles.field}>
          <label className={styles.label}>Стоимость доставки:</label>
          {isEditing ? (
            <input
              type="number"
              value={editedOrder.shippingCost}
              onChange={(e) => handleChange('shippingCost', Math.round(Number(e.target.value)) || 0)}
              className={styles.input}
              min="0"
            />
          ) : (
            <span className={styles.value}>
              {formatPrice(order.shippingCost)}
            </span>
          )}
        </div>
      </div>

      {/*детали заказа*/}
      <div className={styles.orderDetails}>
        <div className={styles.detailItem}>
          <strong>Сумма товаров:</strong> <h2 className={styles.itemPrice} >{formatPrice(order.amount)}</h2>
          <strong>Общая сумма:</strong> <h2 className={styles.itemPrice} >{totalWithShipping}</h2>
        </div>
        <div className={styles.detailItem}>
          <strong>Дата создания:</strong> {formatDate(order.createdAt)}
        </div>
        <div className={styles.detailItem}>
          <strong>ID заказа:</strong> {order.id}
        </div>
      </div>

      {/*товары в заказе*/}
      {order.orderItems && order.orderItems.length > 0 && (
        <div className={styles.itemsSection}>
          <h3>Товары в заказе ({order.orderItems.length})</h3>
          <div className={styles.itemsList}>
            {order.orderItems.map((item, index) => (
              <div key={index} className={styles.item}>
                <span className={styles.itemName}>
                  {item.productName || `Товар ${index + 1}`}
                </span>
                <span className={styles.itemQuantity}>
                  {item.quantity} шт.
                </span>
                <span className={styles.itemPrice}>
                  {formatPrice(item.price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/*кнопки управления*/}
      <div className={styles.actions}>
        {isEditing ? (
          <>
            <button 
              onClick={handleSave}
              disabled={isLoading}
              className={`${styles.button} ${styles.saveButton}`}
            >
              {isLoading ? 'Сохранение...' : 'Сохранить'}
            </button>
            <button 
              onClick={handleCancel}
              disabled={isLoading}
              className={`${styles.button} ${styles.cancelButton}`}
            >
              Отмена
            </button>
          </>
        ) : (
          <button 
            onClick={handleEdit}
            className={`${styles.button} ${styles.editButton}`}
          >
            Редактировать
          </button>
        )}
      </div>
    </div>
  );
}