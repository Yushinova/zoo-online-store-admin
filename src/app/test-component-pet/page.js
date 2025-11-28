'use client';
import { useState, useEffect } from 'react';
import PetTypeForm from '@/components/petType/PetTypeForm';
import { petTypeService } from '@/api/petTypeService';

export default function TestPetTypeForm() {
  const [petTypes, setPetTypes] = useState([]);
  const [selectedPetType, setSelectedPetType] = useState(null);
  const [mode, setMode] = useState('list'); // 'list', 'create', 'edit'

  // Загружаем список Pet Types
  const loadPetTypes = async () => {
    try {
      const data = await petTypeService.getAllWithCategoties();
      setPetTypes(data);
    } catch (error) {
      console.error('Error loading pet types:', error);
    }
  };

  useEffect(() => {
    loadPetTypes();
  }, []);

  const handleCreateSuccess = () => {
    console.log('Pet Type создан успешно!');
    loadPetTypes(); // Обновляем список
    setMode('list'); // Возвращаемся к списку
  };

  const handleEditSuccess = () => {
    console.log('Pet Type обновлен успешно!');
    loadPetTypes(); // Обновляем список
    setMode('list'); // Возвращаемся к списку
    setSelectedPetType(null);
  };

  const handleEdit = (petType) => {
    setSelectedPetType(petType);
    setMode('edit');
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedPetType(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Вы уверены что хотите удалить этот тип питомца?')) return;

    try {
      await petTypeService.deleteById(id);
      alert('Тип питомца удален!');
      loadPetTypes();
    } catch (error) {
      alert(`Ошибка удаления: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Тестирование PetType Form
        </h1>

        {/* Кнопки управления */}
        <div className="mb-6 flex justify-center space-x-4">
          <button
            onClick={() => setMode('list')}
            className={`px-4 py-2 rounded ${
              mode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Список
          </button>
          <button
            onClick={() => setMode('create')}
            className={`px-4 py-2 rounded ${
              mode === 'create' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Создать новый
          </button>
        </div>

        {/* Режим списка */}
        {mode === 'list' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Список типов питомцев</h2>
            
            {petTypes.length === 0 ? (
              <p className="text-gray-500">Нет типов питомцев</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {petTypes.map((petType) => (
                  <div key={petType.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">{petType.name}</h3>
                        <p className="text-sm text-gray-600">ID: {petType.id}</p>
                        <p className="text-sm text-gray-600">
                          ImageName: {petType.imageName || 'не установлен'}
                        </p>
                        {petType.categories && petType.categories.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">Категории:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {petType.categories.map(cat => (
                                <span key={cat.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                                  {cat.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(petType)}
                          className="bg-yellow-500 text-white px-3 py-1 rounded text-sm hover:bg-yellow-600"
                        >
                          Редакт.
                        </button>
                        <button
                          onClick={() => handleDelete(petType.id)}
                          className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Режим создания */}
        {mode === 'create' && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Создание нового типа питомца</h2>
            <PetTypeForm 
              onSuccess={handleCreateSuccess}
              onCancel={() => setMode('list')}
            />
          </div>
        )}

        {/* Режим редактирования */}
        {mode === 'edit' && selectedPetType && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Редактирование: {selectedPetType.name}
            </h2>
            <PetTypeForm 
              petType={selectedPetType}
              onSuccess={handleEditSuccess}
              onCancel={handleCancel}
            />
          </div>
        )}

        {/* Debug информация */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Режимы тестирования:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• <strong>Список</strong> - просмотр всех Pet Types</li>
            <li>• <strong>Создать новый</strong> - тест создания</li>
            <li>• <strong>Редактирование</strong> - тест обновления (нажмите "Редакт." в списке)</li>
            <li>• Проверьте что ImageName сохраняется при создании и редактировании</li>
          </ul>
        </div>
      </div>
    </div>
  );
}