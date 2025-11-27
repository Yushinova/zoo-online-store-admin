'use client';
import { useState } from 'react';
import { ProductImageRequest } from '@/models/productImage';
import { productImageService } from '@/api/productImageService';

export default function TestProductImage() {
  const [imageName, setImageName] = useState('');
  const [altText, setAltText] = useState('');
  const [deleteName, setDeleteName] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (type, message, success = true) => {
    setResults(prev => [...prev, {
      id: Date.now(),
      type,
      message,
      success,
      timestamp: new Date().toLocaleTimeString()
    }]);
  };

  const handleAddImage = async (e) => {
    e.preventDefault();
    setLoading(true);

    const request = new ProductImageRequest();
    request.imageName = imageName || `test-image-${Date.now()}`;
    request.altText = altText || `Test alt text ${Date.now()}`;
    request.productId = 1; // Тестовый productId

    try {
      await productImageService.insert(request);
      addTestResult('ADD', `Image added successfully: ${request.imageName}`);
      
      // Очищаем поля после успешного добавления
      setImageName('');
      setAltText('');
    } catch (err) {
      addTestResult('ADD', `Failed to add image: ${err.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteName && !confirm('Delete without specifying name?')) return;

    const nameToDelete = deleteName || `test-image-${Date.now() - 1000}`;
    setLoading(true);

    try {
      await productImageService.deleteByName(nameToDelete);
      addTestResult('DELETE', `Image deleted successfully: ${nameToDelete}`);
      setDeleteName('');
    } catch (err) {
      addTestResult('DELETE', `Failed to delete image: ${err.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickTest = async () => {
    setLoading(true);
    const testName = `quick-test-${Date.now()}`;
    const request = new ProductImageRequest();
    request.imageName = testName;
    request.altText = 'Quick test alt text';
    request.productId = 1;

    try {
      // Добавляем
      await productImageService.insert(request);
      addTestResult('QUICK_TEST', `Image added: ${testName}`);
      
      // Удаляем
      await productImageService.deleteByName(testName);
      addTestResult('QUICK_TEST', `Image deleted: ${testName}`);
      
    } catch (err) {
      addTestResult('QUICK_TEST', `Test failed: ${err.message}`, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test Product Image Service</h1>
      <p className="mb-4">ProductId: <strong>1</strong></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Форма добавления */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Add Image</h2>
          <form onSubmit={handleAddImage}>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Image Name</label>
                <input
                  type="text"
                  value={imageName}
                  onChange={(e) => setImageName(e.target.value)}
                  placeholder="Auto-generate if empty"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Alt Text</label>
                <input
                  type="text"
                  value={altText}
                  onChange={(e) => setAltText(e.target.value)}
                  placeholder="Auto-generate if empty"
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Adding...' : 'Add Test Image'}
              </button>
            </div>
          </form>
        </div>

        {/* Форма удаления */}
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Delete Image</h2>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Image Name to Delete</label>
              <input
                type="text"
                value={deleteName}
                onChange={(e) => setDeleteName(e.target.value)}
                placeholder="Leave empty for auto-test"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            
            <button
              onClick={handleDeleteImage}
              disabled={loading}
              className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 disabled:bg-gray-400"
            >
              {loading ? 'Deleting...' : 'Delete Image'}
            </button>
          </div>
        </div>
      </div>

      {/* Быстрый тест */}
      <div className="mb-6">
        <button
          onClick={handleQuickTest}
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          Run Quick Test (Add + Delete)
        </button>
      </div>

      {/* Результаты тестов */}
      <div className="border-t pt-4">
        <h2 className="text-lg font-semibold mb-3">Test Results</h2>
        <div className="space-y-2">
          {results.map((result) => (
            <div
              key={result.id}
              className={`p-3 rounded ${
                result.success ? 'bg-green-100' : 'bg-red-100'
              }`}
            >
              <div className="flex justify-between">
                <span className="font-medium">{result.type}</span>
                <span className="text-gray-500 text-sm">{result.timestamp}</span>
              </div>
              <p>{result.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}