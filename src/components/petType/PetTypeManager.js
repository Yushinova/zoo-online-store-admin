'use client';
import { useState, useEffect } from 'react';
import { petTypeService } from '@/api/petTypeService';
import PetTypeCard from './PetTypeCard';
import PetTypeForm from './PetTypeForm';
import styles from './PetTypeManager.module.css';

export default function PetTypeManager() {
  const [petTypes, setPetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mode, setMode] = useState('view'); // 'view' | 'redact' | 'create'
  const [selectedPetType, setSelectedPetType] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [petTypeToDelete, setPetTypeToDelete] = useState(null);

  //загрузка типов животных
  const loadPetTypes = async () => {
    try {
      setLoading(true);
      const data = await petTypeService.getAllWithCategoties();
      setPetTypes(data);
      setError('');
    } catch (err) {
      console.error('Error loading pet types:', err);
      setError(`Ошибка загрузки: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPetTypes();
  }, []);

  //обработчик клика по карточке
  const handlePetTypeClick = (petType) => {
    if (mode === 'view') {
      console.log('Selected pet type:', petType);
    }
  };

  //редактирование типа животного
  const handleEdit = (petType) => {
    setSelectedPetType(petType);
    setMode('redact');
  };

  //удаление типа животного
  const handleDelete = (petType) => {
    setPetTypeToDelete(petType);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!petTypeToDelete) return;

    try {
      await petTypeService.deleteById(petTypeToDelete.id);
      await loadPetTypes(); //перезагружаем список
      alert(`Тип питомца "${petTypeToDelete.name}" успешно удален!`);
    } catch (err) {
      console.error('Error deleting pet type:', err);
      alert(`Ошибка удаления: ${err.message}`);
    } finally {
      setShowDeleteConfirm(false);
      setPetTypeToDelete(null);
    }
  };

  //создание нового типа животного
  const handleAddNew = () => {
    setSelectedPetType(null);
    setMode('create');
  };

  //отмена редактирования/создания
  const handleCancel = () => {
    setMode('view');
    setSelectedPetType(null);
  };

  //сохранение формы
  const handleFormSuccess = () => {
    setMode('view');
    setSelectedPetType(null);
    loadPetTypes(); //перезагружаем список
  };

  //если режим редактирования или создания - показываем форму
  if (mode === 'redact' || mode === 'create') {
    return (
      <div className={styles.container}>
        <PetTypeForm
          petType={mode === 'redact' ? selectedPetType : null}
          onSuccess={handleFormSuccess}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  //режим просмотра
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Типы животных</h1>
        <button
          onClick={handleAddNew}
          className={styles.addButton}
        >
          <svg className={styles.addIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          Добавить тип
        </button>
      </div>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>
          Загрузка типов животных...
        </div>
      ) : (
        <div className={styles.petTypesGrid}>
          {/*карточки существующих типов животных*/}
          {petTypes.map(petType => (
            <div key={petType.id} className={styles.petTypeItem}>
              <PetTypeCard
                petType={petType}
                onClick={handlePetTypeClick}
                size="medium"
                showName={true}
                orientation="vertical"
              />
              
              <div className={styles.actions}>
                <button
                  onClick={() => handleEdit(petType)}
                  className={styles.editButton}
                >
                  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                  Редактировать
                </button>
                
                <button
                  onClick={() => handleDelete(petType)}
                  className={styles.deleteButton}
                >
                  <svg className={styles.buttonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                  Удалить
                </button>
              </div>
            </div>
          ))}

          {/*Добавить*/}
          <div className={styles.petTypeItem}>
            <div 
              className={`${styles.addCard} ${styles.card}`}
              onClick={handleAddNew}
            >
              <div className={styles.addCardContent}>
                <svg className={styles.addCardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                </svg>
                <div className={styles.addCardText}>Добавить тип</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*модальное окно подтверждения удаления*/}
      {showDeleteConfirm && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Подтверждение удаления</h3>
            <p className={styles.modalText}>
              Вы уверены, что хотите удалить тип питомца <strong>"{petTypeToDelete?.name}"</strong>?
            </p>
            <div className={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={styles.modalCancel}
              >
                Отмена
              </button>
              <button
                onClick={confirmDelete}
                className={styles.modalConfirm}
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}