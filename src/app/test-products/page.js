'use client';
import { useState } from 'react';
import { ProductQueryParameters, ProductRequest } from "@/models/product"
import { productService } from '@/api/productService';
import ProductFilters from '@/components/product/ProductFilters';

export default function TestProductsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState(new ProductQueryParameters());

  // Тест получения всех продуктов с фильтрами
  const testGetAll = async (appliedFilters = null) => {
    setLoading(true);
    setResult('');
    
    try {
      const params = appliedFilters || filters;
      const productsData = await productService.getAllWithFilterAndPagination(params);
      setProducts(productsData);
      setResult(`SUCCESS: Found ${productsData.length} products with current filters`);
      
    } catch (error) {
      setResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testGetById = async () => {
    if (!productId) {
      setResult('ERROR: Please enter product ID');
      return;
    }

    setLoading(true);
    setResult('');
    
    try {
      const product = await productService.getByIdWithAllInfo(parseInt(productId));
      setSelectedProduct(product);
      setResult(`SUCCESS: Found product "${product.name}"`);
      
    } catch (error) {
      setResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateProduct = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const request = new ProductRequest();
      request.name = `Test Product ${Date.now()}`;
      request.description = 'This is a test product created from Next.js';
      request.price = 99.99;
      request.costPrice = 50.00;
      request.quantity = 100;
      request.brand = 'Test Brand';
      request.rating = 4.5;
      request.isPromotion = true;
      request.isActive = true;
      request.categoryId = 1;
      request.petTypeIds = [1, 2];

      const createdProduct = await productService.insertProduct(request);
      setResult(`SUCCESS: Created product "${createdProduct.name}" with ID: ${createdProduct.id}`);
      
    } catch (error) {
      setResult(`ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Обработчики для фильтров
  const handleFiltersChange = (newFilters) => {
    console.log('Filters changed:', newFilters);
    setFilters(newFilters);
  };

  const handleApplyFilters = (appliedFilters) => {
    console.log('Applying filters:', appliedFilters);
    testGetAll(appliedFilters);
  };

  const handleResetFilters = (resetFilters) => {
    console.log('Filters reset:', resetFilters);
    setFilters(resetFilters);
    testGetAll(resetFilters);
  };

  const clearResults = () => {
    setResult('');
    setProducts([]);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Product Service Test
        </h1>

        {/* Компонент фильтров */}
        <div className="mb-8">
          <ProductFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onApplyFilters={handleApplyFilters}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Кнопки тестирования */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Get All Products</h2>
            <button
              onClick={() => testGetAll()}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Get Products with Filters'}
            </button>
            <div className="mt-3 text-sm text-gray-600">
              <p>Использует текущие фильтры:</p>
              <ul className="list-disc list-inside mt-1">
                {filters.name && <li>Name: {filters.name}</li>}
                {filters.brand && <li>Brand: {filters.brand}</li>}
                {filters.categoryId && <li>Category ID: {filters.categoryId}</li>}
                {filters.petTypeId && <li>Pet Type ID: {filters.petTypeId}</li>}
                {filters.minPrice && <li>Min Price: {filters.minPrice}</li>}
                {filters.maxPrice && <li>Max Price: {filters.maxPrice}</li>}
                {filters.rating && <li>Rating: {filters.rating}+</li>}
                {filters.isActive !== null && <li>Active: {filters.isActive ? 'Yes' : 'No'}</li>}
                {filters.isPromotion !== null && <li>Promotion: {filters.isPromotion ? 'Yes' : 'No'}</li>}
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Get Product by ID</h2>
            <div className="space-y-3">
              <input
                type="number"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <button
                onClick={testGetById}
                disabled={loading}
                className="w-full bg-green-500 text-white p-3 rounded hover:bg-green-600 disabled:bg-gray-400"
              >
                {loading ? 'Loading...' : 'Get Product'}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Create Product (Admin)</h2>
            <button
              onClick={testCreateProduct}
              disabled={loading}
              className="w-full bg-purple-500 text-white p-3 rounded hover:bg-purple-600 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : 'Create Test Product'}
            </button>
            <div className="mt-3 text-sm text-gray-600">
              <p>Создает тестовый продукт с:</p>
              <ul className="list-disc list-inside mt-1">
                <li>Category ID: 1</li>
                <li>Pet Type IDs: [1, 2]</li>
                <li>Promotion: true</li>
                <li>Active: true</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Результат */}
        {result && (
          <div className={`mb-6 p-4 rounded ${
            result.includes('ERROR') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
          }`}>
            <div className="flex justify-between items-center">
              <span><strong>Result:</strong> {result}</span>
              <button 
                onClick={clearResults}
                className="text-gray-500 hover:text-gray-700"
              >
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Список продуктов */}
        {products.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Products List ({products.length})</h2>
              <button 
                onClick={clearResults}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Clear List
              </button>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div 
                  key={product.id} 
                  className="border rounded-lg p-4 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setProductId(product.id.toString());
                    setSelectedProduct(product);
                  }}
                >
                  <h3 className="font-medium text-lg text-blue-600">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded">ID: {product.id}</span>
                    <span className="bg-green-100 px-2 py-1 rounded">${product.price}</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">{product.brand}</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">⭐ {product.rating}</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">Qty: {product.quantity}</span>
                    {product.isPromotion && (
                      <span className="bg-red-100 px-2 py-1 rounded text-red-800">🔥 Sale</span>
                    )}
                    {!product.isActive && (
                      <span className="bg-gray-300 px-2 py-1 rounded text-gray-600">Inactive</span>
                    )}
                  </div>
                  {product.productImages && product.productImages.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Images: {product.productImages.length}
                    </div>
                  )}
                  {product.petTypes && product.petTypes.length > 0 && (
                    <div className="mt-2">
                      <div className="flex flex-wrap gap-1">
                        {product.petTypes.map((petType, index) => (
                          <span key={index} className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">
                            {petType.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Детали продукта */}
        {selectedProduct && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Product Details</h2>
              <button 
                onClick={() => setSelectedProduct(null)}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-2xl font-bold text-gray-800">{selectedProduct.name}</h3>
                <p className="text-gray-600 mt-2 text-lg">{selectedProduct.description}</p>
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium">Brand:</span>
                    <span>{selectedProduct.brand}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Price:</span>
                    <span className="text-green-600 font-bold">${selectedProduct.price}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Cost Price:</span>
                    <span>${selectedProduct.costPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Quantity:</span>
                    <span>{selectedProduct.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Rating:</span>
                    <span className="flex items-center">
                      ⭐ {selectedProduct.rating}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Category ID:</span>
                    <span>{selectedProduct.categoryId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Promotion:</span>
                    <span className={selectedProduct.isPromotion ? "text-green-600" : "text-gray-600"}>
                      {selectedProduct.isPromotion ? 'Yes' : 'No'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Active:</span>
                    <span className={selectedProduct.isActive ? "text-green-600" : "text-red-600"}>
                      {selectedProduct.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div>
                {selectedProduct.petTypes && selectedProduct.petTypes.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 text-lg">Pet Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.petTypes.map((petType, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-3 py-2 rounded-lg text-sm font-medium">
                          {petType.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProduct.productImages && selectedProduct.productImages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-3 text-lg">Product Images ({selectedProduct.productImages.length}):</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedProduct.productImages.map((image, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden">
                          <img 
                            src={image.imageUrl} 
                            alt={image.altText || selectedProduct.name}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2 text-xs text-gray-600">
                            {image.altText || 'No description'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}