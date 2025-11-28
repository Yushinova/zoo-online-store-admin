'use client';
import { useState, useEffect } from 'react';
import { petTypeService } from '@/api/petTypeService';

export default function DebugPetTypes() {
  const [petTypes, setPetTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔄 Loading pet types with getAllWithCategoties()...');
      
      const data = await petTypeService.getAllWithCategoties();
      console.log('📥 RAW RESPONSE FROM BACKEND:', data);
      
      if (data && data.length > 0) {
        console.log('🔍 FIRST PET TYPE DETAILS:');
        const firstPetType = data[0];
        console.log('Full object:', firstPetType);
        console.log('Keys:', Object.keys(firstPetType));
        console.log('ID:', firstPetType.id);
        console.log('Name:', firstPetType.name);
        console.log('ImageName:', firstPetType.imageName);
        console.log('Categories:', firstPetType.categories);
        
        // Проверим все pet types
        data.forEach((petType, index) => {
          console.log(`--- PetType ${index + 1} ---`);
          console.log('Name:', petType.name);
          console.log('ImageName:', petType.imageName);
          console.log('Has imageName?', 'imageName' in petType);
        });
      }
      
      setPetTypes(data);
    } catch (error) {
      console.error('❌ Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Debug PetTypes Response</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Данные с бэкенда</h2>
          
          {petTypes.length === 0 ? (
            <p className="text-gray-500">Нет данных</p>
          ) : (
            <div className="space-y-4">
              {petTypes.map((petType, index) => (
                <div key={petType.id} className="border rounded-lg p-4">
                  <h3 className="font-medium text-lg">{petType.name} (ID: {petType.id})</h3>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <strong>ImageName:</strong> 
                      <span className={petType.imageName ? 'text-green-600' : 'text-red-600'}>
                        {petType.imageName || 'NULL'}
                      </span>
                    </div>
                    <div>
                      <strong>Has imageName:</strong> 
                      <span className={('imageName' in petType) ? 'text-green-600' : 'text-red-600'}>
                        {('imageName' in petType).toString()}
                      </span>
                    </div>
                    <div>
                      <strong>Categories:</strong> {petType.categories?.length || 0}
                    </div>
                  </div>

                  {/* Покажем все свойства объекта */}
                  <details className="mt-3">
                    <summary className="cursor-pointer text-blue-600 font-medium">Все свойства объекта</summary>
                    <pre className="text-xs bg-gray-100 p-2 mt-2 rounded overflow-x-auto">
                      {JSON.stringify(petType, null, 2)}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Что проверять в Console:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Приходит ли поле <code>imageName</code> в ответе</li>
            <li>• Если приходит - какое значение</li>
            <li>• Если не приходит - возможно проблема в маппинге на бэкенде</li>
            <li>• Проверьте AutoMapper конфигурацию для <code>PetType → PetTypeResponse</code></li>
          </ul>
        </div>

        <button
          onClick={loadData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Перезагрузить данные
        </button>
      </div>
    </div>
  );
}