import { API_CONFIG } from '@/config/api';

export class ProductImageRequest {
  constructor() {
    this.imageName = '';
    this.altText = '';
    this.productId = 0;
  }
}

export class ProductImageService {
  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/image`;
  }

  async insert(productImageRequest) {
    try {
      console.log('Sending insert request:', productImageRequest);
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(productImageRequest)
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Error response:', errorText);
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.Message || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }
      console.log('Insert successful - empty response');
      return { success: true, message: 'Image added successfully' };

    } catch (error) {
      console.error('Error inserting product image:', error);
      throw error;
    }
  }

  //удаление изображения по имени
  async deleteByName(name) {
    try {
      console.log('Deleting image with name:', name);
      
      const response = await fetch(`${this.baseUrl}?name=${encodeURIComponent(name)}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      console.log('Delete response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log('Delete error response:', errorText);
        
        let errorMessage = `HTTP error! status: ${response.status}`;
        if (errorText) {
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.Message || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
        }
        
        throw new Error(errorMessage);
      }

      //для успешного Ok() без контента
      console.log('Delete successful - empty response');
      return { success: true, message: 'Image deleted successfully' };

    } catch (error) {
      console.error('Error deleting product image:', error);
      throw error;
    }
  }

  //получение всех изображений для тестирования
  async getAll() {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting product images:', error);
      throw error;
    }
  }

  //получение изображения по id
  async getById(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting product image by id:', error);
      throw error;
    }
  }
}

export const productImageService = new ProductImageService();