'use client';
import { useState } from 'react';
import { categoryService } from '@/api/categoryService';
import { CategoryRequest, CategoryResponse } from '@/models/category';

export default function TestCategories() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('Нажмите кнопку для теста');
  const [categories, setCategories] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [deleteId, setDeleteId] = useState('');

  const testGetAll = async () => {
    setLoading(true);
    setResult('Тестируем получение категорий...');
    
    try {
      const categoriesData = await categoryService.getAllAsync();
      setCategories(categoriesData);
      setResult(`УСПЕХ: Получено ${categoriesData.length} категорий`);
      console.log('Categories:', categoriesData);
    } catch (error) {
      setResult(`ОШИБКА: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCreateCategory = async () => {
    if (!categoryName.trim()) {
      setResult('ОШИБКА: Введите название категории');
      return;
    }

    setLoading(true);
    setResult('Создаем категорию...');
    
    try {
      const categoryRequest = new CategoryRequest(); 
      categoryRequest.name = "Some from front";
      await categoryService.insert(categoryRequest);
      setResult(`УСПЕХ: Категория "${categoryName}" создана`);
      setCategoryName('');
      
      // Обновляем список категорий
      testGetAll();
    } catch (error) {
      setResult(`ОШИБКА: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testDeleteCategory = async () => {
    if (!deleteId) {
      setResult('ОШИБКА: Введите ID категории для удаления');
      return;
    }

    setLoading(true);
    setResult('Удаляем категорию...');
    
    try {
      await categoryService.deleteById(parseInt(deleteId));
      setResult(`УСПЕХ: Категория с ID ${deleteId} удалена`);
      setDeleteId('');
      
      // Обновляем список категорий
      testGetAll();
    } catch (error) {
      setResult(`ОШИБКА: ${error.message}`);
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Тестирование Category Service
        </h1>

        {/* Кнопки тестирования */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Получить все категории */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Get All Categories</h2>
            <button
              onClick={testGetAll}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Загрузка...' : 'Получить категории'}
            </button>
          </div>

          {/* Создать категорию */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create Category</h2>
            <div className="space-y-3">
              <input
                type="text"
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                placeholder="Название категории"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                onClick={testCreateCategory}
                disabled={loading}
                className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Создание...' : 'Создать категорию'}
              </button>
            </div>
          </div>

          {/* Удалить категорию */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Delete Category</h2>
            <div className="space-y-3">
              <input
                type="number"
                value={deleteId}
                onChange={(e) => setDeleteId(e.target.value)}
                placeholder="ID категории"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                onClick={testDeleteCategory}
                disabled={loading}
                className="w-full bg-red-500 text-white p-3 rounded hover:bg-red-600 disabled:bg-gray-400"
              >
                {loading ? 'Удаление...' : 'Удалить категорию'}
              </button>
            </div>
          </div>
        </div>

        {/* Результат */}
        <div className={`mb-6 p-4 rounded ${
          result.includes('ОШИБКА') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
        }`}>
          <strong>Результат:</strong> {result}
        </div>

        {/* Список категорий */}
        {categories.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">
              Список категорий ({categories.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {categories.map((category) => (
                <div key={category.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-medium text-lg text-blue-600">{category.name}</h3>
                  <div className="flex flex-wrap gap-2 mt-2 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded">ID: {category.id}</span>
                    {category.description && (
                      <span className="bg-green-100 px-2 py-1 rounded">{category.description}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Debug информация */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Endpoints:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• GET /api/category - Получить все категории</li>
            <li>• POST /api/category - Создать категорию</li>
            <li>• DELETE /api/category/{'{id}'} - Удалить категорию</li>
          </ul>
        </div>
      </div>
    </div>
  );
}