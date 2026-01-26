import {ProductQueryParameters, ProductRequest} from "@/models/product";
import { API_CONFIG } from '@/config/api';

export class ProductService {
  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/product`;
  }
  
  async getAllWithFilterAndPagination(parameters = new ProductQueryParameters()) {
    try {
      //cтроим query string из параметров
      const queryParams = new URLSearchParams();
      
      Object.keys(parameters).forEach(key => {
        if (parameters[key] !== null && parameters[key] !== undefined) {
          queryParams.append(key, parameters[key]);
        }
      });

      const url = `${this.baseUrl}?${queryParams.toString()}`;
      console.log('Fetching products from:', url);

      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.Message || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const products = await response.json();
      console.log('Products fetched successfully:', products);
      return products;

    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  //GET /api/product/{id} -получить продукт по ID
  async getByIdWithAllInfo(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.Message || `HTTP error! status: ${response.status}`);
        }
        if (response.status === 204) {
        throw new Error('Product not found');
      }
      const product = await response.json();
      console.log('Product fetched successfully:', product);
      return product;

    } catch (error) {
      console.error('Error fetching product by ID:', error);
      throw error;
    }
  }

  //POST /api/product/admin - создать продукт (только для админов)
  async insertProduct(productRequest) {
    try {
      console.log('Creating product:', productRequest);

      const response = await fetch(`${this.baseUrl}/admin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.Message || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const createdProduct = await response.json();
      console.log('Product created successfully:', createdProduct);
      return createdProduct;

    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  //PATCH /api/product/admin/{id} обновить продукт (только для админов)
  async updateById(id, productRequest) {
    try {
      console.log('Updating product:', { id, ...productRequest });

      const response = await fetch(`${this.baseUrl}/admin/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.Message || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      const updatedProduct = await response.json();
      console.log('Product updated successfully:', updatedProduct);
      return updatedProduct;

    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  //DELETE /api/product/admin/{id} -удалить продукт (только для админв)
  async deleteById(id) {
    try {
      console.log('Deleting product with ID:', id);

      const response = await fetch(`${this.baseUrl}/admin/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `HTTP error! status: ${response.status}`;
        
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.Message || errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        throw new Error(errorMessage);
      }

      console.log('Product deleted successfully');
      return { success: true, message: 'Product deleted successfully' };

    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  //методы для работы с параметрами запроса
  createQueryParameters(params = {}) {
    const queryParams = new ProductQueryParameters();
    return { ...queryParams, ...params };
  }

  //ля создания нового ProductRequest с дефолтными значениями
  createProductRequest(initialData = {}) {
    const request = new ProductRequest();
    return { ...request, ...initialData };
  }
}

export const productService = new ProductService();