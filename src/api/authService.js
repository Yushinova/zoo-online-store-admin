import { API_CONFIG } from '@/config/api'; // Добавь этот импорт
export class AuthService {
  constructor() {
    this.token = null;
  }

  // setToken(token) {
  //   this.token = token;
  //   localStorage.setItem('adminToken', token);
  //   document.cookie = `adminToken=${token}; path=/; max-age=86400`; // 24 часа
  // }

  async getTokenByApiKey(apiKey) {
    try {

       const requestBody = {
        apiKey: apiKey
      };
      const response = await fetch(
      `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN.AUTH}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      }
    );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const token = await response.text();
      //this.setToken(token);
      return token;
    } catch (error) {
      console.error('Error getting token by API key:', error);
      throw error;
    }
  }

  logout() {
    this.token = null;
    //localStorage.removeItem('adminToken');
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
}

export const authService = new AuthService();