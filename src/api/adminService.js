import { API_CONFIG } from '@/config/api';
import { AdminResponse } from '@/models/admin';
export class AdminService {
  constructor() {
    this.apiKey = null;
    this.currentAdmin = null;
  }
  setApiKey(apiKey) {
    this.apiKey = apiKey;
  }
  setCurrentAdmin(admin) {
    this.currentAdmin = admin;
    localStorage.setItem('adminData', JSON.stringify(admin));
  }
  async register(adminData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN.REGISTER}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
        },
          body: JSON.stringify(adminData),
          credentials: 'include'
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const apiKey = await response.text();
      this.apiKey = apiKey;
      return apiKey;
    } catch (error) {
      console.error('Error registering admin:', error);
      throw error;
    }
  }
  async login(loginData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ADMIN.LOGIN}`,
        {
          method: 'POST',
           headers: {
            'Content-Type': 'application/json'
        },
          body: JSON.stringify(loginData),
          credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const apiKey = await response.text();
      //console.log('apiAdmin: '+ apiKey);
      this.setApiKey(apiKey);
      
      return apiKey;
    } catch (error) {
      console.error('Error logging in admin:', error);
      throw error;
    }
  }

  async getAdmin(apiKey){
     try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${'/api/admin'}`,
        {
          method: 'GET',
          headers: {
          'X-API-Key': apiKey,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const adminResponseData = await response.json();
      const adminResponse = new AdminResponse();
      Object.assign(adminResponse, adminResponseData);
      
      this.setCurrentAdmin(adminResponse);
      
      return adminResponse;
    } catch (error) {
      console.error('Failed to fetch admin:', error);
      throw error;
    }
  }
  //восстановление из localStorage
  loadFromStorage() {
    if (typeof window !== 'undefined') {
      const savedAdmin = localStorage.getItem('adminData');
      if (savedAdmin) {
        this.currentAdmin = new AdminResponse();
        Object.assign(this.currentAdmin, JSON.parse(savedAdmin));
      }
    }
  }

 async logout() {
    this.apiKey = null;
    this.currentAdmin = null;

    try {
    //вызываем logout на бэкенде чтобы удалить cookies
    await fetch(`${API_CONFIG.BASE_URL}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Backend logout error:', error);
  } finally {
    //очищаем фронтенд в любом случае
    this.apiKey = null;
    this.currentAdmin = null;
    localStorage.removeItem('adminData');
    
    //удаляем cookies на фронтенде
    document.cookie = 'adminToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  }
  
  }
}

export const adminService = new AdminService();
//загружаем сохраненные данные при страте
adminService.loadFromStorage();