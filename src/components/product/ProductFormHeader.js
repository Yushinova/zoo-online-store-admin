'use client';
import styles from './ProductForm.module.css';

export function ProductFormHeader({ title, productId, mode = 'update' }) {
  if (mode === 'create') {
    return <h2 className={styles.title}>{title}</h2>;
  }

  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      {productId && <div className={styles.productId}>ID: {productId}</div>}
    </div>
  );
}