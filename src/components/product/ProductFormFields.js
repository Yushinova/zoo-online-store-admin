'use client';
import styles from './ProductForm.module.css';

export function ProductFormFields({
  formData,
  categories,
  petTypes,
  loading,
  validationErrors = [],
  fetching = false,
  onInputChange,
  onNumberInput,
  onPetTypeToggle
}) {
  
  // Добавим отладочную информацию
  console.log('=== ProductFormFields Debug ===');
  console.log('formData:', formData);
  console.log('petTypes:', petTypes);
  console.log('formData.petTypeIds:', formData?.petTypeIds);
  console.log('Type of formData.petTypeIds:', typeof formData?.petTypeIds);
  console.log('Is Array?', Array.isArray(formData?.petTypeIds));
  
  // Валидационные ошибки для конкретных полей
  const getFieldError = (fieldName) => {
    if (!validationErrors || validationErrors.length === 0) return null;
    
    const fieldErrors = {
      name: 'Название товара обязательно',
      description: 'Описание товара обязательно',
      price: 'Цена должна быть больше 0',
      categoryId: 'Выберите категорию',
      petTypeIds: 'Выберите хотя бы один тип животного'
    };
    
    return validationErrors.find(error => error === fieldErrors[fieldName]);
  };

  // Безопасная проверка, выбран ли petType
  const isPetTypeSelected = (petTypeId) => {
    console.log(`Checking if petTypeId ${petTypeId} is selected`);
    
    if (!formData || !formData.petTypeIds) {
      console.log('formData or petTypeIds is undefined');
      return false;
    }
    
    // Убедимся, что это массив
    const petTypeIds = Array.isArray(formData.petTypeIds) ? formData.petTypeIds : [];
    console.log('Current petTypeIds:', petTypeIds);
    
    const isSelected = petTypeIds.includes(petTypeId);
    console.log(`Is selected? ${isSelected}`);
    
    return isSelected;
  };

  return (
    <>
      {/* Основная информация */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Основная информация</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Название товара *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={onInputChange}
            placeholder="Введите название товара"
            className={`${styles.input} ${getFieldError('name') ? styles.inputError : ''}`}
            required
            disabled={loading || fetching}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Описание *
          </label>
          <textarea
            name="description"
            value={formData.description || ''}
            onChange={onInputChange}
            placeholder="Опишите товар"
            className={`${styles.textarea} ${getFieldError('description') ? styles.inputError : ''}`}
            rows={4}
            required
            disabled={loading || fetching}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Бренд
          </label>
          <input
            type="text"
            name="brand"
            value={formData.brand || ''}
            onChange={onInputChange}
            placeholder="Введите бренд"
            className={styles.input}
            disabled={loading || fetching}
          />
        </div>
      </div>

      {/* Цены и количество */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Цены и количество</h3>
        
        <div className={styles.gridTwo}>
          <div className={styles.formGroup}>
            <label className={styles.label}>
              Цена продажи *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price || ''}
              onChange={(e) => onNumberInput('price', e.target.value)}
              placeholder="0.00"
              className={`${styles.input} ${getFieldError('price') ? styles.inputError : ''}`}
              min="0"
              step="0.01"
              required
              disabled={loading || fetching}
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>
              Себестоимость
            </label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice || ''}
              onChange={(e) => onNumberInput('costPrice', e.target.value)}
              placeholder="0.00"
              className={styles.input}
              min="0"
              step="0.01"
              disabled={loading || fetching}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            Количество на складе
          </label>
          <input
            type="number"
            name="quantity"
            value={formData.quantity || ''}
            onChange={(e) => onNumberInput('quantity', e.target.value)}
            placeholder="0"
            className={styles.input}
            min="0"
            disabled={loading || fetching}
          />
        </div>
      </div>

      {/* Категория */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Категория</h3>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>
            Категория *
          </label>
          {categories.length === 0 ? (
            <div className={styles.loadingText}>
              Загрузка категорий...
            </div>
          ) : (
            <select
              name="categoryId"
              value={formData.categoryId || ''}
              onChange={onInputChange}
              className={`${styles.select} ${getFieldError('categoryId') ? styles.inputError : ''}`}
              required
              disabled={loading || fetching}
            >
              <option value="">Выберите категорию</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Типы животных */}
      <div className={styles.formSection}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>Типы животных *</h3>
          <span className={styles.requiredHint}>(обязательно выбрать хотя бы один)</span>
        </div>
        
        {!petTypes || petTypes.length === 0 ? (
          <div className={styles.loadingText}>
            Загрузка типов животных...
          </div>
        ) : (
          <>
            <div className={styles.petTypesGrid}>
              {petTypes.map((petType, index) => {
                console.log(`Rendering petType ${index}:`, petType);
                
                // Безопасное получение данных petType
                const petTypeId = petType?.id;
                const petTypeName = petType?.name || `Тип ${index + 1}`;
                
                if (!petTypeId) {
                  console.warn(`PetType at index ${index} has no id!`, petType);
                  return null;
                }
                
                return (
                  <label key={petTypeId} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={isPetTypeSelected(petTypeId)}
                      onChange={() => {
                        console.log(`Toggling petTypeId: ${petTypeId}`);
                        onPetTypeToggle(petTypeId);
                      }}
                      className={styles.checkbox}
                      disabled={loading || fetching}
                    />
                    <span className={styles.checkboxText}>{petTypeName}</span>
                  </label>
                );
              })}
            </div>
            
            <div className={styles.petTypesStatus}>
              {formData.petTypeIds && Array.isArray(formData.petTypeIds) && formData.petTypeIds.length > 0 ? (
                <p className={styles.selectedCount}>
                  Выбрано: {formData.petTypeIds.length} типа(ов) животных
                </p>
              ) : (
                <p className={`${styles.requiredWarning} ${getFieldError('petTypeIds') ? styles.errorHighlight : ''}`}>
                  ⚠️ Выберите хотя бы один тип животного
                </p>
              )}
            </div>
          </>
        )}
      </div>

      {/* Статусы */}
      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Статусы</h3>
        <div className={styles.checkboxGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isPromotion"
              checked={formData.isPromotion || false}
              onChange={onInputChange}
              className={styles.checkbox}
              disabled={loading || fetching}
            />
            <span className={styles.checkboxText}>Акционный товар</span>
          </label>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive ?? true}
              onChange={onInputChange}
              className={styles.checkbox}
              disabled={loading || fetching}
            />
            <span className={styles.checkboxText}>Активный (доступен для продажи)</span>
          </label>
        </div>
      </div>
    </>
  );
}