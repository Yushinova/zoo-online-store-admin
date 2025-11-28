'use client';
import { useState, useEffect } from 'react';
import PetTypeCard from '@/components/petType/PetTypeCard';
import { petTypeService } from '@/api/petTypeService';

export default function TestPetTypeCard() {
  const [petTypes, setPetTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('medium');
  const [showNames, setShowNames] = useState(true);
  const [selectedPetType, setSelectedPetType] = useState(null);

  // Загружаем Pet Types из базы данных
  const loadPetTypes = async () => {
    try {
      setLoading(true);
      const data = await petTypeService.getAllWithCategoties();
      setPetTypes(data);
      console.log('Загружено Pet Types из базы:', data);
    } catch (error) {
      console.error('Error loading pet types:', error);
      alert(`Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPetTypes();
  }, []);

  const handleCardClick = (petType) => {
    setSelectedPetType(petType);
    console.log('Выбрана карточка:', petType);
  };

  const refreshData = () => {
    loadPetTypes();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Загрузка Pet Types из базы данных...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Тестирование PetType Card
        </h1>

        {/* Информация о данных */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium text-blue-800">Данные из базы</h3>
              <p className="text-sm text-blue-700">
                Загружено {petTypes.length} Pet Types
              </p>
            </div>
            <button
              onClick={refreshData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm"
            >
              Обновить
            </button>
          </div>
        </div>

        {/* Настройки */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Настройки отображения</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Выбор размера */}
            <div>
              <label className="block text-sm font-medium mb-2">Размер карточки:</label>
              <div className="flex space-x-2">
                {['small', 'medium', 'large'].map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 rounded capitalize ${
                      selectedSize === size 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Показ названий */}
            <div>
              <label className="block text-sm font-medium mb-2">Показывать названия:</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowNames(true)}
                  className={`px-4 py-2 rounded ${
                    showNames 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Да
                </button>
                <button
                  onClick={() => setShowNames(false)}
                  className={`px-4 py-2 rounded ${
                    !showNames 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  Нет
                </button>
              </div>
            </div>
          </div>

          {/* Информация о выбранной карточке */}
          {selectedPetType && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Выбрана карточка:</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><strong>ID:</strong> {selectedPetType.id}</div>
                <div><strong>Название:</strong> {selectedPetType.name}</div>
                <div><strong>ImageName:</strong> {selectedPetType.imageName || 'не установлен'}</div>
                <div><strong>Категории:</strong> {selectedPetType.categories?.length || 0}</div>
              </div>
            </div>
          )}
        </div>

        {/* Основная сетка карточек */}
        {petTypes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Нет данных</h3>
            <p className="text-gray-500 mb-4">В базе данных нет типов питомцев</p>
            <button
              onClick={() => window.open('/test-pet-type-form', '_blank')}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Создать Pet Type
            </button>
          </div>
        ) : (
          <>
            {/* Сетка карточек */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">
                Сетка карточек ({petTypes.length} шт.)
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {petTypes.map(petType => (
                  <PetTypeCard 
                    key={petType.id}
                    petType={petType}
                    onClick={handleCardClick}
                    size={selectedSize}
                    showName={showNames}
                  />
                ))}
              </div>
            </div>

            {/* Демонстрация разных вариантов */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Разные варианты использования</h2>
              
              <div className="space-y-6">
                {/* Все размеры */}
                <div>
                  <h3 className="font-medium mb-3">Все размеры:</h3>
                  <div className="flex flex-wrap gap-4 items-end">
                    {petTypes.slice(0, 3).map((petType, index) => (
                      <div key={petType.id} className="text-center">
                        <PetTypeCard 
                          petType={petType} 
                          size={['small', 'medium', 'large'][index]}
                        />
                        <p className="text-xs mt-1 text-gray-600 capitalize">
                          {['small', 'medium', 'large'][index]}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* С названием и без */}
                {petTypes.length >= 2 && (
                  <div>
                    <h3 className="font-medium mb-3">С названием и без:</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="text-center">
                        <PetTypeCard 
                          petType={petTypes[0]} 
                          size="medium"
                          showName={true}
                        />
                        <p className="text-xs mt-1 text-gray-600">С названием</p>
                      </div>
                      <div className="text-center">
                        <PetTypeCard 
                          petType={petTypes[1]} 
                          size="medium"
                          showName={false}
                        />
                        <p className="text-xs mt-1 text-gray-600">Без названия</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Кликабельные и статические */}
                {petTypes.length >= 2 && (
                  <div>
                    <h3 className="font-medium mb-3">Кликабельные и статические:</h3>
                    <div className="flex flex-wrap gap-4">
                      <div className="text-center">
                        <PetTypeCard 
                          petType={petTypes[0]} 
                          size="medium"
                          onClick={handleCardClick}
                        />
                        <p className="text-xs mt-1 text-gray-600">Кликабельная</p>
                      </div>
                      <div className="text-center">
                        <PetTypeCard 
                          petType={petTypes[1]} 
                          size="medium"
                        />
                        <p className="text-xs mt-1 text-gray-600">Статическая</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Debug информация */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Тестируемые функции:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Реальные данные</strong> - загружены из базы данных</li>
            <li>• <strong>Разные размеры</strong> - small (80px), medium (120px), large (150px)</li>
            <li>• <strong>Показ названий</strong> - можно включать/выключать</li>
            <li>• <strong>Кликабельность</strong> - нажмите на карточку для информации</li>
            <li>• <strong>Заглушки</strong> - автоматически для Pet Types без изображений</li>
            <li>• <strong>Адаптивная сетка</strong> - 2-6 колонок в зависимости от экрана</li>
            <li>• <strong>Анимации</strong> - плавные эффекты при наведении</li>
          </ul>
        </div>
      </div>
    </div>
  );
}