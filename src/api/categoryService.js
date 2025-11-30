import {API_CONFIG} from '@/config/api'

export class CategoryService{
     constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/category`;
  }

  async getAllAsync(){
     try {
      const response = await fetch(this.baseUrl, {
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

      const categories = await response.json();
      console.log('Products fetched successfully:', categories);
      return categories;

    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

 async insert(categoryRequest) {
    try {
      console.log('Creating product:', categoryRequest);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(categoryRequest)
      });

      console.log('Response status:', response.status);

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

      const createdCategory = await response.json();
      console.log('Insert successful, created category:', createdCategory);
      return createdCategory;

    } catch (error) {
      console.error('Error creating ctegory', error);
      throw error;
    }
  }

 async deleteById(id) {
    try {
      console.log('Deleting category with ID:', id);

      const response = await fetch(`${this.baseUrl}/${id}`, {
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

      console.log('category deleted successfully');
      return { success: true, message: 'category deleted successfully' };

    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}
export const categoryService = new CategoryService();