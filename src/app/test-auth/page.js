'use client';
import { useState } from 'react';
import { adminService } from '@/api/adminService';
import { authService } from '@/api/authService';
import { AdminLoginRequest } from '@/models/admin';

export default function TestAuthPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    login: '',
    password: ''
  });

  const testLogin = async () => {
    setLoading(true);
    try {
      const loginData = new AdminLoginRequest();
      loginData.login = form.login;
      loginData.password = form.password;

      // Тестируем логин
      const adminResponse = await adminService.login(loginData);
      console.log('Admin Response:', adminResponse);

      // Тестируем получение токена
      const token = await authService.getTokenByApiKey(adminResponse.apiKey);
      console.log('JWT Token:', token);

      setResult({
        success: true,
        admin: adminResponse,
        token: token,
        savedApiKey: adminService.apiKey,
        savedToken: authService.token
      });
    } catch (error) {
      console.error('Test failed:', error);
      setResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testLogout = () => {
    adminService.logout();
    authService.logout();
    setResult(null);
    console.log('Logged out');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Test Auth Services</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Login"
          value={form.login}
          onChange={(e) => setForm({...form, login: e.target.value})}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({...form, password: e.target.value})}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <button 
          onClick={testLogin} 
          disabled={loading}
          style={{ padding: '5px 10px' }}
        >
          {loading ? 'Testing...' : 'Test Login'}
        </button>
        <button 
          onClick={testLogout}
          style={{ marginLeft: '10px', padding: '5px 10px' }}
        >
          Logout
        </button>
      </div>

      {result && (
        <div style={{ 
          padding: '15px', 
          border: `2px solid ${result.success ? 'green' : 'red'}`,
          borderRadius: '5px'
        }}>
          {result.success ? (
            <div>
              <h3>✅ Success!</h3>
              <pre>{JSON.stringify(result, null, 2)}</pre>
              <div>
                <h4>Saved in localStorage:</h4>
                <p>API Key: {localStorage.getItem('adminApiKey')}</p>
                <p>Token: {localStorage.getItem('adminToken')?.substring(0, 50)}...</p>
                <p>Admin Data: {localStorage.getItem('adminData')}</p>
              </div>
            </div>
          ) : (
            <div>
              <h3>❌ Error:</h3>
              <p>{result.error}</p>
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => console.log('AdminService:', adminService)}
          style={{ marginRight: '10px', padding: '5px 10px' }}
        >
          Log AdminService
        </button>
        <button 
          onClick={() => console.log('AuthService:', authService)}
          style={{ padding: '5px 10px' }}
        >
          Log AuthService
        </button>
      </div>
    </div>
  );
}