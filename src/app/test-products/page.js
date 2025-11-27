'use client';
import { useState } from 'react';
import {ProductQueryParameters, ProductRequest} from "@/models/product"
import { productService} from '@/api/productService';

export default function TestProductsPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);

  const testGetAll = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const params = new ProductQueryParameters();
      params.page = 1;
      params.pageSize = 5;
      
      const productsData = await productService.getAllWithFilterAndPagination(params);
      setProducts(productsData);
      setResult(`SUCCESS: Found ${productsData.length} products`);
      
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

  const clearResults = () => {
    setResult('');
    setProducts([]);
    setSelectedProduct(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Product Service Test
        </h1>

        {/* Кнопки тестирования */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Get All Products</h2>
            <button
              onClick={testGetAll}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? 'Loading...' : 'Get Products (First 5)'}
            </button>
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
            <h2 className="text-xl font-semibold mb-4">Products List ({products.length})</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-4 hover:shadow-lg transition-shadow">
                  <h3 className="font-medium text-lg text-blue-600">{product.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{product.description}</p>
                  <div className="flex flex-wrap gap-2 mt-3 text-xs">
                    <span className="bg-gray-100 px-2 py-1 rounded">ID: {product.id}</span>
                    <span className="bg-green-100 px-2 py-1 rounded">${product.price}</span>
                    <span className="bg-blue-100 px-2 py-1 rounded">{product.brand}</span>
                    <span className="bg-yellow-100 px-2 py-1 rounded">⭐ {product.rating}</span>
                    <span className="bg-purple-100 px-2 py-1 rounded">Qty: {product.quantity}</span>
                  </div>
                  {product.productImages && product.productImages.length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      Images: {product.productImages.length}
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
            <h2 className="text-xl font-semibold mb-4">Product Details</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium">{selectedProduct.name}</h3>
                <p className="text-gray-600 mt-2">{selectedProduct.description}</p>
                <div className="mt-4 space-y-2">
                  <p><strong>Brand:</strong> {selectedProduct.brand}</p>
                  <p><strong>Price:</strong> ${selectedProduct.price}</p>
                  <p><strong>Cost Price:</strong> ${selectedProduct.costPrice}</p>
                  <p><strong>Quantity:</strong> {selectedProduct.quantity}</p>
                  <p><strong>Rating:</strong> {selectedProduct.rating}</p>
                  <p><strong>Category ID:</strong> {selectedProduct.categoryId}</p>
                  <p><strong>Promotion:</strong> {selectedProduct.isPromotion ? 'Yes' : 'No'}</p>
                  <p><strong>Active:</strong> {selectedProduct.isActive ? 'Yes' : 'No'}</p>
                </div>
              </div>
              
              <div>
                {selectedProduct.petTypes && selectedProduct.petTypes.length > 0 && (
                  <div className="mb-4">
                    <h4 className="font-medium mb-2">Pet Types:</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.petTypes.map((petType, index) => (
                        <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                          {petType.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {selectedProduct.productImages && selectedProduct.productImages.length > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Product Images ({selectedProduct.productImages.length}):</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProduct.productImages.map((image, index) => (
                        <img 
                          key={index}
                          src={image.imageUrl} 
                          alt={image.altText}
                          className="w-full h-20 object-cover rounded border"
                        />
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