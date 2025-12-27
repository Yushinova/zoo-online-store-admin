'use client';
import styles from './ProductForm.module.css';

export function ProductFormButtons({
  mode = 'create',
  loading,
  validationErrors = [],
  formData = {}, //значение по умолчанию
  categories = [], //значение по умолчанию
  onCancel,
  onClear,
  onDelete,
  isDeleteConfirm = false,
  onSubmit,
  submitLabel
}) {
  
  console.log('=== ProductFormButtons Debug ===');
  console.log('formData:', formData);
  console.log('categories:', categories);
  console.log('formData?.petTypeIds:', formData?.petTypeIds);
  console.log('Type of formData?.petTypeIds:', typeof formData?.petTypeIds);
  console.log('Is Array?', Array.isArray(formData?.petTypeIds));
  
  const canSubmit = () => {
    if (loading) return false;
    
    //categories
    const categoriesArray = Array.isArray(categories) ? categories : [];
    if (categoriesArray.length === 0) {
      console.log('Cannot submit: categories is empty');
      return false;
    }
    
    //petTypeIds
    const petTypeIds = formData?.petTypeIds;
    if (!petTypeIds || !Array.isArray(petTypeIds)) {
      return false;
    }
    
    if (petTypeIds.length === 0) {
      console.log('Cannot submit: petTypeIds is empty');
      return false;
    }
    
    console.log('Can submit: true');
    return true;
  };

  const getSubmitTitle = () => {
    const categoriesArray = Array.isArray(categories) ? categories : [];
    if (categoriesArray.length === 0) return 'Загрузка категорий...';
    
    const petTypeIds = formData?.petTypeIds;
    if (!petTypeIds || !Array.isArray(petTypeIds) || petTypeIds.length === 0) {
      return 'Выберите тип животного';
    }
    
    return '';
  };

  const submitTitle = getSubmitTitle();
  const isSubmitDisabled = !canSubmit() || loading;

  return (
    <div className={styles.buttons}>
      <div className={styles.leftButtons}>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className={styles.cancelButton}
            disabled={loading}
          >
            Отмена
          </button>
        )}
        
        {onClear && mode === 'create' && (
          <button
            type="button"
            onClick={onClear}
            className={styles.clearButton}
            disabled={loading}
          >
            Очистить
          </button>
        )}
        
        {onClear && mode === 'update' && (
          <button
            type="button"
            onClick={onClear}
            className={styles.clearButton}
            disabled={loading}
          >
            Сбросить изменения
          </button>
        )}
      </div>
      
      <div className={styles.rightButtons}>
        {onDelete && mode === 'update' && (
          <button
            type="button"
            onClick={onDelete}
            className={isDeleteConfirm ? styles.deleteConfirmButton : styles.deleteButton}
            disabled={loading}
          >
            {isDeleteConfirm ? 'Подтвердить удаление' : 'Удалить товар'}
          </button>
        )}
        
        {onSubmit && (
          <button
            type="button"
            onClick={onSubmit}
            className={styles.submitButton}
            disabled={isSubmitDisabled}
            title={submitTitle}
          >
            {loading ? (
              <>
                <div className={styles.loadingSpinner}></div>
                {mode === 'create' ? 'Создание...' : 'Сохранение...'}
              </>
            ) : (
              submitLabel || (mode === 'create' ? 'Создать товар' : 'Сохранить изменения')
            )}
          </button>
        )}
      </div>
    </div>
  );
}