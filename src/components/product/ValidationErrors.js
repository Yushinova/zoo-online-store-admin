'use client';
import styles from './ProductForm.module.css';

export function ValidationErrors({ errors = [] }) {
  if (errors.length === 0) return null;

  return (
    <div className={styles.validationErrors}>
      <h4 className={styles.validationTitle}>Пожалуйста, исправьте следующие ошибки:</h4>
      <ul className={styles.validationList}>
        {errors.map((error, index) => (
          <li key={index} className={styles.validationItem}>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
}