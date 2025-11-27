'use client';
import { useState } from 'react';
import ImageUploader from '@/components/imageUpload/ImageUpoad';

export default function TestUploadPage() {
  const [uploadedImages, setUploadedImages] = useState([]);
  const [productId, setProductId] = useState(1);

  const handleImagesChange = (images) => {
    console.log('Images changed:', images);
    setUploadedImages(images);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Тестирование загрузки изображений
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">
              Product ID для тестирования:
            </label>
            <input
              type="number"
              value={productId}
              onChange={(e) => setProductId(parseInt(e.target.value) || 1)}
              className="w-32 px-3 py-2 border border-gray-300 rounded-md"
              min="1"
            />
          </div>

          <ImageUploader 
            productId={productId}
            onImagesChange={handleImagesChange}
          />
        </div>

        {/* Информация о загруженных изображениях */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">
            Информация о загруженных изображениях
          </h2>
          
          {uploadedImages.length === 0 ? (
            <p className="text-gray-500">Изображения еще не загружены</p>
          ) : (
            <div className="space-y-4">
              <p className="text-green-600 font-medium">
                Загружено изображений: {uploadedImages.length}
              </p>
              
              <div className="grid gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <img 
                        src={image.publicUrl} 
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">Изображение {index + 1}</h3>
                        <p className="text-sm text-gray-600">
                          <strong>File name:</strong> {image.fileName}
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Public URL:</strong>{' '}
                          <a 
                            href={image.publicUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:underline break-all"
                          >
                            {image.publicUrl}
                          </a>
                        </p>
                        <p className="text-sm text-gray-600">
                          <strong>Size:</strong> {(image.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Debug информация */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Debug информация:</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Product ID: {productId}</li>
            <li>• Загружено файлов: {uploadedImages.length}</li>
            <li>• Проверяйте Console для детальной информации</li>
            <li>• Максимум 4 файла по 5MB каждый</li>
          </ul>
        </div>
      </div>
    </div>
  );
}