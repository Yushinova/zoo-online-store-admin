import { API_CONFIG } from '@/config/api';//не работает

export class ProductImageService {
  // Добавление информации об изображении в БД
  static async addImageToProduct(imageData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(imageData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || `Failed to add image: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding image to database:', error);
      throw error;
    }
  }

  // Удаление изображения из БД
  static async deleteProductImage(imageId) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/image/${imageId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || `Failed to delete image: ${response.status}`);
      }

      return true;
    } catch (error) {
      console.error('Error deleting image from database:', error);
      throw error;
    }
  }
}